export type MarketplaceRole = 'household' | 'shopkeeper' | 'admin' | 'user';
export type MarketplaceStatus = 'available' | 'reserved' | 'claimed';

export interface MarketplaceCoordinates {
  lat: number;
  lng: number;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  originalPrice: number;
  location: string;
  postedBy: string;
  postedTime: string;
  image: string;
  isFree: boolean;
  rating: number;
  pickupTime: string;
  ownerId: string;
  ownerRole: MarketplaceRole;
  coordinates: MarketplaceCoordinates;
  radiusKm: number;
  status: MarketplaceStatus;
  createdAt: number;
  reservedBy?: string;
  reservedAt?: number;
}

const STORAGE_KEY = 'vasundhara_marketplace_listings';

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readListings(): MarketplaceListing[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as MarketplaceListing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeListings(listings: MarketplaceListing[]) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

export function loadMarketplaceListings(): MarketplaceListing[] {
  return readListings();
}

export function saveMarketplaceListings(listings: MarketplaceListing[]): void {
  writeListings(listings);
}

export function getMarketplaceListing(listingId: string): MarketplaceListing | null {
  return readListings().find(listing => listing.id === listingId) || null;
}

export function upsertMarketplaceListing(listing: MarketplaceListing): void {
  const listings = readListings();
  const index = listings.findIndex(item => item.id === listing.id);

  if (index === -1) {
    listings.unshift(listing);
  } else {
    listings[index] = listing;
  }

  writeListings(listings);
}

export function reserveMarketplaceListing(listingId: string, reservedBy: string): MarketplaceListing | null {
  const listings = readListings();
  const index = listings.findIndex(item => item.id === listingId);

  if (index === -1) {
    return null;
  }

  listings[index] = {
    ...listings[index],
    status: 'reserved',
    reservedBy,
    reservedAt: Date.now(),
  };

  writeListings(listings);
  return listings[index];
}

export function distanceKm(from: MarketplaceCoordinates, to: MarketplaceCoordinates): number {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(distance: number): string {
  if (!Number.isFinite(distance)) {
    return 'Nearby';
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }

  return `${distance.toFixed(1)} km away`;
}

export function seedMarketplaceListings(center: MarketplaceCoordinates): MarketplaceListing[] {
  const now = Date.now();

  return [
    {
      id: `market_${now}_1`,
      title: 'Fresh mango box',
      description: 'Locally picked mangoes in great condition. Best for immediate use or sharing with neighbors.',
      category: 'Fruits',
      quantity: 12,
      unit: 'pieces',
      price: 0,
      originalPrice: 180,
      location: 'Nearby household pickup',
      postedBy: 'Dibakar Das',
      postedTime: 'Just now',
      image: '/hero-slides/marketplace.png',
      isFree: true,
      rating: 5,
      pickupTime: 'Today, 5 PM - 8 PM',
      ownerId: 'seed_household_1',
      ownerRole: 'household',
      coordinates: { lat: center.lat + 0.0028, lng: center.lng + 0.0018 },
      radiusKm: 1,
      status: 'available',
      createdAt: now,
    },
    {
      id: `market_${now}_2`,
      title: 'Cooked rice and curry portion',
      description: 'Extra dinner portion packed safely for a local pickup. Free for nearby families.',
      category: 'Grains',
      quantity: 2,
      unit: 'containers',
      price: 0,
      originalPrice: 120,
      location: 'Apartment block pickup',
      postedBy: 'Community Host',
      postedTime: '10 mins ago',
      image: '/hero-slides/dashboard.png',
      isFree: true,
      rating: 5,
      pickupTime: 'Today, 7 PM - 9 PM',
      ownerId: 'seed_household_2',
      ownerRole: 'household',
      coordinates: { lat: center.lat - 0.0036, lng: center.lng + 0.0021 },
      radiusKm: 1,
      status: 'available',
      createdAt: now - 1000 * 60 * 10,
    },
    {
      id: `market_${now}_3`,
      title: 'Vegetable bundle',
      description: 'Fresh vegetables from a surplus kitchen stock-up at a low community price.',
      category: 'Vegetables',
      quantity: 5,
      unit: 'bundles',
      price: 40,
      originalPrice: 90,
      location: 'Local pickup point',
      postedBy: 'Nearby Homeowner',
      postedTime: '25 mins ago',
      image: '/hero-slides/inventory.png',
      isFree: false,
      rating: 4,
      pickupTime: 'Tomorrow, 6 PM - 8 PM',
      ownerId: 'seed_household_3',
      ownerRole: 'household',
      coordinates: { lat: center.lat + 0.0041, lng: center.lng - 0.0027 },
      radiusKm: 1,
      status: 'available',
      createdAt: now - 1000 * 60 * 25,
    },
  ];
}
