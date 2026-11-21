import React from 'react';
import { Tv, Cpu, Disc3, Glasses, Coffee, ShieldCheck } from 'lucide-react';

export function LoungeShowcase() {
  const features = [
    {
      icon: Tv,
      title: 'Sony PS5 Pro & 4K 120Hz OLEDs',
      description: 'Play on 55" LG C3 OLED displays with DualSense Edge controllers, spatial 3D audio, and 120 FPS high-refresh rate HDR gaming.',
      badge: 'Console Pods',
    },
    {
      icon: Cpu,
      title: 'RTX 4090 Battlestations',
      description: 'High-FPS competitive esports arena equipped with Core i9 & Ryzen 7800X3D, RTX 4090/4080, 240Hz 1440p and 360Hz ZOWIE DyAc 2 displays.',
      badge: 'Esports Rig',
    },
    {
      icon: Disc3,
      title: 'Fanatec Direct Drive Sim Rig',
      description: 'Triple 32" panoramic curved displays, Fanatec ClubSport DD+ 15Nm wheelbase, V3 loadcell pedals, and genuine Sparco racing bucket seats.',
      badge: 'Sim Racing',
    },
    {
      icon: Glasses,
      title: 'VR & Flight Combat Simulator',
      description: 'Thrustmaster Warthog HOTAS flight controls, rudder pedals, and Meta Quest 3 VR headset for unmatched aerial and space combat.',
      badge: 'VR Cockpit',
    },
    {
      icon: Coffee,
      title: 'Gourmet Cafe & Energy Bar',
      description: 'Chilled energy drinks (Red Bull, Monster), iced cold coffee, sodas, Maggi varieties, peri-peri french fries, and snacks served to your seat.',
      badge: 'Refreshments',
    },
    {
      icon: ShieldCheck,
      title: 'High-Speed Dedicated Fiber',
      description: 'Low-latency dual 1Gbps dedicated leased-line connections ensuring sub-5ms ping to Mumbai/Singapore gaming servers for zero lag.',
      badge: 'Zero Lag',
    },
  ];

  return (
    <section className="border-t border-[#1b1f2a] bg-[#0c0e14] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            PRO-GRADE GAMING ENVIRONMENT
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Engineered for Competitive &amp; Casual Play
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Every gaming screen is calibrated for peak color accuracy, maximum frame rates, and ergonomic comfort during long sessions.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800/80 bg-[#12151e] p-6 hover:border-zinc-700 transition-colors shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

