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

const mockListings = [
  {
    id: 1,
    title: 'Fresh Organic Bananas',
    description: '6 organic bananas, still fresh, expiring in 2 days',
    category: 'Fruits',
    quantity: 6,
    unit: 'pieces',
    price: 0,
    originalPrice: 3.50,
    location: 'Downtown',
    distance: '0.5 miles',
    postedBy: 'Sarah M.',
    postedTime: '2 hours ago',
    image: '/api/placeholder/200/150',
    isFree: true,
    isLiked: false,
    rating: 4.8,
    pickupTime: 'Today 6-8 PM'
  },
  {
    id: 2,
    title: 'Greek Yogurt Containers',
    description: '2 containers of Greek yogurt, unopened, expires tomorrow',
    category: 'Dairy',
    quantity: 2,
    unit: 'containers',
    price: 2.00,
    originalPrice: 5.99,
    location: 'Midtown',
    distance: '1.2 miles',
    postedBy: 'Mike R.',
    postedTime: '4 hours ago',
    image: '/api/placeholder/200/150',
    isFree: false,
    isLiked: true,
    rating: 4.6,
    pickupTime: 'Tomorrow 10-12 AM'
  },
  {
    id: 3,
    title: 'Fresh Spinach Bundle',
    description: 'Large bundle of fresh spinach, perfect for salads',
    category: 'Vegetables',
    quantity: 1,
    unit: 'bundle',
    price: 0,
    originalPrice: 2.99,
    location: 'Uptown',
    distance: '0.8 miles',
    postedBy: 'Lisa K.',
    postedTime: '6 hours ago',
    image: '/api/placeholder/200/150',
    isFree: true,
    isLiked: false,
    rating: 4.9,
    pickupTime: 'Today 4-6 PM'
  },
  {
    id: 4,
    title: 'Chicken Breast (Frozen)',
    description: '1.5 lbs of frozen chicken breast, good for another week',
    category: 'Meat',
    quantity: 1.5,
    unit: 'lbs',
    price: 5.00,
    originalPrice: 12.99,
    location: 'Westside',
    distance: '2.1 miles',
    postedBy: 'David L.',
    postedTime: '1 day ago',
    image: '/api/placeholder/200/150',
    isFree: false,
    isLiked: false,
    rating: 4.7,
    pickupTime: 'Tomorrow 2-4 PM'
  }
];

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
    <div className="flex h-screen bg-gray-50">
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
                      <h3 className="font-semibold text-gray-900 text-lg">{listing.title}</h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">{listing.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Posted by:</span>
                        <span className="font-medium">{listing.postedBy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pickup:</span>
                        <span className="font-medium">{listing.pickupTime}</span>
                      </div>
                      {!listing.isFree && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Original price:</span>
                          <span className="text-gray-500 line-through">{formatCurrency(listing.originalPrice)}</span>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filters to find more items
                  </p>
                  <Button icon={<PlusIcon className="w-4 h-4" />}>
                    List Your First Item
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
