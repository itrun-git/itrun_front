const API_URL = 'http://localhost:3002/api';

export enum UserPurpose {
  PERSONAL = 'personal',
  TEAM = 'team',
  EVENTS = 'events',
  OTHER = 'other',
}

// Минимальный интерфейс для регистрации (только то, что принимает бэкенд)
export interface CreateUserDto {
  email: string;
  password: string;    
  name: string;         
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface EmailCheckDto {
  email: string;
}

export interface SetPurposeDto {
  userId: string;
  purpose: UserPurpose;
}

export interface User {
  id: string;
  email: string;
  name: string; // В ответе от сервера может быть name
  fullName?: string; // Или fullName
  passwordHash: string;
  avatarUrl?: string;
  purpose: UserPurpose;
  emailVerified?: boolean;
  verificationToken?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- API Methods ---

// Check if email is available
export async function checkEmail(email: string): Promise<{ available: boolean }> {
  const response = await fetch(`${API_URL}/auth/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Failed to check email');
  return response.json();
}

// Register new user - отправляем данные согласно DTO бэкенда
export async function registerUser(data: CreateUserDto): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Ошибка регистрации');
  }
  return response.json();
}

// Login user
export async function loginUser(dto: LoginDto): Promise<{ message: string; token: string }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  return response.json();
}

// Send verification email
export async function sendVerificationEmail(userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/send-verification`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send verification email');
  }
}

// Confirm email verification with token
export async function confirmEmail(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/confirm-email?token=${token}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Email confirmation failed');
}

// Resend verification email
export async function resendVerificationEmail(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/resend-verification-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Failed to resend verification email');
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/user`, {
    method: 'GET',
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

// Get user by ID
export async function getUserById(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/user/${id}`, {
    method: 'GET',
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

// Delete user by ID
export async function deleteUserById(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/user/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
}

// Set user purpose (оставляем для совместимости, если нужно)
export async function setUserPurpose(dto: SetPurposeDto): Promise<User> {
  const response = await fetch(`${API_URL}/user/set-purpose`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to set purpose');
  }
  return response.json();
}

// Upload avatar image
export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_URL}/upload/avatar`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload avatar');
  }

  return response.json();
}