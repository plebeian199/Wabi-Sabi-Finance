"use client";

import { useState } from "react";
import { Edit2, Clock, Trash2, Check, X, Loader2 } from "lucide-react";
import { deleteAccount, updateAccountBalance } from "@/app/actions";

type Account = {
  id: string;
  name: string;
  category: string;
  is_liability: boolean;
  current_balance: number;
  last_updated: string;
};

export function AssetTable({ accounts }: { accounts: Account[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleEditClick = (id: string, currentVal: number) => {
    setEditingId(id);
    setEditValue(currentVal.toString());
  };

  const handleSaveEdit = async (id: string) => {
    setLoadingId(id);
    await updateAccountBalance(id, parseFloat(editValue));
    setEditingId(null);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus akun ini dari database?")) {
      setLoadingId(id);
      await deleteAccount(id);
      setLoadingId(null);
    }
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-xl p-8 shadow-2xl mt-8 text-center text-zinc-500">
        Belum ada akun atau aset yang dicatat.
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden mt-8">
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-white text-xl font-medium tracking-tight">Akun Aktif & Kepemilikan</h2>
          <p className="text-zinc-400 text-sm mt-1">Tinjau saldo saat ini dan valuasi terbaru</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Akun / Aset</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Kategori</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Pemilik</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Nilai / Saldo</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Terakhir Diperbarui</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {accounts.map((asset) => (
              <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-4 px-4 text-sm tracking-wide text-white font-medium">{asset.name}</td>
                <td className="py-4 px-4 text-xs text-zinc-400">{asset.category}</td>
                <td className="py-4 px-4">
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/5 text-zinc-300 px-2 py-1 rounded-md border border-white/10">
                    --
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-white font-mono text-right">
                  {editingId === asset.id ? (
                    <input 
                      type="number" 
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-32 bg-black/40 border border-white/20 rounded-md px-2 py-1 text-white text-right focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      autoFocus
                    />
                  ) : (
                    `Rp ${asset.current_balance.toLocaleString('id-ID')}`
                  )}
                </td>
                <td className="py-4 px-4 text-xs text-right text-zinc-500">
                  <span className="inline-flex items-center gap-1.5 justify-end">
                    <Clock size={12} className="text-zinc-600" />
                    {new Date(asset.last_updated).toLocaleDateString("id-ID", { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  {loadingId === asset.id ? (
                    <Loader2 size={16} className="animate-spin text-zinc-500 inline-block" />
                  ) : editingId === asset.id ? (
                    <div className="inline-flex gap-1">
                      <button onClick={() => handleSaveEdit(asset.id)} className="text-emerald-500 hover:text-emerald-400 p-1.5 rounded-md hover:bg-emerald-400/10" title="Simpan">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-400/10" title="Batal">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(asset.id, asset.current_balance)} className="text-zinc-500 hover:text-blue-400 p-1.5 rounded-md hover:bg-blue-400/10" title="Edit Cepat">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(asset.id)} className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-400/10" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
