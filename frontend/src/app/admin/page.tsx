
'use client';

import { useState, useEffect } from 'react';
import { fetchIngredients, createIngredient, deleteIngredient } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        batchNumber: '',
        name: '',
        origin: '',
        supplier: '',
        productionDate: '',
        expiryDate: '',
        testResult: '合格',
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchIngredients();
            setIngredients(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        loadData();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createIngredient({
                ...formData,
                productionDate: new Date(formData.productionDate).toISOString(),
                expiryDate: new Date(formData.expiryDate).toISOString(),
            });
            alert('已新增');
            setFormData({
                batchNumber: '',
                name: '',
                origin: '',
                supplier: '',
                productionDate: '',
                expiryDate: '',
                testResult: '合格',
            });
            loadData();
        } catch (err) {
            alert('新增失敗 (請確認權限)');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return;
        try {
            await deleteIngredient(id);
            loadData();
        } catch (err) {
            alert('刪除失敗');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <h1 className="text-xl font-bold text-white tracking-widest">ADMIN CONSOLE</h1>
                    </div>
                    <div className="flex gap-4">
                        <a href="/" className="text-zinc-400 hover:text-white transition-colors">View Site</a>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">Logout</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-1 bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-fit">
                        <h2 className="text-lg font-bold mb-6 text-zinc-300 flex items-center gap-2">
                            <span className="text-green-500">➜</span> NEW ENTRY
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm"
                                placeholder="Batch Number"
                                required
                                value={formData.batchNumber}
                                onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                            />
                            <input
                                className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm"
                                placeholder="Name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm"
                                placeholder="Origin"
                                required
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                            />
                            <input
                                className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm"
                                placeholder="Supplier"
                                required
                                value={formData.supplier}
                                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-zinc-500 block mb-1">PRODUCED</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm"
                                        required
                                        value={formData.productionDate}
                                        onChange={e => setFormData({ ...formData, productionDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 block mb-1">EXPIRES</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm"
                                        required
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <select
                                className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm"
                                value={formData.testResult}
                                onChange={e => setFormData({ ...formData, testResult: e.target.value })}
                            >
                                <option value="合格">PASS (合格)</option>
                                <option value="不合格">FAIL (不合格)</option>
                            </select>
                            <button
                                type="submit"
                                className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/50 py-2 rounded font-mono text-sm transition-all"
                            >
                                [ COMMIT DATA ]
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-3 bg-zinc-900 p-6 rounded-xl border border-zinc-800 overflow-hidden">
                        <h2 className="text-lg font-bold mb-6 text-zinc-300 flex items-center gap-2">
                            <span className="text-blue-500">➜</span> DATABASE RECORDS
                        </h2>
                        {loading ? (
                            <div className="text-zinc-500 font-mono animate-pulse">Scanning database...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-mono uppercase">
                                            <th className="p-3">Batch</th>
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Origin</th>
                                            <th className="p-3">Result</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {ingredients.map((item) => (
                                            <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                                                <td className="p-3 font-mono text-zinc-400">{item.batchNumber}</td>
                                                <td className="p-3 font-medium text-white">{item.name}</td>
                                                <td className="p-3 text-zinc-400">{item.origin}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.testResult === '合格' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                        {item.testResult === '合格' ? 'PASS' : 'FAIL'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-zinc-600 hover:text-red-400 transition-colors font-mono text-xs"
                                                    >
                                                        [DELETE]
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {ingredients.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-zinc-600 font-mono">NO RECORDS FOUND</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
