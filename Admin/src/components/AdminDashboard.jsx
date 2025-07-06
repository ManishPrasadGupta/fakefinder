import React, { useState } from "react";
import BlacklistPage from "./BlackListPage";
import SiteVotesPage from "./siteVotes";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";

export default function AdminDashboard() {
  const [mode, setMode] = useState("blacklistedUrls");


    const handleLogout = () => {
      signOut(auth);
      window.location.reload();
    };
  

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950 text-white">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-blue-900 to-gray-900 shadow-lg">
        <div className="flex items-center max-w-7xl mx-auto px-6 py-6">
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="mr-6 text-lg px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Select admin mode"
          >
            <option value="blacklistedUrls">Blacklisted URLs</option>
            <option value="siteVotes">Site Votes</option>
          </select>
          <h2 className="flex-1 text-3xl font-bold tracking-tight">
            {mode === "blacklistedUrls" ? "Blacklist Management" : "Site Votes"}
          </h2>
          <button
            onClick={handleLogout}
            className="ml-auto h-11 text-lg bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 transition px-8 rounded-xl font-semibold shadow"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="w-full flex justify-center py-10 px-2 md:px-8">
        <div className="w-full max-w-6xl">
          {mode === "blacklistedUrls" ? <BlacklistPage /> : <SiteVotesPage />}
        </div>
      </main>
    </div>
  );
}