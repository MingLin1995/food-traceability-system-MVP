
'use client';

import { useState } from 'react';
import { login } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await login(account, password);
            const token = data.data?.accessToken;
            if (token) {
                localStorage.setItem('token', token);
                router.push('/admin');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            setError('登入失敗，請檢查帳號密碼');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-2xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 text-sm mb-1">Account</label>
                        <input
                            type="text"
                            value={account}
                            onChange={e => setAccount(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
