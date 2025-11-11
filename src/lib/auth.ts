import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db'; // Assume a database module is available

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface UserPayload {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    departmentId?: string;
    subdeptid?: string;
    lineUserId?: string;
    lineDisplayName?: string;
    linePictureUrl?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: string;
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

// JWT utilities
export const generateToken = (payload: UserPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): UserPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
};

// Authentication functions
export const authenticateUser = async (credentials: LoginCredentials): Promise<{ user: UserPayload | null; token: string | null }> => {
    try {
        const user = await db.user.findUnique({
            where: { username: credentials.username },
        });

        if (!user || !user.is_active) {
            return { user: null, token: null };
        }

        const isValidPassword = await verifyPassword(credentials.password, user.password);
        if (!isValidPassword) {
            return { user: null, token: null };
        }

        const userPayload: UserPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            // departmentId: user.departmentId || undefined,
            // subdeptid: user.subdeptid || undefined,
            // lineUserId: user.lineUserId || undefined,
            // lineDisplayName: user.lineDisplayName || undefined,
            // linePictureUrl: user.linePictureUrl || undefined,
        };

        const token = generateToken(userPayload);
        return { user: userPayload, token };
    } catch (error) {
        console.error('Authentication error:', error);
        return { user: null, token: null };
    }
};

export const registerUser = async (data: RegisterData): Promise<{ user: UserPayload | null; token: string | null; error?: string }> => {
    try {
        // Check if user already exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { username: data.username },
                    { email: data.email }
                ]
            }
        });

        if (existingUser) {
            return { 
                user: null, 
                token: null, 
                error: existingUser.username === data.username ? 'Username already exists' : 'Email already exists' 
            };
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user
        const user = await db.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role || 'user',
            }
        });

        const userPayload: UserPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            // departmentId: user.departmentId || undefined,
            // subdeptid: user.subdeptid || undefined,
            // lineUserId: user.lineUserId || undefined,
            // lineDisplayName: user.lineDisplayName || undefined,
            // linePictureUrl: user.linePictureUrl || undefined,
        };

        const token = generateToken(userPayload);
        return { user: userPayload, token };
    } catch (error) {
        console.error('Registration error:', error);
        return { user: null, token: null, error: 'Registration failed' };
    }
};

export const getUserById = async (id: string): Promise<UserPayload | null> => {
    try {
        const user = await db.user.findUnique({
            where: { id },
        });

        if (!user || !user.is_active) {
            return null;
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            // departmentId: user.departmentId || undefined,
            // subdeptid: user.subdeptid || undefined,
            // lineUserId: user.lineUserId || undefined,
            // lineDisplayName: user.lineDisplayName || undefined,
            // linePictureUrl: user.linePictureUrl || undefined,
        };
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};
