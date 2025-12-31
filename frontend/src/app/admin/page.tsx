
'use client';

import { useState, useEffect } from 'react';
import { fetchIngredients, createIngredient, updateIngredient, deleteIngredient, formatDate } from '@/lib/api';
import { useRouter } from 'next/navigation';

function CustomDateInput({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
    return (
        <div className="relative group">
            <label className="text-[10px] text-zinc-500 block mb-1 uppercase tracking-wider font-bold">{label}</label>
            <div
                className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm cursor-pointer hover:border-zinc-500 transition-colors flex items-center justify-between group"
                onClick={(e) => {
                    const picker = e.currentTarget.nextElementSibling as HTMLInputElement;
                    picker.showPicker?.();
                }}
            >
                <span className={value ? 'text-white font-mono' : 'text-zinc-600 font-mono italic'}>
                    {value ? formatDate(value) : 'YYYY/MM/DD'}
                </span>
                <svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <input
                type="date"
                className="absolute opacity-0 pointer-events-none"
                value={value}
                onChange={e => onChange(e.target.value)}
                required
            />
        </div>
    );
}

export default function AdminPage() {
    const router = useRouter();
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        batchNumber: '',
        name: '',
        origin: '',
        supplier: '',
        productionDate: '',
        expiryDate: '',
        testResult: '合格',
        testDetails: '{}',
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
        if (!token || token === 'undefined') {
            router.push('/admin/login');
            return;
        }
        setAuthorized(true);
        loadData();
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-zinc-500 font-mono animate-pulse">VERIFYING ACCESS...</div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let parsedDetails = {};
        try {
            parsedDetails = JSON.parse(formData.testDetails);
        } catch (err) {
            alert('Test Details 格式錯誤 (必需為 JSON)');
            return;
        }

        const payload = {
            ...formData,
            testDetails: parsedDetails,
            productionDate: new Date(formData.productionDate).toISOString(),
            expiryDate: new Date(formData.expiryDate).toISOString(),
        };

        try {
            if (editingId) {
                await updateIngredient(editingId, payload);
                alert('已更新');
            } else {
                await createIngredient(payload);
                alert('已新增');
            }

            setEditingId(null);
            setFormData({
                batchNumber: '',
                name: '',
                origin: '',
                supplier: '',
                productionDate: '',
                expiryDate: '',
                testResult: '合格',
                testDetails: '{}',
            });
            loadData();
        } catch (err) {
            alert(editingId ? '更新失敗' : '新增失敗 (請確認權限)');
            console.error(err);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            batchNumber: item.batchNumber,
            name: item.name,
            origin: item.origin,
            supplier: item.supplier,
            productionDate: item.productionDate ? new Date(item.productionDate).toISOString().split('T')[0] : '',
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
            testResult: item.testResult,
            testDetails: item.testDetails ? JSON.stringify(item.testDetails, null, 2) : '{}',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            batchNumber: '',
            name: '',
            origin: '',
            supplier: '',
            productionDate: '',
            expiryDate: '',
            testResult: '合格',
            testDetails: '{}',
        });
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
                            <span className={editingId ? 'text-blue-500' : 'text-green-500'}>➜</span>
                            {editingId ? 'EDIT ENTRY' : 'NEW ENTRY'}
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
                            <div className="grid grid-cols-1 gap-2">
                                <CustomDateInput
                                    label="PRODUCED"
                                    value={formData.productionDate}
                                    onChange={val => setFormData({ ...formData, productionDate: val })}
                                />
                                <CustomDateInput
                                    label="EXPIRES"
                                    value={formData.expiryDate}
                                    onChange={val => setFormData({ ...formData, expiryDate: val })}
                                />
                            </div>
                            <select
                                className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-sm"
                                value={formData.testResult}
                                onChange={e => setFormData({ ...formData, testResult: e.target.value })}
                            >
                                <option value="合格">PASS (合格)</option>
                                <option value="不合格">FAIL (不合格)</option>
                            </select>

                            <div>
                                <label className="text-[10px] text-zinc-500 block mb-1 uppercase tracking-wider font-bold">Test Details (JSON)</label>
                                <textarea
                                    className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-xs font-mono h-24 focus:outline-none focus:border-zinc-500"
                                    value={formData.testDetails}
                                    onChange={e => setFormData({ ...formData, testDetails: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    type="submit"
                                    className={`w-full ${editingId ? 'bg-blue-600/20 text-blue-400 border-blue-600/50 hover:bg-blue-600/30' : 'bg-green-600/20 text-green-400 border-green-600/50 hover:bg-green-600/30'} border py-2 rounded font-mono text-sm transition-all`}
                                >
                                    {editingId ? '[ UPDATE DATA ]' : '[ COMMIT DATA ]'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="w-full bg-zinc-800 text-zinc-400 py-2 rounded font-mono text-sm hover:bg-zinc-700 transition-all underline"
                                    >
                                        CANCEL EDIT
                                    </button>
                                )}
                            </div>
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
                                            <th className="p-3">Supplier</th>
                                            <th className="p-3">Produced</th>
                                            <th className="p-3">Expires</th>
                                            <th className="p-3">Result</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {ingredients.map((item) => (
                                            <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                                                <td className="p-3 font-mono text-zinc-400">{item.batchNumber}</td>
                                                <td className="p-3 font-medium text-white">{item.name}</td>
                                                <td className="p-3 text-zinc-400 text-xs whitespace-nowrap">{item.origin}</td>
                                                <td className="p-3 text-zinc-400 text-xs whitespace-nowrap">{item.supplier}</td>
                                                <td className="p-3 text-zinc-400 text-xs font-mono">{formatDate(item.productionDate)}</td>
                                                <td className="p-3 text-zinc-400 text-xs font-mono">{formatDate(item.expiryDate)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.testResult === '合格' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                        {item.testResult === '合格' ? 'PASS' : 'FAIL'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-xs"
                                                        >
                                                            [EDIT]
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-zinc-600 hover:text-red-400 transition-colors font-mono text-xs"
                                                        >
                                                            [DELETE]
                                                        </button>
                                                    </div>
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
