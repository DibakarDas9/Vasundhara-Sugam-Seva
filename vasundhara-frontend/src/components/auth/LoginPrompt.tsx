'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export function LoginPrompt() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <LockClosedIcon className="w-8 h-8 text-emerald-600" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
                    <p className="text-gray-600">
                        Please log in or sign up to access this page.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={() => router.push('/auth')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        Login
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/auth')}
                        className="flex-1"
                    >
                        Sign Up
                    </Button>
                </div>

                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
