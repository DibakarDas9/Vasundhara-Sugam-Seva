import { NextResponse } from 'next/server';
import { readUsers, writeUsers, hashPassword, StoredUser } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, role, householdProfile, shopkeeperProfile, profileImage } = body;

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const users = readUsers();

        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const newUser: StoredUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            password: hashPassword(password),
            firstName,
            lastName,
            role: role || 'household',
            isActive: true,
            approvalStatus: 'approved',
            createdAt: new Date().toISOString(),
            householdProfile,
            shopkeeperProfile,
            profileImage
        };

        users.push(newUser);
        writeUsers(users);

        // Return user without password
        const { password: _, ...safeUser } = newUser;
        return NextResponse.json(safeUser);

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
