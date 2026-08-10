import { useState } from "react";
import AdminLanding from "./AdminLanding.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminLayout from "./AdminLayout.jsx";

// Mesmo padrão de navegação por estado usado no app do cliente (App.jsx).
export default function AdminApp({ onExit }) {
  const [screen, setScreen] = useState("landing"); // landing | login | app
  const [session, setSession] = useState(null);

  if (screen === "login") {
    return (
      <AdminLogin
        onAuthenticated={(user) => {
          setSession(user);
          setScreen("app");
        }}
        onBack={() => setScreen("landing")}
      />
    );
  }

  if (screen === "app") {
    return (
      <AdminLayout
        session={session}
        onLogout={() => {
          setSession(null);
          setScreen("landing");
        }}
      />
    );
  }

  return <AdminLanding onEnter={() => setScreen("login")} onBackToSite={onExit} />;
}
