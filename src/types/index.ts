export interface Game {
    appId: number;
    name: string;
    currentPrice: number;
    originalPrice: number;
    discountPercent: number;
}

export interface Genre {
    genreId: number;
    genreName: string;
}

export interface PriceHistory {
    snapshotDate: string;
    price: number;
    discountPercent: number;
}

export interface SteamIndex {
    recordDate: string;
    indexValue: number;
    totalGameCount: number;
}

export interface WishList {
    wishListId: number;
    appId: number;
    gameName: string;
    targetType: 'PRICE' | 'DISCOUNT';
    targetValue: number;
    inTargetRange: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export interface AccountInfo {
    accountId: number;
    username: string;
    nickname: string;
    email: string;
}