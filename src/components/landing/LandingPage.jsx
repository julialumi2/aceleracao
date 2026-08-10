import Header from "./Header.jsx";
import Hero from "./Hero.jsx";
import Features from "./Features.jsx";
import Pricing from "./Pricing.jsx";
import Footer from "./Footer.jsx";

export default function LandingPage({ onEnterApp, onStartMentoring, onAdminAccess }) {
  return (
    <div className="min-h-screen bg-base text-ink">
      <Header onEnter={onEnterApp} />
      <main>
        <Hero onStartMentoring={onStartMentoring} onEnterApp={onEnterApp} />
        <Features />
        <Pricing />
      </main>
      <Footer onAdminAccess={onAdminAccess} />
    </div>
  );
}
