import axios from 'axios';
import { ApiResponse, Game, Genre, PriceHistory, SteamIndex, WishList, AccountInfo } from '../types';

const api = axios.create({
    baseURL: 'http://43.203.124.85:8080',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getGameList = (page: number, size: number) =>
    api.get<ApiResponse<Game[]>>(`/api/game`, { params: { page, size } });

export const getGameListByGenres = (genreIds: number[], page: number, size: number) =>
    api.get<ApiResponse<Game[]>>(`/api/game`, { params: { genreIds: genreIds.join(','), page, size } });

export const getGenres = () =>
    api.get<ApiResponse<Genre[]>>(`/api/game/genre`);

export const getPriceHistory = (appId: number, page: number, size: number) =>
    api.get<ApiResponse<PriceHistory[]>>(`/api/game/${appId}/price-history`, { params: { page, size } });

export const getSteamIndex = (page: number, size: number) =>
    api.get<ApiResponse<SteamIndex[]>>(`/api/steam-index/history`, { params: { page, size } });

export const getWishList = () =>
    api.get<ApiResponse<WishList[]>>(`/api/wish-list`);

export const addWishList = (appId: number, targetType: 'PRICE' | 'DISCOUNT', targetValue: number) =>
    api.post<ApiResponse<void>>(`/api/wish-list`, { appId, targetType, targetValue });

export const deleteWishList = (wishListId: number) =>
    api.delete<ApiResponse<void>>(`/api/wish-list/${wishListId}`);

export const login = (username: string, password: string) =>
    api.post<ApiResponse<{ accessToken: string; nickname: string }>>(`/api/account/login`, { username, password });

export const signup = (username: string, password: string, email: string, nickname: string) =>
    api.post<ApiResponse<void>>(`/api/account/signup`, { username, password, email, nickname });

export const getAccountInfo = () =>
    api.get<ApiResponse<AccountInfo>>(`/api/account/info`);