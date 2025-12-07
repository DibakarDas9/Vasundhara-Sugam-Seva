'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import {
  MapPinIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

type MarketplaceListing = {
  id: number;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  originalPrice: number;
  location: string;
  distance: string;
  postedBy: string;
  postedTime: string;
  image: string;
  isFree: boolean;
  isLiked: boolean;
  rating: number;
  pickupTime: string;
};

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

const initialFormState: MarketplaceFormState = {
  title: '',
  description: '',
  category: 'Fruits',
  quantity: '1',
  unit: 'pieces',
  price: '0',
  originalPrice: '',
  location: '',
  pickupTime: ''
};

const mockListings: MarketplaceListing[] = [];

const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 'Beverages'];
const units = ['pieces', 'lbs', 'kg', 'bundles', 'containers', 'packs'];

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <MarketplaceContent />
    </ProtectedRoute>
  );
}

function MarketplaceContent() {
  const router = require('next/navigation').useRouter();
  const listItemSectionRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [likedItems, setLikedItems] = useState<number[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>(mockListings);
  const [formData, setFormData] = useState<MarketplaceFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeout = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const toggleLike = (itemId: number) => {
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
    setIsSubmitting(true);

    try {
      const quantity = Math.max(1, Number(formData.quantity) || 1);
      const price = Math.max(0, Number(formData.price) || 0);
      const originalPrice = Number(formData.originalPrice);

      const newListing: MarketplaceListing = {
        id: Date.now(),
        title: formData.title.trim() || 'Untitled item',
        description: formData.description.trim() || 'Community contributed item',
        category: formData.category,
        quantity,
        unit: formData.unit,
        price,
        originalPrice: originalPrice > 0 ? originalPrice : price,
        location: formData.location.trim() || 'Local pickup',
        distance: 'Nearby',
        postedBy: 'You',
        postedTime: 'Just now',
        image: '/api/placeholder/200/150',
        isFree: price === 0,
        isLiked: false,
        rating: 5,
        pickupTime: formData.pickupTime.trim() || 'Flexible pickup'
      };

      setListings(prev => [newListing, ...prev]);
      setStatusMessage('Listing saved locally. Sharing with the community opens soon.');
      setFormData(initialFormState);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
    const matchesFree = !showFreeOnly || listing.isFree;

    return matchesSearch && matchesCategory && matchesFree;
  });

  const isFormValid = Boolean(
    formData.title.trim() &&
    formData.description.trim() &&
    formData.location.trim()
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title="Marketplace"
          subtitle="Share surplus food and find great deals from your community"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card className="border-dashed border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CardContent className="flex flex-col gap-2 text-center py-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-green-600 dark:text-green-300">
                  Marketplace beta update
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Collect sample listings while we finish the release
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Add your surplus items below to preview how listings will appear. We&apos;ll open community-wide exchanges once moderation and pickup flows are finalized.
                </p>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  Free Only
                </Button>

                <Button
                  type="button"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={scrollToForm}
                >
                  List Item
                </Button>
              </div>
            </div>

            {/* List Item Form */}
            <div ref={listItemSectionRef}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">List an item for early access</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={handleListingSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Item name"
                        placeholder="e.g., Organic tomatoes"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                      <Input
                        label="Pickup window"
                        placeholder="Today 4-6 PM"
                        value={formData.pickupTime}
                        onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Category</label>
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-neutral-900 dark:text-white dark:border-gray-800"
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                        >
                          {categories.filter(category => category !== 'All').map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Unit</label>
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-neutral-900 dark:text-white dark:border-gray-800"
                          value={formData.unit}
                          onChange={(e) => handleInputChange('unit', e.target.value)}
                        >
                          {units.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                      />
                      <Input
                        label="Price (₹)"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                      />
                      <Input
                        label="Original price (₹)"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        helperText="Optional"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Description</label>
                      <textarea
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:bg-neutral-900 dark:text-white dark:border-gray-800"
                        rows={3}
                        placeholder="Share freshness details, expiry, or serving ideas"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        required
                      />
                    </div>

                    <Input
                      label="Pickup location"
                      placeholder="Neighborhood or pickup point"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                    />

                    {statusMessage && (
                      <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm dark:bg-emerald-950/30 dark:text-emerald-200">
                        {statusMessage}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Listings are stored locally for now and help us polish the experience.
                      </p>
                      <Button type="submit" loading={isSubmitting} disabled={!isFormValid || isSubmitting}>
                        Save preview listing
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
                    <div className="absolute top-4 left-4">
                      {listing.isFree ? (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                          FREE
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                          {formatCurrency(listing.price)}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => toggleLike(listing.id)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <HeartIcon
                          className={`w-5 h-5 ${likedItems.includes(listing.id) ? 'text-red-500 fill-current' : 'text-white'
                            }`}
                        />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-2 text-white text-sm">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{listing.location} • {listing.distance}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{listing.title}</h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{listing.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{listing.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                        <span className="font-medium dark:text-gray-200">{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Posted by:</span>
                        <span className="font-medium dark:text-gray-200">{listing.postedBy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Pickup:</span>
                        <span className="font-medium dark:text-gray-200">{listing.pickupTime}</span>
                      </div>
                      {!listing.isFree && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Original price:</span>
                          <span className="text-gray-500 dark:text-gray-500 line-through">{formatCurrency(listing.originalPrice)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => router.push(`/marketplace/${listing.id}/request`)}>
                        Request
                      </Button>
                      <Button size="sm" variant="outline" icon={<ShareIcon className="w-4 h-4" />} onClick={() => {
                        if ((navigator as any).share) {
                          (navigator as any).share({ title: listing.title, text: listing.description });
                        } else {
                          // fallback: copy link
                          navigator.clipboard?.writeText(window.location.href + `/marketplace/${listing.id}`);
                          alert('Link copied to clipboard');
                        }
                      }}>
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredListings.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No listings yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Use the form above to add your first preview listing while we finish the public rollout.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Everything stays on your device until the marketplace opens.
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
