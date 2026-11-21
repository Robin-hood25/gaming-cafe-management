import React from 'react';
import { Navbar } from '@/components/public/Navbar';
import { Hero } from '@/components/public/Hero';
import { LiveAvailability } from '@/components/public/LiveAvailability';
import { LoungeShowcase } from '@/components/public/LoungeShowcase';
import { LocationHours } from '@/components/public/LocationHours';
import { Footer } from '@/components/public/Footer';
import { cafeRepo } from '@/lib/cafe-repository';

// Revalidate every 10 seconds on server, but client refreshes via Realtime
export const revalidate = 10;

export default async function HomePage() {
  const [settings, screens] = await Promise.all([
    cafeRepo.getCafeSettings(),
    cafeRepo.getPublicScreenAvailability(),
  ]);

  const availableCount = screens.filter((s) => s.status === 'AVAILABLE').length;
  const totalCount = screens.length;

  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col">
      <Navbar
        settings={settings}
        availableCount={availableCount}
        totalCount={totalCount}
      />

      <main className="flex-1">
        <Hero
          settings={settings}
          totalScreens={totalCount}
          availableScreens={availableCount}
        />

        <LiveAvailability />

        <LoungeShowcase />

        <LocationHours settings={settings} />
      </main>

      <Footer settings={settings} />
    </div>
  );
}

