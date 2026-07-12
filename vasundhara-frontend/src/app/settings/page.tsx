'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { SystemAdminControls } from '@/components/admin/SystemAdminControls';
import { CameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [payoutDetails, setPayoutDetails] = useState({ upiId: '', accNumber: '', bankIfsc: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setProfileImage(user.profileImage);
      if (user.payoutDetails) {
        setPayoutDetails({
          upiId: user.payoutDetails.upiId || '',
          accNumber: user.payoutDetails.accNumber || '',
          bankIfsc: user.payoutDetails.bankIfsc || ''
        });
      }
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        profileImage,
        payoutDetails: {
          upiId: payoutDetails.upiId || undefined,
          accNumber: payoutDetails.accNumber || undefined,
          bankIfsc: payoutDetails.bankIfsc || undefined
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={t('settings.title', 'Settings')} subtitle={t('settings.subtitle', 'Manage your account and app preferences')} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profileTitle', 'Profile Settings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircleIcon className="w-16 h-16 text-gray-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <CameraIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-center text-emerald-600 font-medium">{t('settings.changePhoto', 'Change Photo')}</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.firstName', 'First Name')}</label>
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={t('settings.firstName', 'First Name')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.lastName', 'Last Name')}</label>
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder={t('settings.lastName', 'Last Name')}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.email', 'Email')}</label>
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">{t('settings.emailHint', 'Email cannot be changed.')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      {loading ? t('settings.saving', 'Saving...') : t('settings.saveChanges', 'Save Changes')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.preferences', 'Preferences')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.prefDetail', 'Notification and privacy settings will appear here.')}</p>
                <div className="mt-4">
                  <Button onClick={() => alert(t('settings.prefAlert', 'Preferences coming soon'))} variant="outline">{t('settings.editPref', 'Edit preferences')}</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payout Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure where you want to receive payments for your premium services or marketplace sales.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">UPI ID</label>
                      <Input
                        value={payoutDetails.upiId}
                        onChange={(e) => setPayoutDetails({ ...payoutDetails, upiId: e.target.value })}
                        placeholder="username@bank"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Account Number</label>
                      <Input
                        value={payoutDetails.accNumber}
                        onChange={(e) => setPayoutDetails({ ...payoutDetails, accNumber: e.target.value })}
                        placeholder="Account Number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank IFSC Code</label>
                      <Input
                        value={payoutDetails.bankIfsc}
                        onChange={(e) => setPayoutDetails({ ...payoutDetails, bankIfsc: e.target.value })}
                        placeholder="IFSC Code"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      {loading ? 'Saving...' : 'Save Payout Details'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user?.role === 'admin' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/20 p-4 text-sm text-purple-900 dark:text-purple-200">
                  You are managing the non-removable system admin account. Update its identity or password below to keep credentials current.
                </div>
                <SystemAdminControls showBanner={false} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
