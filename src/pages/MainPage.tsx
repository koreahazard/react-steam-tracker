import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSteamIndex, getAccountInfo } from '../api';
import { SteamIndex } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function MainPage() {
    const navigate = useNavigate();
    const [indexData, setIndexData] = useState<SteamIndex[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [nickname, setNickname] = useState('');
    const isLoggedIn = !!localStorage.getItem('accessToken');

    const fetchIndex = async (p: number) => {
        try {
            const res = await getSteamIndex(p, 30);
            const newData = res.data.data;
            if (newData.length < 30) setHasMore(false);
            if (p === 0) {
                setIndexData(newData);
            } else {
                setIndexData((prev) => [...newData, ...prev]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchNickname = async () => {
        try {
            const res = await getAccountInfo();
            setNickname(res.data.data.nickname);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchIndex(0);
        if (isLoggedIn) fetchNickname();
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchIndex(nextPage);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
                <h1 className="text-xl font-bold text-blue-400 cursor-pointer" onClick={() => navigate('/')}>
                    Steam Tracker
                </h1>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/games')}>
                        게임 목록
                    </Button>
                    {isLoggedIn ? (
                        <>
                            <span className="text-gray-300 text-sm">{nickname} 님</span>
                            <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/mypage')}>
                                내 정보
                            </Button>
                            <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/wishlist')}>
                                위시리스트
                            </Button>
                            <Button variant="ghost" className="text-gray-300" onClick={handleLogout}>
                                로그아웃
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/login')}>
                            로그인
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-8">
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Steam 가격 지수</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {indexData.length === 0 ? (
                            <p className="text-gray-400 text-center py-10">데이터가 없습니다.</p>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={indexData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="recordDate" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                                        <Line type="monotone" dataKey="indexValue" stroke="#3B82F6" dot={false} strokeWidth={2} />
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
            </div>
        </div>
    );
}