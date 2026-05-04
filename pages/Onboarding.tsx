import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, MapPin, Sparkles } from "lucide-react";
import { useOnboarding } from "../hooks/useKidMode";
import { interestOptions } from "../lib/activities";
import { useNavigate } from "react-router";

type Step = "welcome" | "profile" | "interests" | "location" | "complete";

export default function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const navigate = useNavigate();
  const {
    childName,
    childAge,
    interests,
    setChildName,
    setChildAge,
    setInterests,
    setCompleted,
  } = useOnboarding();

  const goNext = () => {
    if (step === "welcome") setStep("profile");
    else if (step === "profile") setStep("interests");
    else if (step === "interests") setStep("location");
    else if (step === "location") setStep("complete");
  };

  const finish = () => {
    setCompleted(true);
    navigate("/", { replace: true });
  };

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter((i) => i !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-8"
          >
            <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-b from-amber-100 to-orange-50 relative">
              <img
                src="/activities/hk-park.jpg"
                alt="Kids exploring"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-white text-3xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  KidVentour
                </h1>
                <p className="text-white/90 text-sm mt-2">
                  Discover magic in your city, one swipe at a time.
                </p>
              </div>
            </div>
            <button
              onClick={goNext}
              className="w-full h-14 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              Get Started
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-12 gap-8"
          >
            <div>
              <h2 className="text-2xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Who are we planning for?
              </h2>
              <p className="text-[#6B6B6B] text-sm mt-1">Tell us a bit about your child</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-2 block">
                  Child's name
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Emma"
                  className="w-full h-14 px-4 bg-white rounded-2xl border border-black/10 text-[#1A1A1A] placeholder:text-[#9E9E9E] focus:outline-none focus:border-[#E86A33] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-4 block">
                  Age: {childAge} years
                </label>
                <div className="relative px-2">
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    className="w-full h-2 bg-black/10 rounded-full appearance-none cursor-pointer accent-[#E86A33]"
                  />
                  <div className="flex justify-between mt-2 text-[10px] text-[#9E9E9E]">
                    {Array.from({ length: 12 }, (_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1" />
            <button
              onClick={goNext}
              disabled={!childName.trim()}
              className="w-full h-14 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              Next
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === "interests" && (
          <motion.div
            key="interests"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-12 gap-8"
          >
            <div>
              <h2 className="text-2xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                What makes them light up?
              </h2>
              <p className="text-[#6B6B6B] text-sm mt-1">Select at least one interest</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((interest) => {
                const isSelected = interests.includes(interest.id);
                return (
                  <motion.button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`h-28 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all ${
                      isSelected
                        ? "text-white border-transparent"
                        : "bg-white border-black/10 text-[#6B6B6B]"
                    }`}
                    style={isSelected ? { backgroundColor: interest.color } : {}}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-white/20" : "bg-black/5"
                      }`}
                    >
                      {isSelected ? (
                        <Check size={20} className="text-white" />
                      ) : (
                        <span className="text-lg">
                          {interest.id === "art" && "🎨"}
                          {interest.id === "vehicles" && "🚗"}
                          {interest.id === "water" && "🌊"}
                          {interest.id === "sports" && "⚽"}
                          {interest.id === "outdoor" && "🌳"}
                          {interest.id === "quiet" && "📖"}
                          {interest.id === "stem" && "🔬"}
                          {interest.id === "history" && "🏛️"}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold">{interest.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex-1" />
            <button
              onClick={goNext}
              disabled={interests.length === 0}
              className="w-full h-14 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === "location" && (
          <motion.div
            key="location"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-12 gap-8 items-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-[#E86A33]/10 flex items-center justify-center">
              <MapPin size={40} className="text-[#E86A33]" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Enable location?
              </h2>
              <p className="text-[#6B6B6B] text-sm mt-2 max-w-[260px] mx-auto">
                We'll find nearby adventures and show you what's closest.
              </p>
            </div>

            <div className="flex-1" />
            <div className="w-full space-y-3 mb-6">
              <button
                onClick={goNext}
                className="w-full h-14 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                Enable Location
              </button>
              <button
                onClick={goNext}
                className="w-full h-14 bg-white text-[#1A1A1A] rounded-2xl font-semibold text-sm tracking-wide border border-black/10 flex items-center justify-center active:scale-[0.98] transition-transform"
              >
                Search Manually
              </button>
            </div>
          </motion.div>
        )}

        {step === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-6 pt-12 gap-8 items-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-[#3AE2B7]/20 flex items-center justify-center">
              <Sparkles size={40} className="text-[#3AE2B7]" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                You're all set!
              </h2>
              <p className="text-[#6B6B6B] text-sm mt-2 max-w-[260px] mx-auto">
                Start exploring adventures for {childName || "your little one"}.
              </p>
            </div>

            <div className="flex-1" />
            <button
              onClick={finish}
              className="w-full h-14 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-6"
            >
              Start Exploring
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
