'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle2, Building, Phone, Clock, DollarSign } from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { CafeSettings } from '@/types/cafe';

export default function CafeSettingsPage() {
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [cafeName, setCafeName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [googleMaps, setGoogleMaps] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [taxRate, setTaxRate] = useState('0');

  useEffect(() => {
    async function load() {
      try {
        const s = await cafeRepo.getCafeSettings();
        setSettings(s);
        setCafeName(s.cafe_name);
        setTagline(s.tagline || '');
        setAddress(s.address);
        setPhone(s.phone);
        setWhatsapp(s.whatsapp_number);
        setEmail(s.email || '');
        setGoogleMaps(s.google_maps_url || '');
        setOpeningHours(s.opening_hours);
        setCurrency(s.currency);
        setTimezone(s.timezone);
        setTaxRate(String(s.tax_rate));
      } catch (err: any) {
        setError(err?.message || 'Failed to load cafe settings.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const updated = await cafeRepo.updateCafeSettings({
        id: settings.id,
        cafe_name: cafeName.trim(),
        tagline: tagline.trim() || null,
        address: address.trim(),
        phone: phone.trim(),
        whatsapp_number: whatsapp.trim(),
        email: email.trim() || null,
        google_maps_url: googleMaps.trim() || null,
        opening_hours: openingHours.trim(),
        currency: currency.trim() || '₹',
        timezone: timezone.trim() || 'Asia/Kolkata',
        tax_rate: parseFloat(taxRate) || 0,
      });

      setSettings(updated);
      setSuccess('Cafe settings updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to update settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !settings) {
    return <div className="py-12 text-xs text-zinc-400">Loading lounge settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-400" />
          <span>Cafe &amp; Business Profile Settings</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Configure lounge identity, address, contact numbers, tax configuration, and operating hours.
        </p>
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

      <form onSubmit={handleSave} className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6 sm:p-8 space-y-6">
        {/* Basic Brand Info */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-1.5">
            <Building className="h-4 w-4" />
            <span>Lounge Brand &amp; Display</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Gaming Cafe Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tagline / Header Description
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location & Opening Hours */}
        <div className="border-t border-zinc-800/80 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>Location &amp; Hours</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Physical Lounge Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Opening Hours Display
                </label>
                <input
                  type="text"
                  required
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="e.g. 11:00 AM – 01:00 AM (All 7 Days)"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Google Maps Location Link
                </label>
                <input
                  type="url"
                  value={googleMaps}
                  onChange={(e) => setGoogleMaps(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="border-t border-zinc-800/80 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-1.5">
            <Phone className="h-4 w-4" />
            <span>Contact &amp; WhatsApp Enquiries</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Calling Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                WhatsApp Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Financial & Tax Configuration */}
        <div className="border-t border-zinc-800/80 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            <span>Currency &amp; Tax Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Default Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tax Rate (% on Invoices)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-zinc-800/80">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Saving Settings...' : 'Save Cafe Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

