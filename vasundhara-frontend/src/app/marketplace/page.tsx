'use client';

import React, { useState } from 'react';
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

const mockListings: MarketplaceListing[] = [];

const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 'Beverages'];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [likedItems, setLikedItems] = useState<number[]>([2]);

  const toggleLike = (itemId: number) => {
    setLikedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
    const matchesFree = !showFreeOnly || listing.isFree;

    return matchesSearch && matchesCategory && matchesFree;
  });

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
                  Feature coming soon
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Community marketplace opens shortly
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  We are finalizing the sharing workflow so everyone can safely exchange surplus food. Hang tight while we polish the experience.
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

                <Button icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/marketplace/new')}>
                  List Item
                </Button>
              </div>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Marketplace launching soon</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We&apos;re preparing curated listings for everyone. Check back shortly to discover and share surplus meals.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Stay tuned for updates in your dashboard notifications.
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
