// app/page.tsx
// Página principal — ruta /
// Server Component

import Hero from "@/components/landing/Hero";
import ProfileSections from "@/components/landing/ProfileSections";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProfileSections />
    </main>
  );
}