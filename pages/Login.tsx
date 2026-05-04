import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { Sparkles, Compass, Star, ChevronRight, User, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [devName, setDevName] = useState("");
  const [isDevLoggingIn, setIsDevLoggingIn] = useState(false);
  const [devError, setDevError] = useState("");
  const [showDevLogin, setShowDevLogin] = useState(false);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleDevLogin = async () => {
    setIsDevLoggingIn(true);
    setDevError("");
    try {
      const resp = await fetch("/api/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: devName || "Test Parent" }),
        credentials: "include",
      });
      const data = await resp.json();
      if (!resp.ok) {
        setDevError(data.error || "Login failed");
      } else {
        window.location.href = "/";
      }
    } catch (e) {
      setDevError("Could not connect to server");
    } finally {
      setIsDevLoggingIn(false);
    }
  };

  const handleGetStarted = () => {
    setShowDevLogin(true);
  };

  const floatingItems = [
    { icon: Compass, delay: 0, x: "15%", y: "20%", size: 20 },
    { icon: Star, delay: 0.3, x: "80%", y: "15%", size: 16 },
    { icon: Sparkles, delay: 0.6, x: "20%", y: "70%", size: 18 },
    { icon: Compass, delay: 0.9, x: "75%", y: "65%", size: 14 },
    { icon: Star, delay: 1.2, x: "50%", y: "10%", size: 12 },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#FFF8F0] via-white to-[#F6F5F0]">
      {/* Floating icons */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-[#E86A33]/10"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={{
            duration: 4,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <item.icon size={item.size} />
        </motion.div>
      ))}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo / Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#E86A33] to-[#E86A33]/70 flex items-center justify-center shadow-lg shadow-[#E86A33]/20 mx-auto">
            <Compass size={44} className="text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <h1
            className="text-4xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            KidVentour
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-2 max-w-[260px] mx-auto leading-relaxed">
            Discover age-filtered, parent-approved activities for your family in Hong Kong.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {["Curated for Kids", "4-Week Itineraries", "Parent Approved"].map(
            (label) => (
              <span
                key={label}
                className="h-8 px-4 bg-white/70 backdrop-blur-sm border border-black/5 rounded-full text-xs font-medium text-[#6B6B6B] flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles size={12} className="text-[#E86A33]" />
                {label}
              </span>
            ),
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-sm mt-10 space-y-3"
        >
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="w-full h-14 bg-[#E86A33] text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#E86A33]/20 hover:shadow-[#E86A33]/30 transition-shadow active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Get Started
                <ChevronRight size={20} />
              </>
            )}
          </button>

          <p className="text-[10px] text-[#9E9E9E] text-center">
            Sign in with Kimi ID or continue as a guest in dev mode
          </p>
        </motion.div>

        {/* Dev Login Toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => setShowDevLogin(!showDevLogin)}
          className="mt-4 text-xs text-[#9E9E9E] underline underline-offset-2"
        >
          {showDevLogin ? "Close dev login" : "Dev login (offline mode)"}
        </motion.button>

        {/* Dev Login Form */}
        <AnimatePresence>
          {showDevLogin && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full max-w-sm overflow-hidden"
            >
              <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#3AE2B7]/10 flex items-center justify-center">
                    <User size={12} className="text-[#3AE2B7]" />
                  </div>
                  <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                    Dev Login
                  </span>
                  <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Local only
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="flex-1 h-11 px-3 bg-[#F6F5F0] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 placeholder:text-[#9E9E9E]"
                    onKeyDown={(e) => e.key === "Enter" && handleDevLogin()}
                  />
                  <button
                    onClick={handleDevLogin}
                    disabled={isDevLoggingIn}
                    className="h-11 px-4 bg-[#3AE2B7] text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isDevLoggingIn ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Go"
                    )}
                  </button>
                </div>
                {devError && (
                  <p className="text-xs text-red-500 mt-2">{devError}</p>
                )}
                <p className="text-[10px] text-[#9E9E9E] mt-2">
                  Creates a test session directly. Kimi OAuth not required.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-[10px] text-[#9E9E9E] pb-6"
      >
        Made for families in Hong Kong
      </motion.p>
    </div>
  );
}
