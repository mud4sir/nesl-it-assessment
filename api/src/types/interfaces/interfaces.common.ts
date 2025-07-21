
export interface ApiError extends Error {
  success: boolean;
  message: string;
  statusCode: number;
  data: [] | {};
}

export interface User {
  id: string;
  role: string
}

export interface Post {
  id: number
  title: string
  content: string
  author: string 
  tags: string[]
  createdAt: string
  updatedAt: string
}