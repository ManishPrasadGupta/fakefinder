import React, { useEffect, useState } from "react";
import { auth } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  if (!user) return <LoginPage onLogin={() => {}} />;
  // return <BlacklistPage />;
  return <AdminDashboard />;
}

export default App;