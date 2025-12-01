export interface Tab {
  id: string;
  title: string;
  artist: string;
  createdAt: number;
  type: 'editor' | 'image';
  // For editor type: 4 strings x N steps. 
  // Each step is an array of 4 numbers (or null) representing fret numbers.
  // Index 0 = G, 1 = C, 2 = E, 3 = A (Standard Tuning)
  content: (number | null)[][]; 
  imageUrl?: string; // For image uploads
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export enum StringName {
  G = 'G',
  C = 'C',
  E = 'E',
  A = 'A',
}

export const EMPTY_TAB_LENGTH = 16;