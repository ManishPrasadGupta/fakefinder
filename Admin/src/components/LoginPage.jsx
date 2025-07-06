import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-950 font-sans">
      <div className="flex flex-row items-center bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-0">
        {/* Login Container */}
        <div className="w-full max-w-xs p-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
            Admin Login
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition text-white font-semibold text-lg shadow"
            >
              Login
            </button>
            {error && (
              <div className="text-red-400 bg-red-900 bg-opacity-30 rounded px-3 py-2 text-sm text-center animate-shake">
                {error}
              </div>
            )}
          </form>
        </div>
        {/* Logo Container */}
        <div className="hidden md:flex items-center justify-center p-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/2/20/Meghalaya_Police_Logo.png"
            alt="Logo"
            className="h-50 w-50 object-contain"
          />
        </div>
      </div>
    </div>
  );
}