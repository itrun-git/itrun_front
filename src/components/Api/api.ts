// const API_URL = 'http://147.135.210.93:3002/api';
const API_URL = 'http://localhost:3002/api';
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

//Интрефейсы борда
export interface Board {
  id: string;
  name: string;
  className?: string;
  label: string;
  isStarred: boolean;
  workspaceId?: string;
  imageUrl?: string;
}

export interface CreateBoardResponse {
  id: string;
  className: string;
  label: string;
  isStarred: boolean;
  workspaceId?: string;
  imageUrl?: string;
}

export interface CreateBoardResponse {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface WorkspaceData {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  joinedAt: string;
}

export interface WorkspaceGuest {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: 'guest' | 'member' | 'admin';
  joinedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}


export interface SearchUserResult {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
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

export async function findUserByEmail(email: string): Promise<User> {
  if (!token) {
    throw new Error("No auth token found");
  }
  const response = await fetch(`${API_URL}/user/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'User not found');
  }
  const user = await response.json();
  return {
    ...user,
    avatarUrl: user.avatarUrl ? `http://147.135.210.93:3002${user.avatarUrl}` : null
  };
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

//Работа с приглашением юзера
export async function generateInviteLink(workspaceId: string): Promise<{ inviteLink: string }> {
  const token = localStorage.getItem("authToken")
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

export async function getWorkspaceGuests(workspaceId: string): Promise<Guest[]> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_URL}/workspace/${workspaceId}/guests`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch guests');
  }

  return response.json();
}

export async function removeGuestFromWorkspace(workspaceId: string, guestId: string): Promise<void> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_URL}/workspace/${workspaceId}/guests/${guestId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove guest');
  }
}

//Методы борда 
export async function createBoard(workspaceId: string, name: string, imageFile?: File): Promise<CreateBoardResponse> {
  if (!token) throw new Error("No auth token found");
  const formData = new FormData();
  formData.append("name", name);
  if (imageFile) {
    formData.append("image", imageFile);
  }
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create board: ${response.status} ${errorText}`);
  }
  return response.json();
}

export async function getBoards(workspaceId: string): Promise<Board[]> {
  if (!token) throw new Error("No auth token found");
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch boards: ${response.status} ${errorText}`);
  }
  return response.json();
}

export const getBoardById = async (workspaceId: string, boardId: string) => {
  console.log('getBoardById called with:', { workspaceId, boardId });
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_URL}/workspace/${workspaceId}/board/${boardId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(`Failed to fetch board: ${response.status} ${JSON.stringify(errorData)}`);
    }
    const boardData = await response.json();
    console.log('Board data received:', boardData);
    return boardData;
  } catch (error) {
    console.error('getBoardById error:', error);
    throw error;
  }
};

export async function updateBoard(boardId: string, data: { name?: string, imageFile?: File }): Promise<Board> {
  if (!token) throw new Error("No auth token found");
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.imageFile) formData.append("image", data.imageFile);
  const response = await fetch(`${API_URL}/boards/${boardId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update board: ${response.status} ${errorText}`);
  }
  return response.json();
}

export async function getFavoriteBoards(): Promise<Board[]> {
  if (!token) throw new Error("No auth token found");
  const response = await fetch(`${API_URL}/boards/favorites`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get favorite boards: ${response.status} ${errorText}`);
  }
  return response.json();
}

export async function addBoardToFavorites(boardId: string): Promise<void> {
  if (!token) throw new Error("No auth token found");
  const response = await fetch(`${API_URL}/boards/${boardId}/favorite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add board to favorites: ${response.status} ${errorText}`);
  }
}

export async function removeBoardFromFavorites(boardId: string): Promise<void> {
  if (!token) throw new Error("No auth token found");
  const response = await fetch(`${API_URL}/boards/${boardId}/favorite`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to remove board from favorites: ${response.status} ${errorText}`);
  }
}

export async function getRecentBoards(): Promise<Board[]> {
  if (!token) throw new Error("No auth token found");
  const response = await fetch(`${API_URL}/boards/recent`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch recent boards: ${response.status} ${errorText}`);
  }
  return response.json();
}

