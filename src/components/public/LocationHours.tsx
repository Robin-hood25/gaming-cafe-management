import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, Navigation, AlertCircle } from 'lucide-react';
import { CafeSettings } from '@/types/cafe';

interface LocationHoursProps {
  settings: CafeSettings;
}

export function LocationHours({ settings }: LocationHoursProps) {
  return (
    <section className="border-t border-[#1b1f2a] bg-[#0a0b0f] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
          {/* Lounge Location & Contact Details */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              VISIT US IN PERSON
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Location &amp; Opening Hours
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Conveniently situated in Indiranagar, Bengaluru. Drop by anytime during opening hours—no reservation needed.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-[#12141a] p-4">
                <MapPin className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Lounge Address</h3>
                  <p className="mt-0.5 text-xs text-zinc-300 leading-relaxed">
                    {settings.address}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={settings.google_maps_url || 'https://maps.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Open in Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-[#12141a] p-4">
                <Clock className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Hours of Operation</h3>
                  <p className="mt-0.5 text-xs text-zinc-300">
                    {settings.opening_hours}
                  </p>
                  <span className="mt-1 inline-block text-[11px] text-emerald-400 font-medium">
                    Open all 7 days including public holidays
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-[#12141a] p-4">
                <Phone className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">Call or WhatsApp</h3>
                  <p className="mt-0.5 text-xs text-zinc-300">
                    Phone: {settings.phone}
                  </p>
                  <div className="mt-3">
                    <a
                      href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi%20Nexus%20Gaming%20Lounge,%20I%20have%20an%20enquiry`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/40 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Message on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lounge Guidelines & Policies Card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6 lg:p-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              <span>Lounge Guidelines &amp; Code of Conduct</span>
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              We strive to maintain a respectful, hygienic, and premier esports atmosphere for all gamers.
            </p>

            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <span><strong>Walk-in Policy:</strong> Screens are assigned by lounge staff on a first-come, first-served basis. No remote reservations or advance holds.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <span><strong>Minimum Session:</strong> Minimum play time is 30 minutes, after which time can be extended in 15-minute intervals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <span><strong>Hardware Care:</strong> Please treat all DualSense controllers, mechanical keyboards, and sim racing pedals with utmost care.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <span><strong>Food &amp; Drinks:</strong> Outside food and beverages are not allowed inside the lounge. Fresh snacks and cold drinks are available at our counter.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <span><strong>Clean &amp; Non-Smoking:</strong> Strictly non-smoking air-conditioned premises with sanitization stations.</span>
              </li>
            </ul>

            <div className="mt-8 rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
              <p className="text-xs text-blue-300/90 leading-relaxed">
                Hosting a private LAN tournament, birthday party, or corporate esports championship? Message us directly on WhatsApp for full lounge buyout rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

