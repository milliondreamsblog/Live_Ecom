export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
}

export interface CartItem extends Product {
    q: number;
}

export interface Msg {
    id: string;
    username: string;
    message: string;
    timestamp: number;
}

export interface St {
    id: string;
    title: string;
    hostName: string;
    category: string;
    isLive: boolean;
    thumbnailUrl: string;
    startedAt: number;
    viewers: number;
}

export interface Reaction {
    id: number;
    type: string;
    left: number;
}

export interface PollOption {
    text: string;
    votes: number;
}

export interface PollData {
    question: string;
    options: PollOption[];
    isActive: boolean;
}

export interface CouponData {
    code: string;
    discount: number;
    expiresAt: number;
}
