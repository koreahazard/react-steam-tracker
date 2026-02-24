import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const res = await login(username, password);
            localStorage.setItem('accessToken', res.data.data.accessToken);
            navigate('/');
        } catch (e: any) {
            setError(e.response?.data?.message || '로그인 실패');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <Card className="w-full max-w-md bg-gray-900 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white text-2xl text-center">Steam Tracker</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-300">아이디</Label>
                        <Input
                            className="bg-gray-800 border-gray-700 text-white"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="아이디 입력"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-300">비밀번호</Label>
                        <Input
                            type="password"
                            className="bg-gray-800 border-gray-700 text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호 입력"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white">
                        로그인
                    </Button>
                    <p className="text-gray-400 text-sm text-center">
                        계정이 없으신가요?{' '}
                        <Link to="/signup" className="text-blue-400 hover:underline">
                            회원가입
                        </Link>
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                        <Link to="/" className="text-gray-500 hover:underline">
                            로그인 없이 둘러보기
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}