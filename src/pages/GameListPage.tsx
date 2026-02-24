import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameList, getGameListByGenres, getGenres } from '../api';
import { Game, Genre } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function GameListPage() {
    const navigate = useNavigate();
    const [games, setGames] = useState<Game[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchGenres = async () => {
        try {
            const res = await getGenres();
            setGenres(res.data.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchGames = async (p: number, genreIds: number[]) => {
        try {
            const res = genreIds.length === 0
                ? await getGameList(p, 20)
                : await getGameListByGenres(genreIds, p, 20);
            const newData = res.data.data;
            if (newData.length < 20) setHasMore(false);
            if (p === 0) {
                setGames(newData);
            } else {
                setGames((prev) => [...prev, ...newData]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchGenres();
        fetchGames(0, []);
    }, []);

    const toggleGenre = (genreId: number) => {
        const updated = selectedGenreIds.includes(genreId)
            ? selectedGenreIds.filter((id) => id !== genreId)
            : [...selectedGenreIds, genreId];
        setSelectedGenreIds(updated);
        setPage(0);
        setHasMore(true);
        fetchGames(0, updated);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchGames(nextPage, selectedGenreIds);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
                <h1 className="text-xl font-bold text-blue-400 cursor-pointer" onClick={() => navigate('/')}>
                    Steam Tracker
                </h1>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-6">
                <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                        <Badge
                            key={genre.genreId}
                            onClick={() => toggleGenre(genre.genreId)}
                            className={`cursor-pointer px-3 py-1 ${
                                selectedGenreIds.includes(genre.genreId)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {genre.genreName}
                        </Badge>
                    ))}
                </div>

                {games.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">게임이 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {games.map((game) => (
                            <Card
                                key={game.appId}
                                className="bg-gray-900 border-gray-800 cursor-pointer hover:border-blue-500 transition overflow-hidden"
                                onClick={() => navigate(`/games/${game.appId}`)}
                            >
                                <img
                                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
                                    alt={game.name}
                                    className="w-full h-36 object-cover"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <CardContent className="p-4 flex flex-col gap-2">
                                    <p className="text-white font-semibold truncate">{game.name}</p>
                                    <div className="flex items-center gap-2">
                                        {game.discountPercent > 0 && (
                                            <Badge className="bg-green-600 text-white">
                                                -{game.discountPercent}%
                                            </Badge>
                                        )}
                                        <p className="text-blue-400 font-bold">
                                            {game.currentPrice === 0 ? '무료' : `${game.currentPrice.toLocaleString()}원`}
                                        </p>
                                        {game.discountPercent > 0 && (
                                            <p className="text-gray-500 line-through text-sm">
                                                {game.originalPrice.toLocaleString()}원
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {hasMore && games.length > 0 && (
                    <div className="flex justify-center mt-4">
                        <Button variant="outline" className="text-gray-300 border-gray-700" onClick={handleLoadMore}>
                            더 보기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}