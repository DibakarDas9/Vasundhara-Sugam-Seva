import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export interface StoredUser {
    id: string;
    email: string;
    password: string; // Hashed
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: 'household' | 'shopkeeper' | 'admin';
    isActive: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    householdProfile?: {
        familySize?: number;
        address?: string;
        ward?: string;
    };
    shopkeeperProfile?: {
        businessName?: string;
        licenseNumber?: string;
        address?: string;
    };
    profileImage?: string;
}

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

export function readUsers(): StoredUser[] {
    try {
        ensureDataDir();
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users file:', error);
        return [];
    }
}

export function writeUsers(users: StoredUser[]): void {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            ensureDataDir();
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
            return;
        } catch (error) {
            attempt++;
            if (attempt === maxRetries) {
                console.error('Error writing users file:', error);
                throw new Error(`Failed to save user data: ${error instanceof Error ? error.message : String(error)}`);
            }
            // Simple synchronous delay to allow file lock to release
            const start = Date.now();
            while (Date.now() - start < 100) { }
        }
    }
}

// Simple hash function (same as localAuth for consistency)
export function hashPassword(password: string): string {
    let hash = 0;
    const salt = 'vasundhara_salt_2024';
    const combined = password + salt;

    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return hash.toString(36);
}

export function seedAdmin() {
    const users = readUsers();
    if (!users.some(u => u.email === 'admin')) {
        const defaultAdmin: StoredUser = {
            id: 'admin_default',
            email: 'admin',
            password: hashPassword('admin'),
            firstName: 'System',
            lastName: 'Admin',
            role: 'admin',
            isActive: true,
            approvalStatus: 'approved',
            createdAt: new Date().toISOString(),
        };
        users.push(defaultAdmin);
        writeUsers(users);
    }
}
