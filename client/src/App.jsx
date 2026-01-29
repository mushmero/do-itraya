import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Navbar Component (Only show when logged in check is done inside, or handle layout differently)
// Actually, let's keep the layout wrapper, but conditionally show User Info / Logout
const Layout = ({ children }) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen dark:bg-primary light:bg-light-primary dark:text-slate-100 light:text-light-text font-sans relative overflow-x-hidden transition-colors duration-300">
      {/* Animated Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient mesh base */}
        <div className="absolute inset-0 gradient-mesh-bg" />

        {/* Animated gradient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-transparent opacity-40 blur-3xl rounded-full animate-float" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-accent/15 via-gold-dark/10 to-transparent blur-3xl rounded-full animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/15 via-success/10 to-transparent blur-3xl rounded-full"
          style={{ animation: "float 4s ease-in-out infinite" }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-purple-500/10 to-transparent blur-3xl rounded-full animate-spin-slow" />
      </div>

      {/* Container with responsive max-width */}
      <div className="mx-auto px-4 py-6 md:px-6 md:py-10 max-w-full md:max-w-3xl lg:max-w-7xl">
        {/* Modern Navbar */}
        <nav className="flex items-center justify-between mb-8 md:mb-12 py-4 px-6 md:px-8 glass-premium rounded-2xl sticky top-4 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-gold-dark flex items-center justify-center shadow-lg shadow-accent/20">
              <span className="text-xl font-bold text-white">R</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-bold text-gradient-gold tracking-tight leading-tight">
                Raya Packet
              </h1>
              <span className="hidden md:block text-[10px] uppercase tracking-widest dark:text-slate-400 light:text-slate-500 font-bold">
                Budget Planner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {currentUser && (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex flex-col items-end">
                  <span className="block text-[10px] md:text-sm font-semibold text-gradient-gold max-w-[80px] md:max-w-none truncate">
                    {currentUser.username || currentUser.name || "User"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all shadow-lg shadow-red-500/5 active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            )}
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