export async function getUserBoards(): Promise<Board[]> {
  if (!token) throw new Error("No auth token found");
  const response = await fetch(`${API_URL}/user/boards`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch user boards: ${response.status} ${errorText}`);
  }
  return response.json();
}

export async function getWorkspaceBoards(workspaceId: string): Promise<Board[]> {
  return getBoards(workspaceId);
}

export async function getBoardByIdDelete (boardId: string): Promise<void> {
  if(!token) throw new Error ("No auth token found");
  const response = await fetch(`${API_URL}/boards/${boardId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if(!response.ok){
    const errorText = await response.text();
    throw new Error(`Faild to delete board: ${response.status} ${errorText}`);
  }
  return response.json();
}

// API для колонок
export async function createColumn(workspaceId: string, boardId: string, data: {name: string}) { 
  if (!token) throw new Error("No auth token found");
  
  console.log('Creating column with data:', { workspaceId, boardId, data });
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create column error:', errorText);
    throw new Error(`Failed to create column: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function updateColumn(workspaceId: string, boardId: string, columnId: string, data: {name?: string; position?: number}) {
  if (!token) throw new Error("No auth token found");
  
  console.log('Updating column:', { workspaceId, boardId, columnId, data });
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update column error:', errorText);
    throw new Error(`Failed to update column: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function getColumns(workspaceId: string, boardId: string) {
  if (!token) throw new Error("No auth token found");
  
  console.log('Fetching columns for:', { workspaceId, boardId });
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get columns error:', errorText);
    throw new Error(`Failed to fetch columns: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function deleteColumn(workspaceId: string, boardId: string, columnId: string) {
  if (!token) throw new Error("No auth token found");
  
  console.log('Deleting column:', { workspaceId, boardId, columnId });
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete column error:', errorText);
    throw new Error(`Failed to delete column: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function moveColumn(workspaceId: string, boardId: string, columnId: string, newPosition: number) {
  if (!token) throw new Error("No auth token found");
  
  console.log('Moving column:', { workspaceId, boardId, columnId, newPosition });
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/move`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newPosition }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Move column error:', errorText);
    throw new Error(`Failed to move column: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function copyColumn(workspaceId: string, boardId: string, columnId: string) {
  if (!token) throw new Error("No auth token found");
  
  console.log('Copying column:', { workspaceId, boardId, columnId });
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/copy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Copy column error:', errorText);
    throw new Error(`Failed to copy column: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

// API для карточек
export async function createCard(workspaceId: string, boardId: string, columnId: string, data: { title: string; description?: string }) {
  if (!token) throw new Error("No auth token found");
  
  console.log('Creating card with data:', { workspaceId, boardId, columnId, data });
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/card`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description || ""
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create card error:', errorText);
    throw new Error(`Failed to create card: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function getCard(workspaceId: string, boardId: string, columnId: string, cardId: string): Promise<Card> {
  if (!token) throw new Error("No auth token found");
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/card/${cardId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load card: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function updateCard(workspaceId: string, boardId: string, columnId: string, cardId: string, data: { title: string; description?: string }): Promise<Card> {
  if (!token) throw new Error("No auth token found");
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/card/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: data.title.trim(),
      description: data.description?.trim()
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update card: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function deleteCard(workspaceId: string, boardId: string, columnId: string, cardId: string): Promise<void> {
  if (!token) throw new Error("No auth token found");
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/card/${cardId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete card: ${response.status} ${errorText}`);
  }
}

export async function getCardComments(workspaceId: string, boardId: string, columnId: string, cardId: string): Promise<Comment[]> {
  if (!token) throw new Error("No auth token found");
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/card/${cardId}/comment`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load comments: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function addCardComment(workspaceId: string, boardId: string, columnId: string, cardId: string, text: string): Promise<Comment> {
  if (!token) throw new Error("No auth token found");
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/card/${cardId}/comment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text.trim() }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add comment: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function deleteComment(workspaceId: string, commentId: string): Promise<void> {
  if (!token) throw new Error("No auth token found");
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/comment/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete comment: ${response.status} ${errorText}`);
  }
}

export async function uploadCardCover(workspaceId: string, boardId: string, columnId: string, cardId: string, file: File): Promise<Card> {
  if (!token) throw new Error("No auth token found");
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/card/${cardId}/cover`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload cover: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function deleteCardCover(workspaceId: string, boardId: string, columnId: string, cardId: string): Promise<void> {
  if (!token) throw new Error("No auth token found");
  
  const response = await fetch(`${API_URL}/workspace/${workspaceId}/board/${boardId}/column/${columnId}/card/${cardId}/cover`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete cover: ${response.status} ${errorText}`);
  }
}