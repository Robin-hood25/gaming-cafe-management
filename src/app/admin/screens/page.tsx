'use client';

import React, { useEffect, useState } from 'react';
import { 
  Monitor, Plus, Edit2, Trash2, Wrench, CheckCircle2, 
  X, AlertCircle, ArrowUpDown, Power 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { Screen } from '@/types/cafe';
import { formatCurrency } from '@/lib/utils';

export default function ScreensManagementPage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [screenName, setScreenName] = useState('');
  const [screenType, setScreenType] = useState('PS5');
  const [specs, setSpecs] = useState('');
  const [hourlyRate, setHourlyRate] = useState('120');
  const [sortOrder, setSortOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadScreens = async () => {
    try {
      const list = await cafeRepo.getScreens();
      setScreens(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load screens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScreens();
  }, []);

  const resetForm = () => {
    setScreenName('');
    setScreenType('PS5');
    setSpecs('');
    setHourlyRate('120');
    setSortOrder(String(screens.length + 1));
    setIsActive(true);
    setIsMaintenance(false);
    setEditingScreen(null);
    setIsAddModalOpen(false);
    setError(null);
  };

  const openEditModal = (screen: Screen) => {
    setEditingScreen(screen);
    setScreenName(screen.screen_name);
    setScreenType(screen.screen_type);
    setSpecs(screen.specs || '');
    setHourlyRate(String(screen.hourly_rate));
    setSortOrder(String(screen.sort_order));
    setIsActive(screen.is_active);
    setIsMaintenance(screen.maintenance_status);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenName.trim()) {
      setError('Screen name is required.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      if (editingScreen) {
        await cafeRepo.updateScreen(editingScreen.id, {
          screen_name: screenName.trim(),
          screen_type: screenType,
          specs: specs.trim() || null,
          hourly_rate: parseFloat(hourlyRate) || 100,
          sort_order: parseInt(sortOrder, 10) || 0,
          is_active: isActive,
          maintenance_status: isMaintenance,
        });
        setSuccess(`Screen "${screenName}" updated successfully.`);
      } else {
        await cafeRepo.createScreen({
          screen_name: screenName.trim(),
          screen_type: screenType,
          specs: specs.trim() || null,
          hourly_rate: parseFloat(hourlyRate) || 100,
          sort_order: parseInt(sortOrder, 10) || screens.length + 1,
          is_active: isActive,
          maintenance_status: isMaintenance,
        });
        setSuccess(`Screen "${screenName}" created successfully.`);
      }
      resetForm();
      await loadScreens();
    } catch (err: any) {
      setError(err?.message || 'Failed to save screen.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMaintenance = async (screen: Screen) => {
    try {
      const nextStatus = !screen.maintenance_status;
      await cafeRepo.updateScreen(screen.id, { maintenance_status: nextStatus });
      setSuccess(`Screen "${screen.screen_name}" maintenance set to ${nextStatus ? 'ON' : 'OFF'}.`);
      await loadScreens();
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle maintenance.');
    }
  };

  const toggleActive = async (screen: Screen) => {
    try {
      const nextStatus = !screen.is_active;
      await cafeRepo.updateScreen(screen.id, { is_active: nextStatus });
      setSuccess(`Screen "${screen.screen_name}" active status set to ${nextStatus ? 'ACTIVE' : 'INACTIVE'}.`);
      await loadScreens();
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle active status.');
    }
  };

  const handleDelete = async (screen: Screen) => {
    if (!confirm(`Are you sure you want to remove or archive "${screen.screen_name}"? This cannot be undone if deleted.`)) {
      return;
    }
    try {
      await cafeRepo.deleteScreen(screen.id);
      setSuccess(`Screen "${screen.screen_name}" deleted.`);
      await loadScreens();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete screen.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Monitor className="h-6 w-6 text-blue-400" />
            <span>Gaming Screen Management</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Configure screens, stations, simulator rigs, hourly rates, and toggle hardware maintenance.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Screen</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Screens Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11131a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161922] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Screen Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Hourly Rate</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {screens.map((screen) => (
                <tr key={screen.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-zinc-400">#{screen.sort_order}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-sm">{screen.screen_name}</p>
                    {screen.specs && <p className="text-[11px] text-zinc-400 truncate max-w-xs">{screen.specs}</p>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-200">
                      {screen.screen_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {formatCurrency(screen.hourly_rate)}/hr
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {screen.maintenance_status ? (
                        <span className="rounded bg-amber-950 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                          <Wrench className="h-3 w-3" /> Maintenance
                        </span>
                      ) : screen.is_active ? (
                        <span className="rounded bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleMaintenance(screen)}
                        title={screen.maintenance_status ? 'Restore to service' : 'Mark as Maintenance'}
                        className={`rounded-lg p-1.5 border text-xs ${
                          screen.maintenance_status
                            ? 'bg-amber-950 border-amber-500/40 text-amber-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Wrench className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => toggleActive(screen)}
                        title={screen.is_active ? 'Disable Screen' : 'Enable Screen'}
                        className={`rounded-lg p-1.5 border text-xs ${
                          screen.is_active
                            ? 'bg-zinc-900 border-zinc-800 text-emerald-400 hover:text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => openEditModal(screen)}
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(screen)}
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-red-400 hover:border-red-500/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#12141a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingScreen ? 'Edit Gaming Screen' : 'Add New Gaming Station'}
              </h3>
              <button onClick={resetForm} className="rounded-lg p-1.5 text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Screen Name / Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="e.g. SCREEN 11 (PS5 Pro Station Omega)"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Station Type
                  </label>
                  <select
                    value={screenType}
                    onChange={(e) => setScreenType(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PS5">PS5</option>
                    <option value="PC">PC Esports Rig</option>
                    <option value="Xbox Series X">Xbox Series X</option>
                    <option value="Racing Sim">Racing Simulator</option>
                    <option value="VR Pod">VR Flight / Pod</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Base Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Hardware Specs &amp; Display Description
                </label>
                <textarea
                  rows={2}
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="e.g. 55'' LG C3 4K 120Hz OLED, DualSense Edge, Wireless Headset"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMaintenance}
                      onChange={(e) => setIsMaintenance(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-0"
                    />
                    <span>Maintenance</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-0"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingScreen ? 'Update Screen' : 'Create Screen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

