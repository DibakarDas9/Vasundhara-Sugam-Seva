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
import Script from 'next/script';
import { compressImageToThumbnail } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  loadMarketplaceListings,
  saveMarketplaceListings,
  deleteMarketplaceListing,
  type MarketplaceCoordinates,
  type MarketplaceListing,
  type MarketplaceRole,
} from '@/lib/marketplaceStore';
import {
  CalendarDaysIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  BanknotesIcon,
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
  const { user, updateProfile } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [formData, setFormData] = useState<MarketplaceFormState>(initialFormState);
  const [currentLocation, setCurrentLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationDialogOpen, setLocationDialogOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isListingFormOpen, setIsListingFormOpen] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterFreeOnly, setFilterFreeOnly] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState<'nearby' | 'my'>('nearby');

  // Claim/Payment modal states
  const [claimingListing, setClaimingListing] = useState<MarketplaceListing | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('cash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payout states
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutDetails, setPayoutDetails] = useState({ upiId: '', bankIfsc: '', accNumber: '' });
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (user?.payoutDetails) {
      setPayoutDetails({
        upiId: user.payoutDetails.upiId || '',
        bankIfsc: user.payoutDetails.bankIfsc || '',
        accNumber: user.payoutDetails.accNumber || ''
      });
    }
    
    setIsMounted(true);
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
      setIsListingFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    // Remote deletion logic (if applicable)
    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/api/marketplace/${listingId}`, { method: 'DELETE' });
        if (!response.ok) {
           console.warn('Failed to delete remotely');
        }
      } catch (err) {
        console.warn('Error deleting remotely', err);
      }
    }
    
    // Local deletion
    deleteMarketplaceListing(listingId);
    setListings(prev => prev.filter(listing => listing.id !== listingId));
    toast.success('Listing deleted');
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg text-white">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md shadow-inner">
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {currentLocation || 'Location not set'}
                    </h2>
                    <p className="text-emerald-100 text-sm font-medium mt-1">
                      Discover surplus food in this area
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setLocationDialogOpen(true)}
                    className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all shadow-sm border border-white/10 hover:border-white/20"
                  >
                    Change Area
                  </button>
                  <button
                    onClick={() => setIsPayoutModalOpen(true)}
                    className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-sm"
                  >
                    <BanknotesIcon className="h-5 w-5" />
                    Payout Details
                  </button>
                  <button
                    onClick={() => setIsListingFormOpen(!isListingFormOpen)}
                    className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 text-sm font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <PlusIcon className="h-5 w-5" />
                    {isListingFormOpen ? 'Close Form' : 'List an Item'}
                  </button>
                </div>
              </div>
            </div>

            {isListingFormOpen && (
              <Card className="transition-all duration-300 ease-in-out">
                <CardHeader>
                  <CardTitle className="text-xl">List item</CardTitle>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add an item name, expiry date, and location. Items appear only for users using the same location.
                  </p>
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
                                reader.onloadend = async () => {
                                  const base64 = reader.result as string;
                                  const compressed = await compressImageToThumbnail(base64);
                                  handleFormChange('image', compressed);
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
            )}

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveFeedTab('nearby')}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      activeFeedTab === 'nearby'
                        ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Nearby Items
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFeedTab('my')}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      activeFeedTab === 'my'
                        ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    My Listings
                  </button>
                </div>
                <div className="px-3">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    <span className="text-emerald-600 dark:text-emerald-400 mr-1">{visibleListings.length}</span>
                    {visibleListings.length === 1 ? 'item' : 'items'} found
                  </span>
                </div>
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
                      className={`flex items-center gap-1.5 shrink-0 px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                        filterCategory === cat.id
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 dark:bg-neutral-900 dark:border-gray-800 dark:text-gray-300 dark:hover:border-emerald-800'
                      }`}
                    >
                      <span className="text-sm">{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 select-none">
                  <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-neutral-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-300 transition-colors">
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
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
                  {visibleListings.map(listing => (
                    <div key={listing.id} className="group flex flex-col sm:flex-row overflow-hidden bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Image panel */}
                      <div className="relative h-48 sm:h-auto sm:w-2/5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-neutral-900 dark:to-neutral-900/60 overflow-hidden shrink-0">
                        <img
                          src={listing.image || '/hero-slides/marketplace.png'}
                          alt={listing.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/hero-slides/marketplace.png';
                          }}
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="rounded-lg bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                            {listing.category}
                          </span>
                        </div>
                      </div>

                      {/* Details panel */}
                      <div className="flex flex-col justify-between p-5 sm:w-3/5">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                              {listing.title}
                            </h3>
                            {listing.isFree || listing.price === 0 ? (
                              <span className="rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm shrink-0 whitespace-nowrap">
                                🎉 Free
                              </span>
                            ) : (
                              <span className="rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-bold text-gray-800 dark:text-gray-300 shadow-sm shrink-0 whitespace-nowrap">
                                ₹{listing.price}
                              </span>
                            )}
                          </div>
                          <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <MapPinIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">{listing.location}</span>
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/50 px-2.5 py-1 font-medium">
                            <CalendarDaysIcon className="h-3.5 w-3.5" />
                            Exp: {formatDate(listing.pickupTime)}
                          </span>
                          <span className="rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-gray-700 px-2.5 py-1 line-clamp-1 max-w-[140px] font-medium">
                            By {listing.postedBy}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                          {activeFeedTab === 'my' ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold tracking-wide rounded-lg px-3 py-1.5 ${
                                  listing.status === 'claimed'
                                    ? 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                }`}>
                                  {listing.status === 'claimed' ? 'Claimed' : 'Available'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteListing(listing.id)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 px-3 py-1.5 text-xs font-bold transition"
                                title="Delete Listing"
                              >
                                <TrashIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-between w-full gap-2">
                              {listing.phone ? (
                                <a
                                  href={`tel:${listing.phone}`}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-transparent dark:text-emerald-400 dark:hover:bg-emerald-900/30 px-3 py-2 text-xs font-bold text-center transition"
                                >
                                  📞 Call
                                </a>
                              ) : (
                                <span className="text-[10px] text-gray-400">No contact info</span>
                              )}
                              <button
                                type="button"
                                onClick={() => setClaimingListing(listing)}
                                className="flex-[2] inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-2 text-xs font-bold shadow-md shadow-emerald-600/20 transition hover:-translate-y-0.5"
                              >
                                Claim Deal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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

      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-950">
            <div className="flex justify-between mb-4 border-b pb-3 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payout Settings</h2>
                <p className="text-sm text-gray-500">How you receive your money</p>
              </div>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200 mb-5">
              <strong>Disclaimer:</strong> 20% of the transaction amount is retained as platform fees. Payouts are safely redirected to your configured bank account or UPI after 1 month.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">UPI ID</label>
                <input
                  type="text"
                  placeholder="e.g. yourname@upi"
                  value={payoutDetails.upiId}
                  onChange={(e) => setPayoutDetails({...payoutDetails, upiId: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">OR</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  placeholder="Account Number"
                  value={payoutDetails.accNumber}
                  onChange={(e) => setPayoutDetails({...payoutDetails, accNumber: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={payoutDetails.bankIfsc}
                  onChange={(e) => setPayoutDetails({...payoutDetails, bankIfsc: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-900 dark:text-white uppercase"
                />
              </div>
              <div className="pt-2">
                <Button 
                  className="w-full"
                  onClick={async () => {
                    await updateProfile({ payoutDetails });
                    toast.success('Payout details saved successfully!');
                    setIsPayoutModalOpen(false);
                  }}
                >
                  Save Payout Details
                </Button>
              </div>
            </div>
          </div>
        </div>
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = async () => {
    if (paymentMethod === 'razorpay') {
      setRazorpayStep('processing');
      setErrorMsg(null);
      try {
        const orderRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: listing.price, receipt: listing.id })
        });
        const orderData = await orderRes.json();
        
        if (!orderRes.ok) {
          throw new Error(orderData.error || 'Failed to initialize payment');
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key',
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Vasundhara Sugam Seva",
          description: `Payment for ${listing.title}`,
          order_id: orderData.id,
          handler: function (response: any) {
            setRazorpayStep('success');
            setTimeout(() => {
              onConfirm();
            }, 1200);
          },
          prefill: {
            name: "Marketplace User",
            email: "",
          },
          theme: { color: "#10b981" },
          modal: {
            ondismiss: function() {
              setRazorpayStep('select');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
          setErrorMsg('Payment failed: ' + response.error.description);
          setRazorpayStep('select');
        });
        rzp.open();
      } catch (err: any) {
        setErrorMsg(err.message || 'Payment error occurred');
        setRazorpayStep('select');
      }
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
                  <span className="text-gray-500">Price:</span>
                  <span className={`font-bold ${listing.isFree || !listing.price ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {listing.isFree || !listing.price ? 'Free' : `₹${listing.price}`}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20">
                  {errorMsg}
                </div>
              )}

              {(listing.isFree || !listing.price) ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/20 my-4">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800">
                    <span className="text-xl">🌍</span>
                  </div>
                  <h3 className="text-md font-bold text-emerald-900 dark:text-emerald-100">
                    Thank you for our noble cause
                  </h3>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    Coordinate directly with the homeowner for pickup.
                  </p>
                </div>
              ) : (
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
              )}

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
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <ProtectedRoute>
        <MarketplaceContent />
      </ProtectedRoute>
    </>
  );
}
