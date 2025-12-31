
'use client';

import { useState } from 'react';
import { fetchIngredients, formatDate } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [batchNumber, setBatchNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await fetchIngredients(batchNumber);
      if (data) {
        setResult(data);
      } else {
        setError('找不到該批號的食材資訊');
      }
    } catch (err) {
      // Log removed to keep console clean, can add back for debugging
      setError('查詢發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.1),transparent_50%)] pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 mb-4">
              FOOD TRACE
            </h1>
            <p className="text-zinc-500">Secure. Transparent. Trusted.</p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="batch" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                  Batch Number
                </label>
                <div className="flex gap-2">
                  <input
                    id="batch"
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="MG20241201-001"
                    className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-mono"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 rounded-lg font-medium transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
                  >
                    {loading ? '...' : 'SCAN'}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
          </div>

          {result && (
            <div className="mt-8 animate-in">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-6 border-b border-zinc-800">
                  <h3 className="font-bold text-xl text-green-400">{result.name}</h3>
                  <p className="text-zinc-500 text-sm mt-1 font-mono">{result.batchNumber}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                      <span className="block text-zinc-500 text-xs mb-1">Origin</span>
                      <span className="text-zinc-200 font-medium">{result.origin}</span>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                      <span className="block text-zinc-500 text-xs mb-1">Supplier</span>
                      <span className="text-zinc-200 font-medium">{result.supplier}</span>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                      <span className="block text-zinc-500 text-xs mb-1">Produced</span>
                      <span className="text-zinc-200 font-medium">{formatDate(result.productionDate)}</span>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                      <span className="block text-zinc-500 text-xs mb-1">Expires</span>
                      <span className="text-zinc-200 font-medium">{formatDate(result.expiryDate)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-zinc-400 text-sm">Test Result</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.testResult === '合格' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400'}`}>
                        {result.testResult}
                      </span>
                    </div>

                    {result.testDetails && (
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(result.testDetails).map(([key, value]: [string, any]) => (
                          <div key={key} className="text-center bg-zinc-800/50 p-2 rounded border border-zinc-800">
                            <span className="block text-zinc-600 text-[10px] uppercase mb-1">{key}</span>
                            <span className="text-zinc-300 text-xs font-mono">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-8 text-center space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 px-6 py-2.5 rounded-full text-sm font-bold tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] uppercase"
          >
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Admin Console
          </Link>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-px w-12 bg-zinc-800 mb-2" />
          <span className="text-zinc-500">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
        </div>
      </footer>
    </div>
  );
}
