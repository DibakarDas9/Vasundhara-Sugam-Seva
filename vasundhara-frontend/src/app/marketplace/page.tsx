'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import {
  distanceKm,
  formatDistance,
  loadMarketplaceListings,
  saveMarketplaceListings,
  seedMarketplaceListings,
  type MarketplaceCoordinates,
  type MarketplaceListing,
  type MarketplaceRole,
} from '@/lib/marketplaceStore';
import {
  HeartIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

type MarketplaceFormState = {
  title: string;
  description: string;
  category: string;
  quantity: string;
  unit: string;
  price: string;
  originalPrice: string;
  location: string;
  pickupTime: string;
};

const nearbyRadiusKm = 1;
const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 'Beverages'];
const units = ['pieces', 'lbs', 'kg', 'bundles', 'containers', 'packs'];

const initialFormState: MarketplaceFormState = {
  title: '',
  description: '',
  category: 'Fruits',
  quantity: '1',
  unit: 'pieces',
  price: '0',
  originalPrice: '',
  location: '',
  pickupTime: '',
};

function MarketplaceContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const listItemSectionRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [formData, setFormData] = useState<MarketplaceFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<MarketplaceCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'ready' | 'blocked'>('idle');

  const isHouseholdUser = user?.role === 'household';

  useEffect(() => {
    setListings(loadMarketplaceListings());
  }, []);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeout = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('blocked');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      position => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentLocation(nextLocation);
        setLocationStatus('ready');

        const existingListings = loadMarketplaceListings();
        if (existingListings.length === 0) {
          const seededListings = seedMarketplaceListings(nextLocation);
          saveMarketplaceListings(seededListings);
          setListings(seededListings);
          setStatusMessage('Location enabled. Nearby sample listings are ready for pickup within 1 km.');
        } else {
          setListings(existingListings);
        }
      },
      () => {
        setLocationStatus('blocked');
        setStatusMessage('Enable location access to see and request pickup listings within 1 km.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const toggleLike = (itemId: string) => {
    setLikedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const scrollToForm = () => {
    listItemSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInputChange = (field: keyof MarketplaceFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleListingSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isHouseholdUser) {
      setStatusMessage('Only homeowner accounts can publish surplus items to the marketplace.');
      return;
    }

    if (!currentLocation) {
      setStatusMessage('Allow location access first so your listing can appear within 1 km for nearby pickup.');
      return;
    }

    setIsSubmitting(true);

    try {
      const quantity = Math.max(1, Number(formData.quantity) || 1);
      const price = Math.max(0, Number(formData.price) || 0);
      const originalPrice = Number(formData.originalPrice);
      const ownerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Nearby homeowner';
      const newListing: MarketplaceListing = {
        id: `market_${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        quantity,
        unit: formData.unit,
        price,
        originalPrice: originalPrice > 0 ? originalPrice : price,
        location: formData.location.trim(),
        postedBy: ownerName,
        postedTime: 'Just now',
        image: '/hero-slides/marketplace.png',
        isFree: price === 0,
        rating: 5,
        pickupTime: formData.pickupTime.trim() || 'Flexible pickup',
        ownerId: user?.id || 'local-homeowner',
        ownerRole: (user?.role || 'household') as MarketplaceRole,
        coordinates: currentLocation,
        radiusKm: nearbyRadiusKm,
        status: 'available',
        createdAt: Date.now(),
      };

      const nextListings = [newListing, ...loadMarketplaceListings()];
      saveMarketplaceListings(nextListings);
      setListings(nextListings);
      setStatusMessage('Listing saved. Nearby households within 1 km can now request pickup only.');
      setFormData(initialFormState);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleListings = useMemo(() => {
    const decorated = listings
      .map(listing => {
        const distance = currentLocation ? distanceKm(currentLocation, listing.coordinates) : null;
        return { listing, distance };
      })
      .filter(({ listing, distance }) => {
        const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
        const matchesFree = !showFreeOnly || listing.isFree;
        const withinRange = currentLocation ? Boolean(distance !== null && distance <= nearbyRadiusKm) : false;

        return matchesSearch && matchesCategory && matchesFree && withinRange;
      })
      .sort((left, right) => {
        if (left.distance === null && right.distance === null) {
          return right.listing.createdAt - left.listing.createdAt;
        }

        if (left.distance === null) {
          return 1;
        }

        if (right.distance === null) {
          return -1;
        }

        return left.distance - right.distance;
      });

    return decorated;
  }, [currentLocation, listings, searchTerm, selectedCategory, showFreeOnly]);

  const isFormValid = Boolean(
    formData.title.trim() &&
    formData.description.trim() &&
    formData.location.trim() &&
    currentLocation &&
    isHouseholdUser
  );

  const locationBanner = currentLocation
    ? 'Nearby listings are filtered to a 1 km pickup radius.'
    : 'Allow location access to view and post community listings within 1 km.';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={t('market.title', 'Marketplace')}
          subtitle={t('market.subtitle', 'Share surplus food and find nearby community pickup items')}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card className="border-dashed border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CardContent className="flex flex-col gap-2 py-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-green-600 dark:text-green-300">
                  {t('market.betaTitle', 'Homeowner exchange network')}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('market.betaHeading', 'List surplus food for free or at a cost, only for nearby households')}
                </h3>
                <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
                  {t('market.betaDescription', 'This marketplace connects homeowners within 1 km so surplus food can be shared or sold without any delivery personnel. Pickup happens directly between neighbors.')}
                </p>
              </CardContent>
            </Card>

            <Card className={currentLocation ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20' : 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20'}>
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                <p className={currentLocation ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}>
                  {locationBanner}
                </p>
                {locationStatus === 'loading' && (
                  <p className="text-gray-600 dark:text-gray-300">Checking your location for nearby listings...</p>
                )}
                {!isHouseholdUser && (
                  <p className="text-gray-700 dark:text-gray-200">
                    You can browse nearby items, but only a homeowner account can publish a listing.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1">
                <Input
                  placeholder={t('market.searchPlaceholder', 'Search for food items...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <Button
                  variant={showFreeOnly ? 'primary' : 'outline'}
                  onClick={() => setShowFreeOnly(!showFreeOnly)}
                  size="sm"
                >
                  {t('market.freeOnly', 'Free Only')}
                </Button>

                <Button
                  type="button"
                  icon={<PlusIcon className="h-4 w-4" />}
                  onClick={scrollToForm}
                >
                  {t('market.listItem', 'List Item')}
                </Button>
              </div>
            </div>

            <div ref={listItemSectionRef}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t('market.form.title', 'List surplus food for nearby pickup')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isHouseholdUser ? (
                    <form className="space-y-6" onSubmit={handleListingSubmit}>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                          label={t('market.form.itemName', 'Item name')}
                          placeholder={t('market.form.itemNamePlaceholder', 'e.g., Organic tomatoes')}
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                        />
                        <Input
                          label={t('market.form.pickupWindow', 'Pickup window')}
                          placeholder={t('market.form.pickupPlaceholder', 'Today 4-6 PM')}
                          value={formData.pickupTime}
                          onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('inventory.modal.category', 'Category')}</label>
                          <select
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-neutral-900 dark:text-white"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                          >
                            {categories.filter(category => category !== 'All').map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('inventory.modal.unit', 'Unit')}</label>
                          <select
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-neutral-900 dark:text-white"
                            value={formData.unit}
                            onChange={(e) => handleInputChange('unit', e.target.value)}
                          >
                            {units.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Input
                          label={t('market.form.quantity', 'Quantity')}
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                        />
                        <Input
                          label={t('market.form.price', 'Price (₹)')}
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                        />
                        <Input
                          label={t('market.form.originalPrice', 'Original price (₹)')}
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.originalPrice}
                          onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                          helperText={t('market.form.optional', 'Optional')}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('market.form.description', 'Description')}</label>
                        <textarea
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-gray-800 dark:bg-neutral-900 dark:text-white"
                          rows={3}
                          placeholder={t('market.form.descPlaceholder', 'Share freshness details, expiry, or serving ideas')}
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          required
                        />
                      </div>

                      <Input
                        label={t('market.form.pickupLocation', 'Pickup location')}
                        placeholder={t('market.form.pickupLocPlaceholder', 'Neighborhood or pickup point')}
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required
                      />

                      {statusMessage && (
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
                          {statusMessage}
                        </div>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Homeowner listings are shared only with nearby households within 1 km. Pickup is direct and local.
                        </p>
                        <Button type="submit" loading={isSubmitting} disabled={!isFormValid || isSubmitting}>
                          {t('market.form.savePreview', 'Publish listing')}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-neutral-950">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">Homeowner posting only</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Switch to a household account to publish surplus food for nearby pickup.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleListings.map(({ listing, distance }) => (
                <Card key={listing.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                    <div className="absolute left-4 top-4">
                      {listing.isFree ? (
                        <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                          {t('market.grid.free', 'FREE')}
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                          {formatCurrency(listing.price)}
                        </span>
                      )}
                    </div>
                    <div className="absolute right-4 top-4">
                      <button
                        onClick={() => toggleLike(listing.id)}
                        className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
                      >
                        <HeartIcon className={`h-5 w-5 ${likedItems.includes(listing.id) ? 'fill-current text-red-500' : 'text-white'}`} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-2 text-sm text-white">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{listing.location} • {distance !== null ? formatDistance(distance) : 'Location pending'}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{listing.title}</h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{listing.rating}</span>
                      </div>
                    </div>

                    <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{listing.description}</p>

                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('market.form.quantity', 'Quantity')}:</span>
                        <span className="font-medium dark:text-gray-200">{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('market.grid.postedBy', 'Posted by')}:</span>
                        <span className="font-medium dark:text-gray-200">{listing.postedBy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('market.grid.pickup', 'Pickup')}:</span>
                        <span className="font-medium dark:text-gray-200">{listing.pickupTime}</span>
                      </div>
                      {!listing.isFree && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('market.grid.originalPrice', 'Original price')}:</span>
                          <span className="line-through text-gray-500 dark:text-gray-500">{formatCurrency(listing.originalPrice)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/marketplace/${listing.id}/request`)}
                      >
                        {t('market.grid.request', 'Request')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<ShareIcon className="h-4 w-4" />}
                        onClick={() => {
                          if ((navigator as any).share) {
                            (navigator as any).share({ title: listing.title, text: listing.description });
                          } else {
                            navigator.clipboard?.writeText(`${window.location.origin}/marketplace/${listing.id}/request`);
                            alert(t('market.grid.copied', 'Link copied to clipboard'));
                          }
                        }}
                      >
                        {t('market.grid.share', 'Share')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {visibleListings.length === 0 && (
              <Card className="py-12 text-center">
                <CardContent>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
                    <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{t('market.emptyTitle', 'No nearby listings yet')}</h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    {currentLocation
                      ? 'Only items posted within 1 km appear here. Publish a surplus item or wait for a nearby homeowner to share one.'
                      : 'Enable location access to see nearby pickup-only listings.'}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('market.emptyHint', 'All exchanges are direct pickup and limited to the local neighborhood.')}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
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
