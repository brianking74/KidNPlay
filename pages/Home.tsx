import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Compass,
  CalendarHeart,
  Bookmark,
  User,
  Sparkles,
  Sun,
  CloudSun,
} from "lucide-react";
import { useOnboarding } from "../hooks/useKidMode";
import { seedActivities, interestOptions } from "../lib/activities";

const greetings = ["Hey", "Hello", "Hi there", "Howdy", "Hey there"];

const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { icon: <Sun size={18} />, text: "Good morning" };
  if (hour < 17)
    return { icon: <CloudSun size={18} />, text: "Good afternoon" };
  return { icon: <Sparkles size={18} />, text: "Good evening" };
};

const actionCards = [
  {
    id: "explore",
    label: "Explore",
    icon: Compass,
    desc: "Swipe & discover",
    path: "/explore",
    color: "#E86A33",
  },
  {
    id: "plans",
    label: "Plans",
    icon: CalendarHeart,
    desc: "Magic Week",
    path: "/plans",
    color: "#4A7C59",
  },
  {
    id: "saved",
    label: "Saved",
    icon: Bookmark,
    desc: "Your favorites",
    path: "/saved",
    color: "#4A90D9",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    desc: "Settings",
    path: "/profile",
    color: "#8B7E74",
  },
];

function getInterestEmoji(id: string) {
  const map: Record<string, string> = {
    art: "🎨",
    vehicles: "🚗",
    water: "🌊",
    sports: "⚽",
    outdoor: "🌳",
    quiet: "📖",
    stem: "🔬",
    history: "🏛️",
  };
  return map[id] || "✨";
}

function getInterestLabel(id: string) {
  return interestOptions.find((o) => o.id === id)?.label || id;
}

const tips = [
  "Did you know? Playing outside boosts creativity by 50%! 🌿",
  "Kids learn best through hands-on play — get messy!",
  "A mix of quiet reading and active play makes a perfect day.",
  "Reading together for 20 minutes builds vocabulary fast! 📚",
  "Unstructured play helps kids develop problem-solving skills.",
];

export default function Home() {
  const navigate = useNavigate();
  const { childName, childAge, interests } = useOnboarding();
  const greeting = useMemo(
    () => greetings[Math.floor(Math.random() * greetings.length)],
    []
  );
  const time = useMemo(timeGreeting, []);
  const tipOfDay = useMemo(
    () => tips[Math.floor(Math.random() * tips.length)],
    []
  );

  // Pick a random activity that matches the child's age
  const todaysPick = useMemo(() => {
    const suitable = seedActivities.filter(
      (a) => a.ageMin <= childAge && a.ageMax >= childAge
    );
    if (suitable.length === 0) return null;
    return suitable[Math.floor(Math.random() * suitable.length)];
  }, [childAge]);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Greeting */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-1.5">
          {time.icon}
          <span>{time.text}</span>
        </div>
        <h1
          className="text-3xl font-bold text-[#1A1A1A]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {greeting}, {childName || "Explorer"}! 👋
        </h1>
        {interests.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {interests.slice(0, 3).map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-black/5 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#6B6B6B]"
              >
                {getInterestEmoji(id)}
                {getInterestLabel(id)}
              </span>
            ))}
            {interests.length > 3 && (
              <span className="text-[11px] text-[#9E9E9E]">
                +{interests.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Today's Pick */}
      {todaysPick && (
        <div className="px-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#E86A33]" />
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
              Today's Pick
            </span>
          </div>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/explore")}
            className="w-full bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="h-32 bg-gradient-to-br from-[#E86A33]/20 to-amber-100 relative">
              <div className="absolute inset-0 flex items-end p-4">
                <div>
                  <h3
                    className="text-lg font-semibold text-[#1A1A1A]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {todaysPick.name}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {todaysPick.locationName}
                  </p>
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#1A1A1A]">
                {todaysPick.priceBand === "free"
                  ? "Free"
                  : todaysPick.priceBand === "$"
                  ? "Budget"
                  : todaysPick.priceBand === "$$"
                  ? "Moderate"
                  : "Premium"}
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {todaysPick.interests.slice(0, 3).map((id) => (
                  <span key={id} className="text-base">
                    {getInterestEmoji(id)}
                  </span>
                ))}
                <span className="text-[11px] text-[#6B6B6B]">
                  Ages {todaysPick.ageMin}-{todaysPick.ageMax}
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#E86A33]">
                View all →
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 mb-4">
        <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {actionCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(card.path)}
                className="bg-white rounded-2xl p-4 flex flex-col items-start gap-2 active:scale-[0.97] transition-transform shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  {card.label}
                </span>
                <span className="text-[11px] text-[#9E9E9E]">{card.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tip of the Day */}
      <div className="px-6 pb-6">
        <div className="bg-[#E86A33]/5 rounded-2xl p-4 border border-[#E86A33]/10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-[#E86A33]" />
            <span className="text-xs font-semibold text-[#E86A33] uppercase tracking-wider">
              Tip
            </span>
          </div>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">{tipOfDay}</p>
        </div>
      </div>
    </div>
  );
}
