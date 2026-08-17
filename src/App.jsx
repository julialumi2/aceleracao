import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import LandingPage from "./components/landing/LandingPage.jsx";
import LeadFormPage from "./components/landing/LeadFormPage.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import { supabase } from "./lib/supabase.js";

// Navegação simples via estado global (sem router) — troque por
// react-router-dom quando o projeto sair do estágio de protótipo.
const LEAD_FORM_PATH = "/comecar";

export default function App() {
  // landing | leadform | auth | dashboard | admin
  const [screen, setScreen] = useState(() =>
    window.location.pathname === LEAD_FORM_PATH ? "leadform" : "landing"
  );
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [session, setSession] = useState(null);
  const [checkingAdminSession, setCheckingAdminSession] = useState(true);

  useEffect(() => {
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

  return <LandingPage onAdminAccess={() => setScreen("admin")} />;
}
