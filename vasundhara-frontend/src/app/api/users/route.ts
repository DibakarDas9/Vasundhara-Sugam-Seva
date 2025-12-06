import { NextResponse } from 'next/server';
import { readUsers } from '@/lib/db';

export async function GET() {
    try {
        const users = readUsers();
        // Return users without passwords
        const safeUsers = users.map(user => {
            const { password: _, ...safeUser } = user;
            return safeUser;
        });
        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
