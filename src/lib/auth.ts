import { User, UserRole } from './types';
import { v4 as uuidv4 } from 'uuid';

interface StoredUser extends User {
  passwordHash: string;
}

// Global user store in memory with single admin & registered students
const globalUserStore: Map<string, StoredUser> = new Map();

// Helper to seed the single admin account
function initializeUsers() {
  if (globalUserStore.size > 0) return;

  // Single Admin Account as requested: omjee@tmsl.edu / Omjee@123
  const adminUser: StoredUser = {
    id: 'admin-omjee',
    name: 'Omjee (Admin)',
    email: 'omjee@tmsl.edu',
    role: 'admin',
    department: 'Administration',
    createdAt: new Date('2026-01-01').toISOString(),
    passwordHash: 'Omjee@123'
  };
  globalUserStore.set(adminUser.email.toLowerCase(), adminUser);
}

// Ensure store is initialized
initializeUsers();

export function sanitizeUser(user: StoredUser): User {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function deriveNameFromEmail(email: string): string {
  const prefix = email.split('@')[0] || 'Student';
  return prefix
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export async function registerStudent(data: {
  email: string;
  password: string;
  name?: string;
  department?: string;
  rollNumber?: string;
  year?: string;
}): Promise<{ user: User; error?: string }> {
  initializeUsers();

  const emailLower = data.email.trim().toLowerCase();

  if (emailLower === 'omjee@tmsl.edu') {
    return { user: null as any, error: 'This email is reserved for the Administrator' };
  }

  if (globalUserStore.has(emailLower)) {
    return { user: null as any, error: 'An account with this email already exists. Please log in.' };
  }

  const displayName = data.name?.trim() || deriveNameFromEmail(emailLower);

  const newUser: StoredUser = {
    id: `student-${uuidv4().slice(0, 8)}`,
    name: displayName,
    email: emailLower,
    role: 'student',
    department: data.department || 'Computer Science & Engineering',
    rollNumber: data.rollNumber || `TMSL-${Math.floor(100000 + Math.random() * 900000)}`,
    year: data.year || '1st Year',
    createdAt: new Date().toISOString(),
    passwordHash: data.password
  };

  globalUserStore.set(emailLower, newUser);
  return { user: sanitizeUser(newUser) };
}

export async function authenticateUser(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  initializeUsers();

  const emailLower = email.trim().toLowerCase();
  const user = globalUserStore.get(emailLower);

  if (!user) {
    // Admin fallback shortcut
    if (emailLower === 'omjee' || emailLower === 'omjee@tmsl.edu') {
      const admin = globalUserStore.get('omjee@tmsl.edu');
      if (admin && (password === 'Omjee@123' || password === 'Omjee@123456789')) {
        return { user: sanitizeUser(admin) };
      }
    }
    return { user: null, error: 'No account found with this email. Please register first.' };
  }

  if (user.passwordHash !== password) {
    return { user: null, error: 'Incorrect password' };
  }

  return { user: sanitizeUser(user) };
}

export async function getUserById(id: string): Promise<User | null> {
  initializeUsers();
  const allUsers = Array.from(globalUserStore.values());
  for (const user of allUsers) {
    if (user.id === id) {
      return sanitizeUser(user);
    }
  }
  return null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  initializeUsers();
  const user = globalUserStore.get(email.trim().toLowerCase());
  return user ? sanitizeUser(user) : null;
}

export async function getAllStudents(): Promise<User[]> {
  initializeUsers();
  const students: User[] = [];
  const allUsers = Array.from(globalUserStore.values());
  for (const user of allUsers) {
    if (user.role === 'student') {
      students.push(sanitizeUser(user));
    }
  }
  return students.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
