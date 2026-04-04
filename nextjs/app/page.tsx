// app/page.tsx
// Página principal — ruta /
// Server Component

import Hero from "@/components/landing/Hero";
import MarqueeBand from "@/components/landing/MarqueeBand";
import ProfileSections from "@/components/landing/ProfileSections";

export default function Home() {
  return (
    <main>
      <Hero />
      <MarqueeBand />
      <ProfileSections />
    </main>
  );
}