import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPriceHistory, addWishList } from '../api';
import { PriceHistory } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
        ? priceHistory.reduce((latest, current) =>
            current.snapshotDate > latest.snapshotDate ? current : latest
        )
        : null;
    const latestPrice = latestData?.price ?? null;
    const latestDiscount = latestData?.discountPercent ?? null;

    const fetchPriceHistory = async (p: number) => {
        try {
            const res = await getPriceHistory(Number(appId), p, 30);
            const newData = res.data.data;
            if (newData.length < 30) setHasMore(false);
            if (p === 0) {
                setPriceHistory(newData);
            } else {
                setPriceHistory((prev) => [...newData, ...prev]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchPriceHistory(0);
    }, [appId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPriceHistory(nextPage);
    };

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

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
                <h1 className="text-xl font-bold text-blue-400 cursor-pointer" onClick={() => navigate('/')}>
                    Steam Tracker
                </h1>
                <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/games')}>
                    게임 목록
                </Button>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-8">
                {/* 게임 이미지 - 클릭시 스팀 상점 이동 */}
                {/* 게임 이미지 - 클릭시 스팀 상점 이동 */}
                <div className="flex gap-6 items-start">
                    <a href={`https://store.steampowered.com/app/${appId}/`} target="_blank" rel="noopener noreferrer">
                        <img
                            src={`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`}
                            alt="game"
                            className="rounded-lg w-72 object-cover cursor-pointer hover:opacity-80 transition"
                            onError={(e) => { e.currentTarget.src = '/no-image.png'; }}
                        />
                    </a>
                </div>

            {/* 가격 기록 차트 */}
            <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">가격 기록</CardTitle>
                </CardHeader>
                <CardContent>
                    {priceHistory.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">데이터가 없습니다.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={priceHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="snapshotDate" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                                    <Line type="monotone" dataKey="price" stroke="#3B82F6" dot={false} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                            {hasMore && (
                                <div className="flex justify-center mt-4">
                                    <Button variant="outline" className="text-gray-300 border-gray-700" onClick={handleLoadMore}>
                                        이전 데이터 더 보기
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* 위시리스트 추가 - 로그인한 경우만 */}
            {isLoggedIn && (
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">위시리스트 추가</CardTitle>
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
                                className={targetType === 'PRICE' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}
                            >
                                가격 목표
                            </Button>
                            <Button
                                onClick={() => { setTargetType('DISCOUNT'); setError(''); }}
                                className={targetType === 'DISCOUNT' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}
                            >
                                할인율 목표
                            </Button>
                        </div>
                        <Input
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder={targetType === 'PRICE' ? `현재가 미만 목표 가격 입력 (원)` : `현재 할인율 초과 입력 (%)`}
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