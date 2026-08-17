import Header from "./Header.jsx";
import Hero from "./Hero.jsx";
import Features from "./Features.jsx";
import ComoFunciona from "./ComoFunciona.jsx";
import Footer from "./Footer.jsx";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-ink">
      <Header />
      <main>
        <Hero />
        <Features />
        <ComoFunciona />
      </main>
      <Footer />
    </div>
  );
}
