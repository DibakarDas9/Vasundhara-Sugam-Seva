import { NextResponse } from 'next/server';
import { readUsers, writeUsers } from '@/lib/db';

export async function DELETE(
    request: Request,
    context: any
) {
    try {
        const params = await context.params;
        const id = params?.id;

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const users = readUsers();

        const initialLength = users.length;
        const filteredUsers = users.filter(u => u.id !== id);

        if (filteredUsers.length === initialLength) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        writeUsers(filteredUsers);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: `Delete failed. Error: ${String(error)}` },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    context: any
) {
    try {
        const params = await context.params;
        const id = params?.id;

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const body = await request.json();
        const users = readUsers();

        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent updating sensitive fields directly via this route if needed
        // For now, we allow updating profile fields
        const updatedUser = { ...users[userIndex], ...body };

        // Ensure id is not changed
        updatedUser.id = id;

        users[userIndex] = updatedUser;
        writeUsers(users);

        const { password: _, ...safeUser } = updatedUser;
        return NextResponse.json(safeUser);

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
