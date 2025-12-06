/**
 * Local Authentication Utility
 * Manages user storage and authentication in localStorage
 */

const USERS_STORAGE_KEY = 'vasundhara_users';
const CURRENT_USER_KEY = 'vasundhara_current_user';
export const SYSTEM_ADMIN_EMAIL = 'admin';
export const SYSTEM_ADMIN_ID = 'admin_default';

export function isSystemAdminAccount(subject: { id?: string; email?: string }): boolean {
    if (!subject) return false;
    const idMatch = subject.id === SYSTEM_ADMIN_ID;
    const emailMatch = subject.email?.toLowerCase() === SYSTEM_ADMIN_EMAIL;
    return Boolean(idMatch || emailMatch);
}

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

/**
 * Simple hash function for password storage
 * NOTE: For production, use proper encryption like bcrypt
 */
export function hashPassword(password: string): string {
    let hash = 0;
    const salt = 'vasundhara_salt_2024';
    const combined = password + salt;

    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(36);
}

/**
 * Get all stored users
 */
export function getAllUsers(): StoredUser[] {
    try {
        const usersData = localStorage.getItem(USERS_STORAGE_KEY);
        let users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

        // Seed default admin if not exists
        const adminExists = users.some(u => isSystemAdminAccount(u));
        if (!adminExists) {
            const defaultAdmin: StoredUser = {
            id: SYSTEM_ADMIN_ID,
            email: SYSTEM_ADMIN_EMAIL,
            password: hashPassword('admin'),
                firstName: 'System',
                lastName: 'Admin',
                role: 'admin',
                isActive: true,
                approvalStatus: 'approved',
                createdAt: new Date().toISOString(),
                profileImage: '/admin-avatar.png' // Placeholder or leave empty
            };
            users.push(defaultAdmin);
            saveUsers(users);
        }

        return users;
    } catch (error) {
        console.error('Error reading users from localStorage:', error);
        return [];
    }
}

/**
 * Save users to localStorage
 */
function saveUsers(users: StoredUser[]): void {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
        console.error('Error saving users to localStorage:', error);
        throw new Error('Failed to save user data');
    }
}

/**
 * Check if user with email exists
 */
export function userExists(email: string): boolean {
    const users = getAllUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): StoredUser | null {
    const users = getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Get user by ID
 */
export function getUserById(id: string): StoredUser | null {
    const users = getAllUsers();
    return users.find(user => user.id === id) || null;
}

/**
 * Save new user (sign up)
 */
export function saveUser(userData: Omit<StoredUser, 'id' | 'createdAt' | 'isActive' | 'approvalStatus'>): StoredUser {
    // Check if user already exists
    if (userExists(userData.email)) {
        throw new Error('User with this email already exists');
    }

    const users = getAllUsers();

    const newUser: StoredUser = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        approvalStatus: 'approved', // Auto-approve for local auth
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;
}

/**
 * Validate user credentials
 */
export function validateCredentials(email: string, password: string): StoredUser | null {
    const user = getUserByEmail(email);

    if (!user) {
        return null;
    }

    const hashedPassword = hashPassword(password);

    if (user.password !== hashedPassword) {
        return null;
    }

    return user;
}

/**
 * Update user data
 */
export function updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return null;
    }

    // Don't allow updating email, id, or password through this method
    const { id: _, email: __, password: ___, ...safeUpdates } = updates as any;

    users[userIndex] = {
        ...users[userIndex],
        ...safeUpdates,
    };

    saveUsers(users);
    return users[userIndex];
}

/**
 * Change user password
 */
export function changePassword(userId: string, oldPassword: string, newPassword: string): boolean {
    const user = getUserById(userId);

    if (!user) {
        return false;
    }

    const oldHash = hashPassword(oldPassword);

    if (user.password !== oldHash) {
        return false;
    }

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return false;
    }

    users[userIndex].password = hashPassword(newPassword);
    saveUsers(users);

    return true;
}

/**
 * Get current logged-in user
 */
export function getCurrentUser(): StoredUser | null {
    try {
        const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
        if (!currentUserId) {
            return null;
        }
        return getUserById(currentUserId);
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Set current logged-in user
 */
export function setCurrentUser(userId: string): void {
    try {
        localStorage.setItem(CURRENT_USER_KEY, userId);
    } catch (error) {
        console.error('Error setting current user:', error);
        throw new Error('Failed to save session');
    }
}

/**
 * Clear current user session
 */
export function clearCurrentUser(): void {
    try {
        localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
        console.error('Error clearing current user:', error);
    }
}

/**
 * Delete user (admin function)
 */
export function deleteUser(id: string): boolean {
    const users = getAllUsers();
    const target = users.find(user => user.id === id);

    if (!target) {
        return false; // User not found
    }

    if (isSystemAdminAccount(target)) {
        throw new Error('The system admin account cannot be deleted.');
    }

    const filteredUsers = users.filter(user => user.id !== id);
    saveUsers(filteredUsers);
    return true;
}
