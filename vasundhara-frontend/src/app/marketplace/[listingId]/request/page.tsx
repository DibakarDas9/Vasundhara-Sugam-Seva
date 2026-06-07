'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  distanceKm,
  formatDistance,
  getMarketplaceListing,
  reserveMarketplaceListing,
  type MarketplaceCoordinates,
  type MarketplaceListing,
} from '@/lib/marketplaceStore';

function RequestContent() {
  const params = useParams<{ listingId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [currentLocation, setCurrentLocation] = useState<MarketplaceCoordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    setListing(getMarketplaceListing(params.listingId));
  }, [params.listingId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage('Location access is required to keep pickups within 1 km.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => setLocationMessage('Enable location access to request nearby pickup listings.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleRequest = () => {
    if (!listing) {
      return;
    }

    if (!currentLocation) {
      setActionMessage('Enable location access before requesting this item.');
      return;
    }

    const distance = distanceKm(currentLocation, listing.coordinates);

    if (distance > 1) {
      setActionMessage('This item is outside your 1 km pickup range.');
      return;
    }

    const updated = reserveMarketplaceListing(listing.id, user ? `${user.firstName} ${user.lastName}`.trim() : 'Nearby user');
    setListing(updated);
    setActionMessage('Request submitted. Connect with the homeowner for pickup only.');
  };

  const distance = listing && currentLocation ? distanceKm(currentLocation, listing.coordinates) : null;
  const isWithinRange = distance !== null ? distance <= 1 : false;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={t('market.requestTitle', 'Pickup request')}
          subtitle={t('market.requestSubtitle', 'Reserve a nearby listing and coordinate a direct pickup with no delivery needed')}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {locationMessage && (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20">
                <CardContent className="p-4 text-sm text-amber-900 dark:text-amber-100">
                  {locationMessage}
                </CardContent>
              </Card>
            )}

            {actionMessage && (
              <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                <CardContent className="p-4 text-sm text-emerald-900 dark:text-emerald-100">
                  {actionMessage}
                </CardContent>
              </Card>
            )}

            {!listing ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-600 dark:text-gray-300">
                  Listing not found.
                  <div className="mt-4">
                    <Button onClick={() => router.push('/marketplace')}>Back to marketplace</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{listing.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{listing.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-neutral-900">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Pickup distance</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {distance === null ? 'Location pending' : formatDistance(distance)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-neutral-900">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Pickup mode</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">Direct homeowner pickup</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100">
                    No delivery personnel are involved. Exchange directly with the homeowner within 1 km.
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleRequest}
                      disabled={!isWithinRange || listing.status !== 'available'}
                    >
                      {listing.status === 'available' ? 'Request pickup' : 'Already reserved'}
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/marketplace')}>
                      Back
                    </Button>
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

export default function MarketplaceRequestPage() {
  return (
    <ProtectedRoute>
      <RequestContent />
    </ProtectedRoute>
  );
}
