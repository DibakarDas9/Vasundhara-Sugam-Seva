'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  loadMarketplaceListings,
  saveMarketplaceListings,
  type MarketplaceCoordinates,
  type MarketplaceListing,
  type MarketplaceRole,
} from '@/lib/marketplaceStore';
import {
  CalendarDaysIcon,
  MapPinIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

type MarketplaceFormState = {
  itemName: string;
  expiryDate: string;
  location: string;
};

const initialFormState: MarketplaceFormState = {
  itemName: '',
  expiryDate: '',
  location: '',
};

const MARKETPLACE_LOCATION_KEY = 'vasundhara_marketplace_location';
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

type RemoteMarketplaceListing = {
  id: string;
  title: string;
  expiryDate: string;
  location: string;
  postedBy: string;
  postedTime: string;
  createdAt: number;
};

function normalizeLocation(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function formatDate(value: string) {
  if (!value) return 'Not provided';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getSavedMarketplaceLocation() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(MARKETPLACE_LOCATION_KEY) || '';
}

function saveMarketplaceLocation(location: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MARKETPLACE_LOCATION_KEY, location);
}

async function reverseGeocodeLocation(coords: MarketplaceCoordinates) {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`,
    );
    const data = await response.json();
    const parts = [
      data.locality,
      data.city,
      data.principalSubdivision,
      data.countryName,
    ].filter(Boolean);

    return Array.from(new Set(parts)).join(', ');
  } catch {
    return '';
  }
}

function getBrowserLocation(): Promise<MarketplaceCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      reject,
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

function toMarketplaceListing(listing: RemoteMarketplaceListing): MarketplaceListing {
  return {
    id: listing.id,
    title: listing.title,
    description: `Expires on ${formatDate(listing.expiryDate)}`,
    category: 'Surplus',
    quantity: 1,
    unit: 'item',
    price: 0,
    originalPrice: 0,
    location: listing.location,
    postedBy: listing.postedBy,
    postedTime: listing.postedTime,
    image: '/hero-slides/marketplace.png',
    isFree: true,
    rating: 5,
    pickupTime: listing.expiryDate,
    ownerId: 'remote-user',
    ownerRole: 'household',
    coordinates: { lat: 0, lng: 0 },
    radiusKm: 0,
    status: 'available',
    createdAt: listing.createdAt,
  };
}

function MarketplaceContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [formData, setFormData] = useState<MarketplaceFormState>(initialFormState);
  const [currentLocation, setCurrentLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationDialogOpen, setLocationDialogOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedLocation = getSavedMarketplaceLocation();
    if (savedLocation) {
      setCurrentLocation(savedLocation);
      setLocationInput(savedLocation);
      setFormData(prev => ({ ...prev, location: savedLocation }));
      setLocationDialogOpen(false);
    } else {
      setListings(loadMarketplaceListings());
    }
  }, []);

  useEffect(() => {
    if (!statusMessage) return;

    const timeout = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const visibleListings = useMemo(() => {
    const activeLocation = normalizeLocation(currentLocation);
    if (!activeLocation) return [];

    return listings
      .filter(listing => normalizeLocation(listing.location) === activeLocation)
      .sort((left, right) => right.createdAt - left.createdAt);
  }, [currentLocation, listings]);

  const handleFormChange = (field: keyof MarketplaceFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const refreshListings = async (location: string) => {
    if (!API_BASE) {
      setListings(loadMarketplaceListings());
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/marketplace?location=${encodeURIComponent(location)}`);
      if (!response.ok) throw new Error('Marketplace fetch failed');

      const data = await response.json();
      const remoteListings = Array.isArray(data.listings) ? data.listings : [];
      setListings(remoteListings.map(toMarketplaceListing));
    } catch {
      setListings(loadMarketplaceListings());
      setStatusMessage('Using locally saved marketplace listings because the API is unavailable.');
    }
  };

  useEffect(() => {
    if (!currentLocation) return;
    refreshListings(currentLocation);
  }, [currentLocation]);

  const handleUseLocation = (location: string) => {
    const nextLocation = location.trim();
    if (!nextLocation) {
      setStatusMessage('Please enter a location to view marketplace listings.');
      return;
    }

    saveMarketplaceLocation(nextLocation);
    setCurrentLocation(nextLocation);
    setLocationInput(nextLocation);
    setFormData(prev => ({ ...prev, location: prev.location || nextLocation }));
    setLocationDialogOpen(false);
  };

  const fetchLocationName = async (target: 'dialog' | 'form') => {
    setIsFetchingLocation(true);
    setStatusMessage(null);

    try {
      const coords = await getBrowserLocation();
      const locationName = await reverseGeocodeLocation(coords);
      const nextLocation = locationName || `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`;

      if (target === 'dialog') {
        setLocationInput(nextLocation);
      } else {
        setFormData(prev => ({ ...prev, location: nextLocation }));
      }
    } catch {
      setStatusMessage('Unable to fetch your location. Please type your location manually.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleListingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.itemName.trim() || !formData.expiryDate || !formData.location.trim()) {
      setStatusMessage('Enter item name, expiry date, and location before listing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ownerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Marketplace user';
      const listingPayload = {
        title: formData.itemName.trim(),
        expiryDate: formData.expiryDate,
        location: formData.location.trim(),
        postedBy: ownerName,
      };
      const fallbackListing: MarketplaceListing = {
        id: `market_${Date.now()}`,
        title: listingPayload.title,
        description: `Expires on ${formatDate(formData.expiryDate)}`,
        category: 'Surplus',
        quantity: 1,
        unit: 'item',
        price: 0,
        originalPrice: 0,
        location: listingPayload.location,
        postedBy: ownerName,
        postedTime: 'Just now',
        image: '/hero-slides/marketplace.png',
        isFree: true,
        rating: 5,
        pickupTime: formData.expiryDate,
        ownerId: user?.id || 'local-user',
        ownerRole: (user?.role || 'household') as MarketplaceRole,
        coordinates: { lat: 0, lng: 0 },
        radiusKm: 0,
        status: 'available',
        createdAt: Date.now(),
      };

      let savedRemotely = false;

      if (API_BASE) {
        try {
          const response = await fetch(`${API_BASE}/api/marketplace`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listingPayload),
          });
          if (!response.ok) throw new Error('Marketplace save failed');

          const data = await response.json();
          const remoteListing = data.listing ? toMarketplaceListing(data.listing) : fallbackListing;
          setListings(prev => [remoteListing, ...prev]);
          savedRemotely = true;
        } catch {
          const nextListings = [fallbackListing, ...loadMarketplaceListings()];
          saveMarketplaceListings(nextListings);
          setListings(nextListings);
        }
      } else {
        const nextListings = [fallbackListing, ...loadMarketplaceListings()];
        saveMarketplaceListings(nextListings);
        setListings(nextListings);
      }

      setCurrentLocation(listingPayload.location);
      saveMarketplaceLocation(listingPayload.location);
      setStatusMessage(
        API_BASE && !savedRemotely
          ? 'The API is unavailable, so this item was saved locally.'
          : 'Item listed. Users searching from the same location can now see it.',
      );
      setFormData({ ...initialFormState, location: listingPayload.location });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    formData.itemName.trim() &&
    formData.expiryDate &&
    formData.location.trim(),
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={t('market.title', 'Marketplace')}
          subtitle="List surplus items and view items from your selected location"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">List item</CardTitle>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add an item name, expiry date, and location. Items appear only for users using the same location.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  icon={<MapPinIcon className="h-4 w-4" />}
                  onClick={() => setLocationDialogOpen(true)}
                >
                  Change location
                </Button>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleListingSubmit}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="Item name"
                      placeholder="e.g., Rice, tomatoes, milk"
                      value={formData.itemName}
                      onChange={(event) => handleFormChange('itemName', event.target.value)}
                      required
                    />
                    <Input
                      label="Expiry date"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(event) => handleFormChange('expiryDate', event.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <Input
                      label="Location"
                      placeholder="Enter area, ward, society, or locality"
                      value={formData.location}
                      onChange={(event) => handleFormChange('location', event.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      icon={<MapPinIcon className="h-4 w-4" />}
                      loading={isFetchingLocation}
                      onClick={() => fetchLocationName('form')}
                    >
                      Auto fetch
                    </Button>
                  </div>

                  {statusMessage && (
                    <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
                      {statusMessage}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current marketplace location: <span className="font-semibold text-gray-800 dark:text-gray-100">{currentLocation || 'Not set'}</span>
                    </p>
                    <Button
                      type="submit"
                      icon={<PlusIcon className="h-4 w-4" />}
                      loading={isSubmitting}
                      disabled={!isFormValid || isSubmitting}
                    >
                      List item
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <section className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Items near you</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing listings for {currentLocation || 'your selected location'}.
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {visibleListings.length} item{visibleListings.length === 1 ? '' : 's'}
                </span>
              </div>

              {visibleListings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {visibleListings.map(listing => (
                    <Card key={listing.id}>
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{listing.title}</h3>
                            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <MapPinIcon className="h-4 w-4" />
                              {listing.location}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                            Available
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-neutral-900">
                            <CalendarDaysIcon className="h-4 w-4" />
                            Expires {formatDate(listing.pickupTime)}
                          </span>
                          <span className="rounded-lg bg-gray-100 px-3 py-2 dark:bg-neutral-900">
                            Listed by {listing.postedBy}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="py-12 text-center">
                  <CardContent>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
                      <MapPinIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">No items for this location yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      List an item above, or change your marketplace location to see items listed there.
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </main>
      </div>

      {locationDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-950">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enter marketplace location</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Items are shown only when your location matches the listing location.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Location"
                placeholder="Area, ward, society, or locality"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  icon={<MapPinIcon className="h-4 w-4" />}
                  loading={isFetchingLocation}
                  onClick={() => fetchLocationName('dialog')}
                >
                  Auto fetch
                </Button>
                <Button type="button" onClick={() => handleUseLocation(locationInput)}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <MarketplaceContent />
    </ProtectedRoute>
  );
}
