'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AnalyticsData {
  totalItemsTracked: number;
  itemsWasted: number;
  itemsConsumed: number;
  moneySaved: number;
  carbonFootprintReduced: number;
  streakDays: number;
  wasteTrends: Array<{
    date: string;
    wasted: number;
    consumed: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    wasted: number;
  }>;
  monthlyStats: Array<{
    month: string;
    itemsTracked: number;
    itemsWasted: number;
    moneySaved: number;
    carbonReduced: number;
  }>;
}

interface AnalyticsContextType {
  data: AnalyticsData | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  getHouseholdAnalytics: (householdId: string) => Promise<AnalyticsData>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const refreshData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHouseholdAnalytics = async (householdId: string): Promise<AnalyticsData> => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/household/${householdId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch household analytics');
      }
    } catch (error) {
      console.error('Failed to fetch household analytics:', error);
      throw error;
    }
  };

  const value: AnalyticsContextType = {
    data,
    loading,
    refreshData,
    getHouseholdAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
