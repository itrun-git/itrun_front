  const API_URL = 'http://localhost:3002/api';

  export enum UserPurpose {
    PERSONAL = 'personal',
    TEAM = 'team',
    EVENTS = 'events',
    OTHER = 'other',
  }

  export interface CreateUserDto {
    email: string;
    password: string;    
    name: string;   
    avatarUrl?: string;      
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
    name: string; 
    fullName?: string; 
    passwordHash: string;
    avatarUrl?: string;
    purpose: UserPurpose;
    emailVerified?: boolean;
    verificationToken?: string;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
  }

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
    const response = await fetch(`${API_URL}/auth/verify?token=${token}`, {
      method: 'GET',
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

  // Upload avatar image
  export async function uploadAvatar(file: File, userId: string): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId);

    const response = await fetch(`${API_URL}/auth/upload-avatar`, {
    method: 'PATCH', 
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload avatar');
  }

  return response.json();
}

  //setPurpose
  export async function setUserPurpose(dto: SetPurposeDto): Promise<User> {
    const response = await fetch(`${API_URL}/auth/set-purpose`, { 
    method: 'PATCH', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to set purpose');
  }
  return response.json();
}

  //Update email 
  export async function changeUserEmail(currentEmail: string, newEmail: string) {
  const response = await fetch(`${API_URL}/auth/change-email`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentEmail,
      newEmail,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to change email');
  }

  return await response.json();
}

//-----Тут методы после авторизации пользователя------
// Get user full name 
export async function getUserFullName(token: string): Promise<{ fullName: string }> {
  const response = await fetch(`${API_URL}/user/fullName`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to get user full name');
  }

  const text = await response.text();
  return { fullName: text }; // оборачиваем вручную
}


// Get user email   
export async function getUserEmail(token: string): Promise<{ email: string }> {
  const response = await fetch(`${API_URL}/user/email`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get user email');
  }
  const text = await response.text();
  return { email: text };
}

// Get user avatar URL 
export async function getUserAvatar(token: string): Promise<{ avatarUrl: string | null }> {
  const response = await fetch(`${API_URL}/user/avatar`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get user avatar');
  }
  const text = await response.text();
  const result = `http://localhost:3002` + text;
  return { avatarUrl: result };

}

// Get user purpose 
export async function getUserPurpose(token: string): Promise<{ purpose: UserPurpose }> {
  const response = await fetch(`${API_URL}/user/purpose`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get user purpose');
  }
  return response.json();
}

// Logout user
export async function logoutUser(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to logout');
  }
  return response.json();
}

  //Update email 
  export async function updateEmail(userId: string, email: string) {
  const response = await fetch(`${API_URL}/auth/update-email`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newEmail: email }),
  });

  if (!response.ok) {
    throw new Error('Failed to update email');
  }

  return await response.json();
}