
export interface User {
  id: string;
  username: string;
  avatar: string;
  clearance: 'Level 1' | 'Level 2' | 'Admin';
}

export interface Rating {
  userId: string;
  score: number;
}

export interface Sighting {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: number;
  createdAt: number;
  aiAnalysis?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  ratings: Rating[];
}

export interface GeminiResponse {
  analysis: string;
  probability: string;
  type: string;
}

export interface GeminiAnalysis {
  credibility: string;
  explanation: string;
  potentialIdentification: string;
}
