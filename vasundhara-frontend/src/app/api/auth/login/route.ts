import { NextResponse } from 'next/server';
import { readUsers, hashPassword } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const users = readUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const hashed = hashPassword(password);
        if (user.password !== hashed) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.isActive) {
            return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
        }

        // Return user without password
        const { password: _, ...safeUser } = user;
        return NextResponse.json(safeUser);

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
