import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameList, getGameListByGenres, getGenres } from '../api';
import { Game, Genre } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const SORT_OPTIONS = [
    { value: 'default', label: '기본' },
    { value: 'discount', label: '할인율 높은순' },
    { value: 'price_asc', label: '가격 낮은순' },
    { value: 'price_desc', label: '가격 높은순' },
];

export default function GameListPage() {
    const navigate = useNavigate();
    const [games, setGames] = useState<Game[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState('default');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchGenres = async () => {
        try {
            const res = await getGenres();
            setGenres(res.data.data);
        } catch (e) { console.error(e); }
    };

    const fetchGames = async (p: number, genreIds: number[], sort: string) => {
        setLoading(true);
        try {
            const res = genreIds.length === 0
                ? await getGameList(p, 20, sort)
                : await getGameListByGenres(genreIds, p, 20, sort);
            const newData = res.data.data;
            if (newData.length < 20) setHasMore(false);
            if (p === 0) setGames(newData);
            else setGames((prev) => [...prev, ...newData]);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchGenres();
        fetchGames(0, [], 'default');
    }, []);

    const toggleGenre = (genreId: number) => {
        const updated = selectedGenreIds.includes(genreId)
            ? selectedGenreIds.filter((id) => id !== genreId)
            : [...selectedGenreIds, genreId];
        setSelectedGenreIds(updated);
        setPage(0);
        setHasMore(true);
        fetchGames(0, updated, sortBy);
    };

    const handleSortChange = (sort: string) => {
        setSortBy(sort);
        setPage(0);
        setHasMore(true);
        fetchGames(0, selectedGenreIds, sort);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchGames(nextPage, selectedGenreIds, sortBy);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-800">
                <h1 className="text-xl font-bold text-blue-400 cursor-pointer" onClick={() => navigate('/')}>
                    Steam Tracker
                </h1>
                <Button variant="ghost" className="text-gray-300 text-sm" onClick={() => navigate('/')}>← 홈</Button>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-5">
                {/* 정렬 */}
                <div className="flex gap-2 flex-wrap">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleSortChange(opt.value)}
                            className={`px-3 py-1.5 rounded-full text-sm transition ${
                                sortBy === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* 장르 필터 */}
                <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                        <Badge
                            key={genre.genreId}
                            onClick={() => toggleGenre(genre.genreId)}
                            className={`cursor-pointer px-3 py-1 text-xs ${
                                selectedGenreIds.includes(genre.genreId)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {genre.genreName}
                        </Badge>
                    ))}
                </div>

                {/* 게임 그리드 */}
                {games.length === 0 && !loading ? (
                    <p className="text-gray-400 text-center py-10">게임이 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {games.map((game) => (
                            <Card
                                key={game.appId}
                                className="bg-gray-900 border-gray-800 cursor-pointer hover:border-blue-500 transition overflow-hidden"
                                onClick={() => navigate(`/games/${game.appId}`)}
                            >
                                <div className="relative">
                                    <img
                                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/capsule_sm_120.jpg`}
                                        alt={game.name}
                                        className="w-full h-24 object-cover"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                    {game.discountPercent > 0 && (
                                        <span className="absolute top-1 right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                                            -{game.discountPercent}%
                                        </span>
                                    )}
                                </div>
                                <CardContent className="p-3">
                                    <p className="text-white text-xs font-semibold truncate mb-1">{game.name}</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-blue-400 text-sm font-bold">
                                            {game.currentPrice === 0 ? '무료' : `${game.currentPrice.toLocaleString()}원`}
                                        </p>
                                        {game.discountPercent > 0 && (
                                            <p className="text-gray-500 line-through text-xs">
                                                {game.originalPrice.toLocaleString()}원
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {loading && <p className="text-gray-400 text-center py-4">불러오는 중...</p>}

                {hasMore && games.length > 0 && !loading && (
                    <div className="flex justify-center mt-2">
                        <Button variant="outline" className="text-gray-300 border-gray-700 text-sm" onClick={handleLoadMore}>
                            더 보기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}