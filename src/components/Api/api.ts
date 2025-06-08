const API_URL = 'http://147.135.210.93:3002/api';
const token = localStorage.getItem("authToken");

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

//Интрефейсы главной странички
export interface Workspace {
  id: string;
  name: string;
  imageUrl?: string;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMemberDto {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

interface CreateWorkspaceDto {
  name: string;
  visibility: "public" | "private";
}

export interface UpdateWorkspaceDto {
  id: string;
  name: string;
}

export async function checkEmail(email: string): Promise<{ available: boolean }> {
    const response = await fetch(`${API_URL}/auth/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Failed to check email');
  return response.json();
}

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

export async function confirmEmail(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/verify?token=${token}`, {
    method: 'GET',
  });
  if (!response.ok) throw new Error('Email confirmation failed');
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/resend-verification-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Failed to resend verification email');
}

export async function getAllUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/user`, {
    method: 'GET',
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  const users = await response.json();
  return users.map((user: any) => ({
    ...user,
    // avatarUrl: user.avatarUrl ? `http://147.135.210.93:3002${user.avatarUrl}`: null
    avatarUrl: user.avatarUrl ? `http://147.135.210.93:3002${user.avatarUrl}`: null
  }));
}

  export async function getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
}

export async function deleteUserById(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
}

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

//Тут методы после авторизации пользователя
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
  return { fullName: text }; 
}


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
  const result = `http://147.135.210.93:3002` + text;
  return { avatarUrl: result };

}

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

// Методы воркспейса главной странчки
export async function getUserWorkspace(): Promise<Workspace[]> {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_URL}/user/workspaces`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No workspaces found for this user");
  }

  const workspaces = await response.json();

  return workspaces.map((w: any) => ({
    ...w,
    imageUrl: w.imageUrl 
      ? `http://147.135.210.93:3002${w.imageUrl}` 
      : null,
  }));
}

export async function createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found");
  }

  const res = await fetch(`${API_URL}/workspace`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create workspace");
  }

  return res.json();
}

export async function updateWorkspace(data: UpdateWorkspaceDto): Promise<Workspace>{
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch (`${API_URL}/workspace/${data.id}/members` , {
    method: 'PATCH',
    headers: {
      'Authorization' : `Bearer ${token}`,
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify({name: data.name}),
  });

  if (!response.ok){
    const error = await response.json();
    throw new Error(error.message || 'Failed to update workspace');
  }
  return response.json();
}

export async function deleteWorkspace(workspaceId: string): Promise<{message: string}>{
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch (`${API_URL}/workspace/${workspaceId}` , {
    method: 'DELETE',
    headers: {
      'Authorization' : `Bearer ${token}`,
      'Content-Type' : 'application/json',
    },
  });

  if (!response.ok){
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete workspace');
  }
  return response.json();
}

export async function getWorkspaceById(workspaceId: string): Promise<Workspace>{
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch (`${API_URL}/workspace/${workspaceId}` , {
    method: 'GET',
    headers: {
      'Authorization' : `Bearer ${token}`,
      'Content-Type' : 'application/json',
    },
  });

  if (!response.ok){
    const error = await response.json();
    throw new Error(error.message || 'Failed to get workspace');
  }
  return response.json();
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberDto[]> {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_URL}/workspace/${workspaceId}/members`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get members');
  }
  return response.json();
}

export async function updateWorkspaceName(workspaceId: string, name: string): Promise<Workspace> {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_URL}/workspace/${workspaceId}/name`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update workspace name');
  }
  return response.json();
}

export async function updateWorkspaceVisibility(workspaceId: string, visibility: 'public' | 'private'): Promise<Workspace> {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_URL}/workspace/${workspaceId}/visibility`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ visibility }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update visibility');
  }
  return response.json();
}

export async function uploadWorkspaceImage(workspaceId: string, file: File): Promise<{ success: boolean; imageUrl: string }> {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/workspace/${workspaceId}/image`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload avatar');
  }

  return response.json();
}

export async function generateInviteLink(workspaceId: string): Promise<{ inviteLink: string }> {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_URL}/workspace/${workspaceId}/invite-link`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate invite link');
  }
  return response.json();
}

export async function joinWorkspaceByToken(inviteToken: string): Promise<{ message: string; workspaceId: string }> {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_URL}/workspace/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: inviteToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to join workspace');
  }
  return response.json();
}