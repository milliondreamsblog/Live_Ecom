export interface St {
  id: string;
  title: string;
  hostName: string;
  viewers: number;
  thumbnailUrl: string;
  isLive: boolean;
  category: string;
}

export interface Msg {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface Pd {
  id: string;
  name: string;
  price: number;
  image: string;
}