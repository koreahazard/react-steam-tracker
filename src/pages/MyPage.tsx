import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccountInfo, getWishList, deleteWishList } from '../api';
import { AccountInfo, WishList } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function MyPage() {
    const navigate = useNavigate();
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
    const [wishList, setWishList] = useState<WishList[]>([]);

    const fetchData = async () => {
        try {
            const [accountRes, wishRes] = await Promise.all([
                getAccountInfo(),
                getWishList(),
            ]);
            setAccountInfo(accountRes.data.data);
            setWishList(wishRes.data.data);
        } catch (e) {
            console.error(e);
            navigate('/login');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (wishListId: number) => {
        try {
            await deleteWishList(wishListId);
            setWishList((prev) => prev.filter((w) => w.wishListId !== wishListId));
        } catch (e) {
            console.error(e);
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
                {/* 내 정보 */}
                {accountInfo && (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white">내 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <p className="text-gray-300">아이디: <span className="text-white">{accountInfo.username}</span></p>
                            <p className="text-gray-300">닉네임: <span className="text-white">{accountInfo.nickname}</span></p>
                            <p className="text-gray-300">이메일: <span className="text-white">{accountInfo.email}</span></p>
                        </CardContent>
                    </Card>
                )}

                {/* 위시리스트 */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">내 위시리스트</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {wishList.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">위시리스트가 비어있습니다.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {wishList.map((item) => (
                                    <div key={item.wishListId} className="flex items-center justify-between border-b border-gray-800 pb-3">
                                        <div className="flex flex-col gap-1">
                                            <p
                                                className="text-white font-semibold cursor-pointer hover:text-blue-400"
                                                onClick={() => navigate(`/games/${item.appId}`)}
                                            >
                                                {item.gameName}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-gray-700 text-gray-300">
                                                    {item.targetType === 'PRICE' ? '가격' : '할인율'}
                                                </Badge>
                                                <p className="text-gray-300 text-sm">
                                                    목표: {item.targetType === 'PRICE'
                                                    ? `${item.targetValue.toLocaleString()}원`
                                                    : `${item.targetValue}%`}
                                                </p>
                                                <Badge className={item.inTargetRange ? 'bg-green-600' : 'bg-gray-700'}>
                                                    {item.inTargetRange ? '목표 달성' : '대기중'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300"
                                            onClick={() => handleDelete(item.wishListId)}
                                        >
                                            삭제
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}