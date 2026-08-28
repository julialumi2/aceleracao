import Header from "./Header.jsx";
import Hero from "./Hero.jsx";
import SocialProof from "./SocialProof.jsx";
import PainPoints from "./PainPoints.jsx";
import Razoes from "./Razoes.jsx";
import Passos from "./Passos.jsx";
import Entregas from "./Entregas.jsx";
import ParaVoce from "./ParaVoce.jsx";
import Recibo from "./Recibo.jsx";
import Oferta from "./Oferta.jsx";
import ConversaSeria from "./ConversaSeria.jsx";
import SobreAutor from "./SobreAutor.jsx";
import Faq from "./Faq.jsx";
import Footer from "./Footer.jsx";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-ink">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <PainPoints />
        <Razoes />
        <Passos />
        <Entregas />
        <ParaVoce />
        <Recibo />
        <Oferta />
        <ConversaSeria />
        <SobreAutor />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
