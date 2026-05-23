import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPriceHistory, addWishList } from '../api';
import { PriceHistory } from '../types';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

export default function GameDetailPage() {
    const { appId } = useParams<{ appId: string }>();
    const navigate = useNavigate();
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [targetType, setTargetType] = useState<'PRICE' | 'DISCOUNT'>('PRICE');
    const [targetValue, setTargetValue] = useState('');
    const [wishlistMsg, setWishlistMsg] = useState('');
    const [error, setError] = useState('');
    const isLoggedIn = !!localStorage.getItem('accessToken');

    const latestData = priceHistory.length > 0
        ? priceHistory[priceHistory.length - 1]
        : null;
    const latestPrice = latestData?.price ?? null;
    const latestDiscount = latestData?.discountPercent ?? null;

    const minPrice = priceHistory.length > 0 ? Math.min(...priceHistory.map(h => h.price)) : null;
    const maxPrice = priceHistory.length > 0 ? Math.max(...priceHistory.map(h => h.price)) : null;

    const fetchPriceHistory = async (p: number) => {
        try {
            const res = await getPriceHistory(Number(appId), p, 30);
            const newData = res.data.data;
            if (newData.length < 30) setHasMore(false);
            if (p === 0) setPriceHistory(newData);
            else setPriceHistory((prev) => [...newData, ...prev]);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchPriceHistory(0); }, [appId]);

    const handleAddWishList = async () => {
        setError('');
        if (!targetValue) return;
        const val = Number(targetValue);
        if (targetType === 'PRICE') {
            if (latestPrice !== null && val >= latestPrice) {
                setError(`현재 가격(${latestPrice.toLocaleString()}원) 미만으로 입력해주세요.`);
                return;
            }
        } else {
            if (latestDiscount !== null && val <= latestDiscount) {
                setError(`현재 할인율(${latestDiscount}%) 초과로 입력해주세요.`);
                return;
            }
        }
        try {
            await addWishList(Number(appId), targetType, val);
            setWishlistMsg('위시리스트에 추가됐어요!');
        } catch (e: any) {
            setWishlistMsg(e.response?.data?.message || '추가 실패');
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    <p className="text-blue-400 font-bold text-sm">{payload[0].value.toLocaleString()}원</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-800">
                <h1 className="text-xl font-bold text-blue-400 cursor-pointer" onClick={() => navigate('/')}>
                    Steam Tracker
                </h1>
                <Button variant="ghost" className="text-gray-300 text-sm" onClick={() => navigate('/games')}>← 게임 목록</Button>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <a href={`https://store.steampowered.com/app/${appId}/`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img
                            src={`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`}
                            alt="game"
                            className="rounded-lg w-full sm:w-64 object-cover cursor-pointer hover:opacity-80 transition"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </a>
                    {latestData && (
                        <div className="flex flex-col gap-2 justify-center">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-2xl font-bold text-white">
                                    {latestPrice === 0 ? '무료' : `${latestPrice?.toLocaleString()}원`}
                                </span>
                                {latestDiscount !== null && latestDiscount > 0 && (
                                    <Badge className="bg-green-600 text-white">-{latestDiscount}% 할인중</Badge>
                                )}
                            </div>
                            {minPrice !== null && maxPrice !== null && (
                                <div className="flex gap-4 text-sm">
                                    <span className="text-gray-400">최저 <span className="text-blue-400 font-semibold">{minPrice.toLocaleString()}원</span></span>
                                    <span className="text-gray-400">최고 <span className="text-gray-300 font-semibold">{maxPrice.toLocaleString()}원</span></span>
                                </div>
                            )}

                                href={`https://store.steampowered.com/app/${appId}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-500 hover:text-blue-400 transition mt-1"
                            >
                                Steam 스토어에서 보기
                            </a>
                        </div>
                    )}
                </div>

                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white text-base md:text-lg">가격 변동 기록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {priceHistory.length === 0 ? (
                            <p className="text-gray-400 text-center py-10">데이터가 없습니다.</p>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={priceHistory}>
                                        <defs>
                                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                                        <XAxis
                                            dataKey="snapshotDate"
                                            stroke="#4B5563"
                                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                            tickFormatter={formatDate}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            stroke="#4B5563"
                                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                            domain={['auto', 'auto']}
                                            width={55}
                                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            fill="url(#priceGradient)"
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                {hasMore && (
                                    <div className="flex justify-center mt-4">
                                        <Button
                                            variant="outline"
                                            className="text-gray-300 border-gray-700 text-sm"
                                            onClick={() => { const next = page + 1; setPage(next); fetchPriceHistory(next); }}
                                        >
                                            이전 데이터 더 보기
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {isLoggedIn && (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base md:text-lg">위시리스트 추가</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {latestPrice !== null && (
                                <p className="text-gray-400 text-sm">
                                    현재 가격: <span className="text-blue-400 font-bold">{latestPrice.toLocaleString()}원</span>
                                    {latestDiscount !== null && latestDiscount > 0 && (
                                        <span className="text-green-400 ml-2">({latestDiscount}% 할인중)</span>
                                    )}
                                </p>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => { setTargetType('PRICE'); setError(''); }}
                                    className={`text-sm ${targetType === 'PRICE' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                                >
                                    가격 목표
                                </Button>
                                <Button
                                    onClick={() => { setTargetType('DISCOUNT'); setError(''); }}
                                    className={`text-sm ${targetType === 'DISCOUNT' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                                >
                                    할인율 목표
                                </Button>
                            </div>
                            <Input
                                className="bg-gray-800 border-gray-700 text-white"
                                placeholder={targetType === 'PRICE' ? `목표 가격 입력 (원)` : `목표 할인율 입력 (%)`}
                                value={targetValue}
                                onChange={(e) => { setTargetValue(e.target.value); setError(''); }}
                            />
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            {wishlistMsg && <p className="text-green-400 text-sm">{wishlistMsg}</p>}
                            <Button onClick={handleAddWishList} className="bg-blue-600 hover:bg-blue-700 text-white">
                                위시리스트 추가
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}