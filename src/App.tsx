import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import GameListPage from './pages/GameListPage';
import GameDetailPage from './pages/GameDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WishListPage from './pages/WishListPage';
import MyPage from './pages/MyPage.tsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/games" element={<GameListPage />} />
                <Route path="/games/:appId" element={<GameDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/wishlist" element={<WishListPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;