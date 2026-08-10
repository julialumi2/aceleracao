import { useState } from "react";
import LandingPage from "./components/landing/LandingPage.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import AdminApp from "./admin/AdminApp.jsx";

// Navegação simples via estado global (sem router) — troque por
// react-router-dom quando o projeto sair do estágio de protótipo.
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | auth | dashboard | admin
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [session, setSession] = useState(null);

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

  return (
    <LandingPage
      onEnterApp={() => goToAuth("login")}
      onStartMentoring={() => goToAuth("signup")}
      onAdminAccess={() => setScreen("admin")}
    />
  );
}
