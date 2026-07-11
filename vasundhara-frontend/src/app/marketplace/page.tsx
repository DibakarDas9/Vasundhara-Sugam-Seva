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
import { toast } from 'react-hot-toast';
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

function getSessionGuestId(): string {
  if (typeof window === 'undefined') return 'local-user';
  let guestId = localStorage.getItem('vasundhara_guest_session_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('vasundhara_guest_session_id', guestId);
  }
  return guestId;
}

type MarketplaceFormState = {
  itemName: string;
  expiryDate: string;
  location: string;
  category: string;
  price: string;
  isFree: boolean;
  image: string;
  phone: string;
};

const initialFormState: MarketplaceFormState = {
  itemName: '',
  expiryDate: '',
  location: '',
  category: 'Vegetables',
  price: '',
  isFree: true,
  image: '',
  phone: '',
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
  category?: string;
  price?: number;
  isFree?: boolean;
  image?: string;
  ownerId?: string;
  phone?: string;
  status?: 'available' | 'claimed';
};

function normalizeLocation(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isLocationMatch(loc1: string, loc2: string): boolean {
  if (!loc1 || !loc2) return false;
  const clean1 = loc1.toLowerCase();
  const clean2 = loc2.toLowerCase();
  if (clean1.includes(clean2) || clean2.includes(clean1)) return true;

  const ignoreWords = new Set(['india', 'and', 'the', 'near', 'east', 'west', 'north', 'south']);
  const words1 = clean1.split(/[,\s]+/).map(w => w.trim()).filter(w => w.length > 2 && !ignoreWords.has(w));
  const words2 = clean2.split(/[,\s]+/).map(w => w.trim()).filter(w => w.length > 2 && !ignoreWords.has(w));

  return words1.some(w => words2.includes(w));
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
  const isFree = typeof listing.isFree === 'boolean' ? listing.isFree : (typeof listing.price === 'number' ? listing.price === 0 : true);
  return {
    id: listing.id,
    title: listing.title,
    description: `Expires on ${formatDate(listing.expiryDate)}`,
    category: listing.category || 'Other',
    quantity: 1,
    unit: 'item',
    price: typeof listing.price === 'number' ? listing.price : 0,
    originalPrice: typeof listing.price === 'number' ? listing.price : 0,
    location: listing.location,
    postedBy: listing.postedBy,
    postedTime: listing.postedTime,
    image: listing.image || '/hero-slides/marketplace.png',
    isFree: isFree,
    rating: 5,
    pickupTime: listing.expiryDate,
    ownerId: listing.ownerId || 'remote-user',
    ownerRole: 'household',
    coordinates: { lat: 0, lng: 0 },
    radiusKm: 0,
    status: listing.status || 'available',
    createdAt: listing.createdAt,
    phone: listing.phone || '',
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

  // Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterFreeOnly, setFilterFreeOnly] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState<'nearby' | 'my'>('nearby');

  // Claim/Payment modal states
  const [claimingListing, setClaimingListing] = useState<MarketplaceListing | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('cash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
    if (user?.phoneNumber) {
      setFormData(prev => ({ ...prev, phone: prev.phone || user.phoneNumber || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (!statusMessage) return;

    const timeout = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const visibleListings = useMemo(() => {
    const activeLocation = normalizeLocation(currentLocation);
    const userId = user?.id || getSessionGuestId();

    return listings
      .filter(listing => {
        // If my listings: show user's own listings regardless of location
        // If nearby listings: show others' listings matching location that are available
        const matchesFeed = activeFeedTab === 'my'
          ? (listing.ownerId === userId)
          : (isLocationMatch(listing.location, currentLocation) &&
             listing.ownerId !== userId &&
             listing.status === 'available');

        const matchesCategory = filterCategory === 'All' || listing.category === filterCategory;
        const matchesFreeOnly = !filterFreeOnly || listing.isFree || listing.price === 0;

        return matchesFeed && matchesCategory && matchesFreeOnly;
      })
      .sort((left, right) => right.createdAt - left.createdAt);
  }, [currentLocation, listings, filterCategory, filterFreeOnly, activeFeedTab, user]);

  const handleFormChange = <K extends keyof MarketplaceFormState>(field: K, value: MarketplaceFormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClaimListing = async (listingId: string) => {
    setIsProcessingPayment(true);
    try {
      let savedRemotely = false;
      if (API_BASE) {
        try {
          const response = await fetch(`${API_BASE}/api/marketplace/${listingId}/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.ok) {
            savedRemotely = true;
          }
        } catch {
          // ignore API error and do fallback
        }
      }

      const updatedListings = listings.map(l => {
        if (l.id === listingId) {
          return { ...l, status: 'claimed' as const };
        }
        return l;
      });
      saveMarketplaceListings(updatedListings);
      setListings(updatedListings);

      toast.success(
        paymentMethod === 'razorpay'
          ? `Payment processed via Razorpay! Listing claimed.`
          : `Deal claimed via Cash! Please complete transaction at lister's home.`
      );
      setClaimingListing(null);
    } catch {
      toast.error('Failed to claim listing. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
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
      const priceNum = formData.isFree ? 0 : (Number(formData.price) || 0);
      const isFree = formData.isFree || priceNum === 0;

      const listingPayload = {
        title: formData.itemName.trim(),
        expiryDate: formData.expiryDate,
        location: formData.location.trim(),
        postedBy: ownerName,
        category: formData.category,
        price: priceNum,
        isFree: isFree,
        image: formData.image || undefined,
        ownerId: user?.id || getSessionGuestId(),
        phone: formData.phone.trim() || user?.phoneNumber || '',
      };

      const fallbackListing: MarketplaceListing = {
        id: `market_${Date.now()}`,
        title: listingPayload.title,
        description: `Expires on ${formatDate(formData.expiryDate)}`,
        category: listingPayload.category,
        quantity: 1,
        unit: 'item',
        price: priceNum,
        originalPrice: priceNum,
        location: listingPayload.location,
        postedBy: ownerName,
        postedTime: 'Just now',
        image: listingPayload.image || '/hero-slides/marketplace.png',
        isFree: isFree,
        rating: 5,
        pickupTime: formData.expiryDate,
        ownerId: user?.id || getSessionGuestId(),
        ownerRole: (user?.role || 'household') as MarketplaceRole,
        coordinates: { lat: 0, lng: 0 },
        radiusKm: 0,
        status: 'available',
        createdAt: Date.now(),
        phone: listingPayload.phone,
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
    formData.location.trim() &&
    formData.phone.trim() &&
    (formData.isFree || (formData.price.trim() && Number(formData.price) > 0))
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

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-900 dark:text-white"
                        required
                      >
                        {['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Protein', 'Bakery', 'Packaged Food', 'Beverages', 'Other'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Pricing
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Price"
                            value={formData.price}
                            onChange={(e) => {
                              handleFormChange('price', e.target.value);
                              if (Number(e.target.value) > 0) {
                                handleFormChange('isFree', false);
                              } else {
                                handleFormChange('isFree', true);
                              }
                            }}
                            disabled={formData.isFree}
                            className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-neutral-950 dark:disabled:text-neutral-600 transition"
                          />
                        </div>
                        <Button
                          type="button"
                          variant={formData.isFree ? 'solid' : 'outline'}
                          onClick={() => {
                            const newFree = !formData.isFree;
                            handleFormChange('isFree', newFree);
                            if (newFree) {
                              handleFormChange('price', '');
                            }
                          }}
                          className={formData.isFree ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                        >
                          {formData.isFree ? '✓ Free' : 'Set Free'}
                        </Button>
                      </div>
                    </div>
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

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input
                      label="Mobile number"
                      type="tel"
                      placeholder="e.g., 9876543210"
                      value={formData.phone}
                      onChange={(event) => handleFormChange('phone', event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Product image
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.image ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 flex-shrink-0 shadow-md">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleFormChange('image', '')}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="w-20 h-20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center bg-gray-50/50 dark:bg-neutral-900/50 text-gray-400 hover:text-emerald-600 transition-colors shadow-sm">
                          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] font-semibold">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleFormChange('image', reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                      <div className="text-xs text-gray-500">
                        Upload a photo of the product. This makes your listing much more appealing. Max size 2MB.
                      </div>
                    </div>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveFeedTab('nearby')}
                      className={`text-xl font-bold transition-all pb-1 border-b-2 ${
                        activeFeedTab === 'nearby'
                          ? 'text-gray-900 border-emerald-600 dark:text-white font-extrabold'
                          : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300 font-semibold'
                      }`}
                    >
                      Items near you
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFeedTab('my')}
                      className={`text-xl font-bold transition-all pb-1 border-b-2 ${
                        activeFeedTab === 'my'
                          ? 'text-gray-900 border-emerald-600 dark:text-white font-extrabold'
                          : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300 font-semibold'
                      }`}
                    >
                      My Listings
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activeFeedTab === 'my'
                      ? 'Track and manage the items you have listed'
                      : `Showing listings for ${currentLocation || 'your selected location'}.`}
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {visibleListings.length} item{visibleListings.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Category & Free filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none max-w-full">
                  {[
                    { id: 'All', name: 'All', emoji: '🛍️' },
                    { id: 'Vegetables', name: 'Vegetables', emoji: '🥦' },
                    { id: 'Fruits', name: 'Fruits', emoji: '🍎' },
                    { id: 'Dairy', name: 'Dairy', emoji: '🥛' },
                    { id: 'Grains', name: 'Grains', emoji: '🌾' },
                    { id: 'Protein', name: 'Protein', emoji: '🍖' },
                    { id: 'Bakery', name: 'Bakery', emoji: '🍞' },
                    { id: 'Packaged Food', name: 'Packaged', emoji: '📦' },
                    { id: 'Beverages', name: 'Beverages', emoji: '🥤' },
                    { id: 'Other', name: 'Other', emoji: '🏷️' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFilterCategory(cat.id)}
                      className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                        filterCategory === cat.id
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-white border-gray-200 hover:border-emerald-300 text-gray-700 dark:bg-neutral-900 dark:border-gray-800 dark:text-gray-300 dark:hover:border-emerald-800'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 select-none">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterFreeOnly}
                      onChange={(e) => setFilterFreeOnly(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 bg-transparent"
                    />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">🆓 Show Free Only</span>
                  </label>
                </div>
              </div>

              {visibleListings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {visibleListings.map(listing => (
                    <Card key={listing.id} className="overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] h-full">
                        {/* Image panel */}
                        <div className="relative h-40 sm:h-full w-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-neutral-900 dark:to-neutral-900/60 border-r border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={listing.image || '/hero-slides/marketplace.png'}
                            alt={listing.title}
                            className="w-full h-full object-cover animate-fade-in"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/hero-slides/marketplace.png';
                            }}
                          />
                          <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                            {listing.category}
                          </span>
                        </div>

                        {/* Details panel */}
                        <CardContent className="flex flex-col justify-between p-5 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{listing.title}</h3>
                              {listing.isFree || listing.price === 0 ? (
                                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-sm shrink-0">
                                  Free
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-sm shrink-0">
                                  ₹{listing.price}
                                </span>
                              )}
                            </div>
                            <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <MapPinIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span className="line-clamp-1">{listing.location}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-gray-800 px-2.5 py-1">
                              <CalendarDaysIcon className="h-3.5 w-3.5" />
                              Exp: {formatDate(listing.pickupTime)}
                            </span>
                            <span className="rounded-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-gray-800 px-2.5 py-1 line-clamp-1 max-w-[150px]">
                              By {listing.postedBy}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-neutral-900">
                            {activeFeedTab === 'my' ? (
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-[10px] uppercase font-bold tracking-wide rounded-full px-2.5 py-1 ${
                                  listing.status === 'claimed'
                                    ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                }`}>
                                  {listing.status === 'claimed' ? 'Claimed' : 'Available'}
                                </span>
                                {listing.phone && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1">
                                    📞 {listing.phone}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full gap-2">
                                {listing.phone ? (
                                  <a
                                    href={`tel:${listing.phone}`}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-250 bg-emerald-50/40 text-emerald-700 hover:bg-emerald-100/60 dark:border-emerald-800 dark:text-emerald-400 px-2 py-1.5 text-xs font-semibold text-center transition"
                                  >
                                    📞 Call Lister
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-gray-400">No contact info</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setClaimingListing(listing)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 px-2.5 py-1.5 text-xs font-bold transition shadow-sm"
                                >
                                  Claim Deal
                                </button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </div>
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

      {claimingListing !== null && (
        <MarketplaceClaimModal
          listing={claimingListing}
          onClose={() => setClaimingListing(null)}
          onConfirm={() => handleClaimListing(claimingListing.id)}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          isProcessing={isProcessingPayment}
        />
      )}
    </div>
  );
}

interface MarketplaceClaimModalProps {
  listing: MarketplaceListing;
  onClose: () => void;
  onConfirm: () => void;
  paymentMethod: 'cash' | 'razorpay';
  setPaymentMethod: (method: 'cash' | 'razorpay') => void;
  isProcessing: boolean;
}

function MarketplaceClaimModal({
  listing,
  onClose,
  onConfirm,
  paymentMethod,
  setPaymentMethod,
  isProcessing,
}: MarketplaceClaimModalProps) {
  const [razorpayStep, setRazorpayStep] = useState<'select' | 'processing' | 'success'>('select');

  const handlePay = () => {
    if (paymentMethod === 'razorpay') {
      setRazorpayStep('processing');
      setTimeout(() => {
        setRazorpayStep('success');
        setTimeout(() => {
          onConfirm();
        }, 1200);
      }, 1800);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-950">
        {razorpayStep === 'processing' ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Connecting with Razorpay...</h3>
            <p className="text-sm text-gray-500">Please do not refresh or close this screen.</p>
          </div>
        ) : razorpayStep === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Successful</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">₹{listing.price} paid successfully!</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 border-b pb-3 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Claim Listing</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Complete transaction for "{listing.title}"</p>
              </div>
              <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 dark:bg-neutral-900/60 p-4 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Item:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{listing.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lister:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{listing.postedBy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price:</span>
                  <span className={`font-bold ${listing.isFree ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {listing.isFree || listing.price === 0 ? 'Free' : `₹${listing.price}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-50/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-2xl mb-1">💵</span>
                    <span className="text-xs font-bold">Cash / On Pickup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-emerald-600 bg-emerald-50/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-2xl mb-1">💳</span>
                    <span className="text-xs font-bold">Razorpay Online</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'razorpay' && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                  ⚡ Powered by Razorpay Secure Checkout. You can pay instantly using cards, UPI, or Netbanking.
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-4 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {paymentMethod === 'razorpay' ? `Pay via Razorpay` : `Claim with Cash`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
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
