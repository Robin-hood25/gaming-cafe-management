'use client';

import React, { useEffect, useState } from 'react';
import { 
  Tag, Plus, Edit2, Trash2, CheckCircle2, 
  X, AlertCircle, Info, Calculator 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { PricingRule } from '@/types/cafe';
import { formatCurrency } from '@/lib/utils';

export default function PricingSettingsPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [screenType, setScreenType] = useState('PS5');
  const [hourlyRate, setHourlyRate] = useState('120');
  const [minDuration, setMinDuration] = useState('30');
  const [interval, setIntervalVal] = useState('15');
  const [roundingRule, setRoundingRule] = useState<'ceil' | 'floor' | 'round' | 'exact'>('ceil');
  const [minCharge, setMinCharge] = useState('60');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRules = async () => {
    try {
      const list = await cafeRepo.getPricingRules();
      setRules(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load pricing rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const resetForm = () => {
    setScreenType('PS5');
    setHourlyRate('120');
    setMinDuration('30');
    setIntervalVal('15');
    setRoundingRule('ceil');
    setMinCharge('60');
    setEditingRule(null);
    setIsModalOpen(false);
    setError(null);
  };

  const openEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setScreenType(rule.screen_type || 'PS5');
    setHourlyRate(String(rule.hourly_rate));
    setMinDuration(String(rule.minimum_duration));
    setIntervalVal(String(rule.billing_interval));
    setRoundingRule(rule.rounding_rule);
    setMinCharge(String(rule.minimum_session_charge));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await cafeRepo.savePricingRule({
        id: editingRule?.id,
        screen_type: screenType,
        screen_id: null,
        hourly_rate: parseFloat(hourlyRate) || 100,
        minimum_duration: parseInt(minDuration, 10) || 30,
        billing_interval: parseInt(interval, 10) || 15,
        rounding_rule: roundingRule,
        minimum_session_charge: parseFloat(minCharge) || 0,
        is_active: true,
      });

      setSuccess('Pricing rule saved successfully.');
      resetForm();
      await loadRules();
    } catch (err: any) {
      setError(err?.message || 'Failed to save pricing rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rule: PricingRule) => {
    if (!confirm(`Delete pricing rule for ${rule.screen_type}?`)) return;
    try {
      await cafeRepo.deletePricingRule(rule.id);
      setSuccess('Pricing rule deleted.');
      await loadRules();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete rule.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Tag className="h-6 w-6 text-blue-400" />
            <span>Custom Pricing Management</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Configure hourly rates, minimum billable duration, interval increments, and price snapshots.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add Pricing Rule</span>
        </button>
      </div>

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

      {/* Snapshot Policy Explainer */}
      <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 leading-relaxed">
          <strong className="text-white">Price Snapshot Policy:</strong> When a session is initiated, a persistent snapshot of the active pricing rule is permanently written to the session record. Updating future rates here will never alter historical sessions or previously issued invoices.
        </div>
      </div>

      {/* Rules Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11131a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161922] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Station Type</th>
                <th className="py-3.5 px-4">Hourly Rate</th>
                <th className="py-3.5 px-4">Min Duration</th>
                <th className="py-3.5 px-4">Billing Interval</th>
                <th className="py-3.5 px-4">Rounding</th>
                <th className="py-3.5 px-4">Min Charge</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-sm">
                    {rule.screen_type || 'All Stations'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400 text-sm">
                    {formatCurrency(rule.hourly_rate)}/hr
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {rule.minimum_duration} mins
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {rule.billing_interval} mins
                  </td>
                  <td className="py-3.5 px-4 uppercase font-bold text-zinc-400">
                    {rule.rounding_rule}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {formatCurrency(rule.minimum_session_charge)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(rule)}
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule)}
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#12141a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingRule ? 'Edit Pricing Rule' : 'Configure New Pricing Rule'}
              </h3>
              <button onClick={resetForm} className="rounded-lg p-1.5 text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Station Type</label>
                <select
                  value={screenType}
                  onChange={(e) => setScreenType(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="PS5">PS5 (PlayStation 5)</option>
                  <option value="PC">PC (Esports Battlestation)</option>
                  <option value="Xbox Series X">Xbox Series X</option>
                  <option value="Racing Sim">Racing Simulator (Fanatec DD)</option>
                  <option value="VR Pod">VR Flight &amp; Cockpit Pod</option>
                  <option value="Other">Other / General</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Hourly Gaming Rate (₹)</label>
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

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Min Session Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minCharge}
                    onChange={(e) => setMinCharge(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Min Duration (m)</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={minDuration}
                    onChange={(e) => setMinDuration(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Billing Interval (m)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={interval}
                    onChange={(e) => setIntervalVal(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Rounding Rule</label>
                  <select
                    value={roundingRule}
                    onChange={(e) => setRoundingRule(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ceil">Ceil (Up)</option>
                    <option value="floor">Floor (Down)</option>
                    <option value="round">Round (Nearest)</option>
                    <option value="exact">Exact</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRule ? 'Update Rule' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

