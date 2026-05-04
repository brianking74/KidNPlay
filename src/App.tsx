import { Routes, Route, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { useOnboarding } from "./hooks/useKidMode";
import Onboarding from "./pages/Onboarding";
import Explore from "./pages/Explore";
import Plans from "./pages/Plans";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasCompletedOnboarding = useOnboarding((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    if (!hasCompletedOnboarding && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [hasCompletedOnboarding, location.pathname, navigate]);

  const showNav = location.pathname !== "/onboarding" && location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-neutral-900 flex justify-center items-start">
      <div className="w-full max-w-[430px] min-h-screen bg-[#F6F5F0] relative overflow-hidden shadow-2xl">
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Explore />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Explore />} />
            </Routes>
          </div>
          {showNav && <BottomNav />}
        </div>
      </div>
    </div>
  );
}
