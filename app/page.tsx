"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // fetch current user from cookie-based session
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) setUser(data.user);
      } catch {
        // ignore
      }
    }
    fetchMe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const route = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      // don't show a welcome message for login; only show created message on signup
      if (!isLogin) setMessage(`Created ${data.user.email}`);
      // navigate to ideas page after successful login so the user sees their ideas
      if (isLogin) {
        setIsSubmitting(false);
        window.location.href = '/ideas';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setMessage(message || 'Error');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans px-4 relative overflow-hidden">
      {/* Background accent elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full gradient-accent transform rotate-45 opacity-10"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full gradient-accent transform -rotate-12 opacity-5"></div>
      
      {/* floating logout button top-right */}
      {user && (
        <button
          className="fixed top-4 right-4 z-50 px-4 py-2 text-sm glass rounded-lg shadow-sm hover:shadow-md transition-all duration-300 pop-in"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            setMessage('Logged out');
          }}
        >
          Logout
        </button>
      )}

      <main className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl border-2 border-black gradient-card rounded-xl p-8 sm:p-10 md:p-12 shadow-lg transition-all duration-300 pop-in relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black slide-in">
            {isLogin ? 'Welcome back' : 'Join us'}
          </h1>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 text-black">
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border-1 border-black px-4 py-3 text-gray-800 bg-white/90 transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
            type="email"
            required
          />
          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border-1 border-black px-4 py-3 text-gray-800 bg-white/90 transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
            type="password"
            required
          />

          <button
            className="mt-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold text-base transition-all duration-200 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmitting}
          >
            {isLogin ? (isSubmitting ? 'Logging in...' : 'Login') : (isSubmitting ? 'Creating account...' : 'Create account')}
          </button>
        </form>

        <div className="mt-6 text-sm" style={{ color: '#111' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="underline"
            style={{ color: '#111' }}
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
        </div>

        {message && (
          <p className="mt-4 text-sm text-gray-600 fade-in">
            {message}
          </p>
        )}
      </main>
    </div>
  );
}
