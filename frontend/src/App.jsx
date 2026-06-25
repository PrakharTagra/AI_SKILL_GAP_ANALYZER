import { useState } from "react";
import AuthPage from "./components/AuthPage";
import ProfileWizard from "./components/ProfileWizard";
import Dashboard from "./components/Dashboard";
import "./index.css";

const MOCK_USERS = {
  "demo@skillgap.ai": { password: "demo123", profile: null },
};

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [profile, setProfile] = useState(null);

  const handleLogin = (email, existingProfile) => {
    setUserEmail(email);
    if (existingProfile) {
      setProfile(existingProfile);
      setScreen("dashboard");
    } else {
      setScreen("wizard");
    }
  };

  const handleSignup = (email, name) => {
    setUserEmail(email);
    setUserName(name);
    setScreen("wizard");
  };

  const handleProfileComplete = (data) => {
    MOCK_USERS[userEmail] = MOCK_USERS[userEmail] || {};
    MOCK_USERS[userEmail].profile = data;
    setProfile(data);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setScreen("auth");
    setUserEmail("");
    setUserName("");
    setProfile(null);
  };

  if (screen === "auth") return <AuthPage onLogin={handleLogin} onSignup={handleSignup} />;
  if (screen === "wizard")
    return (
      <ProfileWizard
        userEmail={userEmail}
        userName={userName}
        existingProfile={null}
        onComplete={handleProfileComplete}
        onCancel={profile ? () => setScreen("dashboard") : null}
      />
    );
  if (screen === "edit")
    return (
      <ProfileWizard
        userEmail={userEmail}
        userName={userName}
        existingProfile={profile}
        onComplete={handleProfileComplete}
        onCancel={() => setScreen("dashboard")}
      />
    );
  if (screen === "dashboard")
    return (
      <Dashboard
        profile={profile}
        onEditProfile={() => setScreen("edit")}
        onLogout={handleLogout}
      />
    );
  return null;
}
