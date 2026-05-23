import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSteamIndex, getAccountInfo, getGameList } from '../api';
import { SteamIndex, Game } from '../types';
import {
    CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, XAxis, YAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function MainPage() {
    const navigate = useNavigate();
    const [indexData, setIndexData] = useState<SteamIndex[]>([]);
    const [topDiscountGames, setTopDiscountGames] = useState<Game[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [nickname, setNickname] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const isLoggedIn = !!localStorage.getItem('accessToken');

    const latest = indexData.length > 0 ? indexData[indexData.length - 1] : null;
    const prev = indexData.length > 1 ? indexData[indexData.length - 2] : null;
    const change = latest && prev ? latest.indexValue - prev.indexValue : null;
    const changePercent = latest && prev ? ((change! / prev.indexValue) * 100).toFixed(2) : null;

    const fetchIndex = async (p: number) => {
        try {
            const res = await getSteamIndex(p, 30);
            const newData = res.data.data;
            if (newData.length < 30) setHasMore(false);
            if (p === 0) setIndexData(newData);
            else setIndexData((prev) => [...newData, ...prev]);
        } catch (e) { console.error(e); }
    };

    const fetchTopDiscount = async () => {
        try {
            const res = await getGameList(0, 10, 'discount');
            setTopDiscountGames(res.data.data);
        } catch (e) { console.error(e); }
    };

    const fetchNickname = async () => {
        try {
            const res = await getAccountInfo();
            setNickname(res.data.data.nickname);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchIndex(0);
        fetchTopDiscount();
        if (isLoggedIn) fetchNickname();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/');
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
                    <p className="text-blue-400 font-bold text-sm">{payload[0].value.toFixed(1)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-800">
                <h1 className="text-xl font-bold text-blue-400 cursor-pointer" onClick={() => navigate('/')}>
                    Steam Tracker
                </h1>
                {/* 데스크탑 네비 */}
                <div className="hidden md:flex items-center gap-3">
                    <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/games')}>게임 목록</Button>
                    {isLoggedIn ? (
                        <>
                            <span className="text-gray-300 text-sm">{nickname} 님</span>
                            <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/mypage')}>내 정보</Button>
                            <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/wishlist')}>위시리스트</Button>
                            <Button variant="ghost" className="text-gray-300" onClick={handleLogout}>로그아웃</Button>
                        </>
                    ) : (
                        <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/login')}>로그인</Button>
                    )}
                </div>
                {/* 모바일 햄버거 */}
                <button className="md:hidden text-gray-300 p-2" onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="w-5 h-0.5 bg-gray-300 mb-1"></div>
                    <div className="w-5 h-0.5 bg-gray-300 mb-1"></div>
                    <div className="w-5 h-0.5 bg-gray-300"></div>
                </button>
            </div>

            {/* 모바일 메뉴 */}
            {menuOpen && (
                <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex flex-col gap-2">
                    <Button variant="ghost" className="text-gray-300 justify-start" onClick={() => { navigate('/games'); setMenuOpen(false); }}>게임 목록</Button>
                    {isLoggedIn ? (
                        <>
                            <span className="text-gray-400 text-sm px-3">{nickname} 님</span>
                            <Button variant="ghost" className="text-gray-300 justify-start" onClick={() => { navigate('/mypage'); setMenuOpen(false); }}>내 정보</Button>
                            <Button variant="ghost" className="text-gray-300 justify-start" onClick={() => { navigate('/wishlist'); setMenuOpen(false); }}>위시리스트</Button>
                            <Button variant="ghost" className="text-gray-300 justify-start" onClick={handleLogout}>로그아웃</Button>
                        </>
                    ) : (
                        <Button variant="ghost" className="text-gray-300 justify-start" onClick={() => { navigate('/login'); setMenuOpen(false); }}>로그인</Button>
                    )}
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col gap-6">
                {/* 요약 카드 3개 */}
                {latest && (
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardContent className="p-4 md:p-6">
                                <p className="text-gray-400 text-xs md:text-sm mb-1">현재 지수</p>
                                <p className="text-white text-xl md:text-2xl font-bold">{latest.indexValue.toFixed(1)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-900 border-gray-800">
                            <CardContent className="p-4 md:p-6">
                                <p className="text-gray-400 text-xs md:text-sm mb-1">전일 대비</p>
                                <p className={`text-xl md:text-2xl font-bold ${change !== null && change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {change !== null ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}` : '-'}
                                </p>
                                {changePercent && (
                                    <p className={`text-xs mt-1 ${change !== null && change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {change !== null && change >= 0 ? '+' : ''}{changePercent}%
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-900 border-gray-800">
                            <CardContent className="p-4 md:p-6">
                                <p className="text-gray-400 text-xs md:text-sm mb-1">추적 게임 수</p>
                                <p className="text-white text-xl md:text-2xl font-bold">{latest.totalGameCount.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 지수 그래프 */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white text-base md:text-lg">Steam 가격 지수</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {indexData.length === 0 ? (
                            <p className="text-gray-400 text-center py-10">데이터가 없습니다.</p>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={indexData}>
                                        <defs>
                                            <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                                        <XAxis
                                            dataKey="recordDate"
                                            stroke="#4B5563"
                                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                            tickFormatter={formatDate}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            stroke="#4B5563"
                                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                            domain={['auto', 'auto']}
                                            width={45}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="indexValue"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            fill="url(#indexGradient)"
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                {hasMore && (
                                    <div className="flex justify-center mt-4">
                                        <Button
                                            variant="outline"
                                            className="text-gray-300 border-gray-700 text-sm"
                                            onClick={() => { const next = page + 1; setPage(next); fetchIndex(next); }}
                                        >
                                            이전 데이터 더 보기
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* 할인 TOP 10 */}
                {topDiscountGames.length > 0 && (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base md:text-lg">🔥 오늘의 할인 TOP 10</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-800">
                                {topDiscountGames.map((game, index) => (
                                    <div
                                        key={game.appId}
                                        className="flex items-center gap-3 px-4 md:px-6 py-3 cursor-pointer hover:bg-gray-800 transition"
                                        onClick={() => navigate(`/games/${game.appId}`)}
                                    >
                                        <span className="text-gray-500 text-sm w-5 text-right shrink-0">{index + 1}</span>
                                        <img
                                            src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
                                            alt={game.name}
                                            className="w-12 h-9 object-cover rounded shrink-0"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                        <p className="text-white text-sm flex-1 truncate">{game.name}</p>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge className="bg-green-700 text-white text-xs">-{game.discountPercent}%</Badge>
                                            <span className="text-blue-400 text-sm font-semibold hidden sm:block">
                                                {game.currentPrice === 0 ? '무료' : `${game.currentPrice.toLocaleString()}원`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}