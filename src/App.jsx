import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import LandingPage from "./components/landing/LandingPage.jsx";
import LeadFormPage from "./components/landing/LeadFormPage.jsx";
import OnboardingLandingPage from "./components/landing/OnboardingLandingPage.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import { supabase } from "./lib/supabase.js";

// Navegação simples via estado global (sem router) — troque por
// react-router-dom quando o projeto sair do estágio de protótipo.
//
// Três "sites" no mesmo deploy, separados por subdomínio (com fallback por
// path pra testar em localhost, onde não dá pra ter subdomínio de verdade):
// - aceleracao.artesanosburger.com.br          -> landing pública + /comecar
// - portal.aceleracao.artesanosburger.com.br   -> direto pro login da equipe
// - cadastro.aceleracao.artesanosburger.com.br -> onboarding de quem já fechou
const LEAD_FORM_PATH = "/comecar";
const ONBOARDING_PATH = "/cadastro";
const PORTAL_PATH = "/painel";

function resolveEntrada() {
  const host = window.location.hostname;
  const path = window.location.pathname;
  if (host.startsWith("portal.") || path === PORTAL_PATH) return "portal";
  if (host.startsWith("cadastro.") || path === ONBOARDING_PATH) return "onboarding";
  if (path === LEAD_FORM_PATH) return "leadform";
  return "landing";
}

export default function App() {
  // landing | leadform | onboarding | portal | auth | dashboard | admin
  const [screen, setScreen] = useState(resolveEntrada);
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [session, setSession] = useState(null);
  const [checkingAdminSession, setCheckingAdminSession] = useState(screen === "landing");

  useEffect(() => {
    // Só precisa dessa checagem no domínio principal — o portal já faz a
    // própria verificação de sessão (AdminApp), e as duas páginas de
    // formulário público não são protegidas por login nenhum.
    if (screen !== "landing") return;
    // Se já existir uma sessão de equipe válida, pula direto pro painel —
    // sem isso, todo F5 jogava a equipe de volta pra landing page pública,
    // mesmo com a sessão do Supabase ainda ativa.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setScreen("admin");
      setCheckingAdminSession(false);
    });
  }, []);

  // Cadastro de cliente agora é feito pelo Google Forms (link no Hero), e
  // login só existe pra equipe (AdminApp). goToAuth/"auth"/"dashboard" ficam
  // aqui só desconectados da UI pública — religue se voltar a ter login de cliente.
  function goToAuth(mode = "login") {
    setAuthMode(mode);
    setScreen("auth");
  }

  function handleAuthenticated(user) {
    setSession(user);
    setScreen("dashboard");
  }

  function handleLogout() {
    setSession(null);
    setScreen("landing");
  }

  if (checkingAdminSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Loader2 size={20} className="animate-spin text-emerald-bright" />
      </div>
    );
  }

  if (screen === "leadform") {
    return <LeadFormPage />;
  }

  if (screen === "onboarding") {
    return <OnboardingLandingPage />;
  }

  if (screen === "portal") {
    return <AdminApp initialScreen="login" onExit={() => setScreen("landing")} />;
  }

  if (screen === "auth") {
    return (
      <AuthPage
        initialMode={authMode}
        onAuthenticated={handleAuthenticated}
        onBackToLanding={() => setScreen("landing")}
      />
    );
  }

  if (screen === "dashboard") {
    return <DashboardLayout session={session} onLogout={handleLogout} />;
  }

  if (screen === "admin") {
    return <AdminApp onExit={() => setScreen("landing")} />;
  }

  return <LandingPage />;
}
