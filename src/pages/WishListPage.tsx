import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWishList, deleteWishList } from '../api';
import { WishList } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function WishListPage() {
    const navigate = useNavigate();
    const [wishList, setWishList] = useState<WishList[]>([]);

    const fetchWishList = async () => {
        try {
            const res = await getWishList();
            setWishList(res.data.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchWishList();
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
            {/* 헤더 */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
                <h1
                    className="text-xl font-bold text-blue-400 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    Steam Tracker
                </h1>
                <Button variant="ghost" className="text-gray-300" onClick={() => navigate('/games')}>
                    게임 목록
                </Button>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-6">
                <h2 className="text-2xl font-bold">내 위시리스트</h2>

                {wishList.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">위시리스트가 비어있습니다.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {wishList.map((item) => (
                            <Card key={item.wishListId} className="bg-gray-900 border-gray-800">
                                <CardContent className="p-4 flex items-center justify-between">
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}