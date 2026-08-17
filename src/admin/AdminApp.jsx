import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import AdminLanding from "./AdminLanding.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminLayout from "./AdminLayout.jsx";
import { supabase } from "../lib/supabase.js";

function sessionFromUser(user) {
  return { name: user.email.split("@")[0] || "Equipe", email: user.email };
}

// Mesmo padrão de navegação por estado usado no app do cliente (App.jsx).
export default function AdminApp({ onExit, initialScreen = "landing" }) {
  const [screen, setScreen] = useState(initialScreen); // landing | login | app
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // A sessão do Supabase Auth já fica salva no navegador — sem isso,
    // todo F5 dentro do painel jogava a equipe de volta pra landing page,
    // mesmo com a sessão ainda válida.
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setSession(sessionFromUser(user));
        setScreen("app");
      }
      setCheckingSession(false);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    // No portal (initialScreen="login"), sair sempre volta direto pro
    // login — sem isso, caía na tela "Painel Interno" intermediária, e
    // dali dava pra ir parar no site público por cima da URL do portal.
    setScreen(initialScreen === "login" ? "login" : "landing");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-ink">
        <Loader2 size={20} className="animate-spin text-emerald-bright" />
      </div>
    );
  }

  if (screen === "login") {
    return (
      <AdminLogin
        onAuthenticated={(user) => {
          setSession(user);
          setScreen("app");
        }}
      />
    );
  }

  if (screen === "app") {
    return <AdminLayout session={session} onLogout={handleLogout} />;
  }

  return <AdminLanding onEnter={() => setScreen("login")} onBackToSite={onExit} />;
}
