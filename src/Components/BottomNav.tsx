import { Compass, CalendarDays, Heart, User, Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/explore", icon: Compass, label: "Explore" },
  { path: "/plans", icon: CalendarDays, label: "Plans" },
  { path: "/saved", icon: Heart, label: "Saved" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="shrink-0 h-16 bg-[#F6F5F0] border-t border-black/5 flex items-center justify-around px-2 z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center gap-0.5 w-16 h-14 relative"
          >
            {isActive && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-[#E86A33]" />
            )}
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.5}
              className={isActive ? "text-[#E86A33]" : "text-[#9E9E9E]"}
            />
            <span
              className={`text-[10px] font-medium tracking-wide ${
                isActive ? "text-[#E86A33]" : "text-[#9E9E9E]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
