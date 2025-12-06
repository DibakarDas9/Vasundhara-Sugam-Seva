'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  SYSTEM_ADMIN_ID,
  changePassword as changeStoredPassword,
  getUserById,
  updateUser as updateStoredUser,
} from '@/lib/localAuth';

interface SystemAdminControlsProps {
  className?: string;
  showBanner?: boolean;
}

function composeDisplayName(firstName?: string, lastName?: string) {
  return [firstName ?? '', lastName ?? ''].filter(Boolean).join(' ').trim();
}

function splitDisplayName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: 'System', lastName: 'Admin' };
  }
  const parts = trimmed.split(/\s+/);
  const first = parts.shift() ?? '';
  const last = parts.join(' ');
  return { firstName: first, lastName: last };
}

export function SystemAdminControls({ className, showBanner = true }: SystemAdminControlsProps) {
  const { user, updateProfile, changePassword } = useAuth();
  const [fullName, setFullName] = useState('');
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [hasGateAccess, setHasGateAccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const evaluateGate = () => {
      try {
        setHasGateAccess(localStorage.getItem('vasundhara_admin_gate_token') === 'granted');
      } catch {
        setHasGateAccess(false);
      }
    };
    evaluateGate();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'vasundhara_admin_gate_token') {
        evaluateGate();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      setFullName(composeDisplayName(user.firstName, user.lastName));
      return;
    }

    if (!hasGateAccess) {
      setFullName('');
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const record = getUserById(SYSTEM_ADMIN_ID);
    if (record) {
      setFullName(composeDisplayName(record.firstName, record.lastName));
    }
  }, [user, hasGateAccess]);

  const canAccess = (user?.role === 'admin') || hasGateAccess;

  if (!canAccess) {
    return null;
  }

  const handleIdentitySave = async () => {
    setSavingIdentity(true);
    try {
      const { firstName, lastName } = splitDisplayName(fullName);
      if (user?.role === 'admin') {
        await updateProfile({ firstName, lastName });
      } else {
        const updated = updateStoredUser(SYSTEM_ADMIN_ID, { firstName, lastName });
        if (!updated) {
          throw new Error('System admin record not found.');
        }
        toast.success('System admin identity updated');
      }
    } catch (error) {
      if (!(user?.role === 'admin')) {
        toast.error(error instanceof Error ? error.message : 'Failed to update identity');
      }
    } finally {
      setSavingIdentity(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Enter both your current and new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password should be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation must match');
      return;
    }

    setChangingPassword(true);
    try {
      if (user?.role === 'admin') {
        await changePassword(currentPassword, newPassword);
      } else {
        const success = changeStoredPassword(SYSTEM_ADMIN_ID, currentPassword, newPassword);
        if (!success) {
          throw new Error('Current password is incorrect');
        }
        toast.success('Password updated successfully');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (!(user?.role === 'admin')) {
        toast.error(error instanceof Error ? error.message : 'Failed to update password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>System Admin Identity</CardTitle>
            <p className="text-sm text-gray-500">Update how the single system admin appears across the console.</p>
          </div>
          <ShieldCheckIcon className="h-6 w-6 text-purple-500" />
        </CardHeader>
        <CardContent>
          {showBanner && (
            <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-900">
              The system admin cannot be removed. Use this panel to keep their name up to date.
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="System Admin" />
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleIdentitySave} disabled={savingIdentity} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {savingIdentity ? 'Saving…' : 'Save identity'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Password</CardTitle>
          <p className="text-sm text-gray-500">Rotate credentials regularly to keep the console secure.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current password</label>
            <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New password</label>
            <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm new password</label>
            <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter new password" />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handlePasswordChange} disabled={changingPassword} className="bg-gray-900 text-white hover:bg-gray-800">
              {changingPassword ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
