// nextjs/app/clases/page.tsx
import ClasesHero   from '@/components/clases/ClasesHero';
import DiagBanner   from '@/components/clases/DiagBanner';
import Incluye      from '@/components/clases/Incluye';
import PreciosGrid  from '@/components/clases/PreciosGrid';
import PacksGrid    from '@/components/clases/PacksGrid';
import Testimonios  from '@/components/clases/Testimonios';
import FaqList      from '@/components/clases/FaqList';
import FinalCta     from '@/components/clases/FinalCta';

export const metadata = {
  title:       'Clases particulares — ProfeAngeles',
  description: 'Clases personalizadas de Matematicas, Ciencias y Python en Curico y online. Primera sesion diagnostica gratuita.',
};

export default function ClasesPage() {
  return (
    <main className="clases-page">
      <ClasesHero />
      <DiagBanner />
      <Incluye />
      <PreciosGrid />
      <PacksGrid />
      <Testimonios />
      <FaqList />
      <FinalCta />
    </main>
  );
}