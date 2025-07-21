/*
    Usually we have different files exporting types/interfaces.
    But for simplicity here I'm using single file to export types.
*/

import type React from "react";


export interface User {
  id: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User
}


export interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: string;
  tags: string[]
  title: string
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (id: string) => Promise<void>;
  logout: () => void;
}

export interface ApiResponse {
  data: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseApiOptions {
  skip?: boolean;
  cache?: boolean;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  body?: any;
  baseUrl?: string;
}

export interface AuthProviderProps {
    children: React.PropsWithChildren
}

export interface PostItemProps { 
  post: Post; 
  index: number, 
  deletePostHandler: (id: string) => void 
}

export interface UseApi {
  resource?: string
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}