import { useState } from "react";
import { motion } from "framer-motion";
import { User, Crown, Check, Sparkles, LogOut, Palette, ChevronRight } from "lucide-react";
import { useOnboarding, useKidMode } from "../hooks/useKidMode";
import { interestOptions } from "../lib/activities";
import { trpc } from "@/providers/trpc";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

export default function Profile() {
  const { childName, childAge, interests, setChildName, setChildAge, setInterests, setCompleted } = useOnboarding();
  const { isKidMode, toggle } = useKidMode();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showProModal, setShowProModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const profileQuery = trpc.user.getProfile.useQuery();
  const updateProfile = trpc.user.updateProfile.useMutation();

  const [editName, setEditName] = useState(childName);
  const [editAge, setEditAge] = useState(childAge);
  const [editInterests, setEditInterests] = useState<string[]>(interests);

  const handleSaveProfile = () => {
    setChildName(editName);
    setChildAge(editAge);
    setInterests(editInterests);
    updateProfile.mutate({
      childName: editName,
      childAge: editAge,
      interests: editInterests,
    });
    setIsEditingProfile(false);
  };

  const toggleInterest = (id: string) => {
    if (editInterests.includes(id)) {
      setEditInterests(editInterests.filter((i) => i !== id));
    } else {
      setEditInterests([...editInterests, id]);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-3">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Settings
        </h1>
      </div>

      <div className="flex-1 px-4 pb-8 space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-4 border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#E86A33]/10 flex items-center justify-center">
              <User size={24} className="text-[#E86A33]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A]">{childName || "My Child"}</h3>
              <p className="text-xs text-[#6B6B6B]">{childAge} years old</p>
            </div>
            <button
              onClick={() => {
                setEditName(childName);
                setEditAge(childAge);
                setEditInterests(interests);
                setIsEditingProfile(true);
              }}
              className="text-xs font-semibold text-[#E86A33]"
            >
              Edit
            </button>
          </div>

          {isEditingProfile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 space-y-3 border-t border-black/5 pt-3"
            >
              <div>
                <label className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F6F5F0] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1 block">
                  Age: {editAge}
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={editAge}
                  onChange={(e) => setEditAge(Number(e.target.value))}
                  className="w-full h-2 bg-black/10 rounded-full appearance-none cursor-pointer accent-[#E86A33]"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2 block">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.slice(0, 4).map((opt) => {
                    const selected = editInterests.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleInterest(opt.id)}
                        className={`h-8 px-3 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? "text-white"
                            : "bg-[#F6F5F0] text-[#6B6B6B] border border-black/10"
                        }`}
                        style={selected ? { backgroundColor: opt.color } : {}}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 h-10 bg-[#F6F5F0] rounded-xl text-sm font-semibold text-[#6B6B6B]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 h-10 bg-[#E86A33] rounded-xl text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3AE2B7]/10 flex items-center justify-center">
                <Palette size={16} className="text-[#3AE2B7]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">Kid Mode</p>
                <p className="text-[10px] text-[#6B6B6B]">Larger text, bolder colors</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className={`w-12 h-7 rounded-full relative transition-colors ${
                isKidMode ? "bg-[#3AE2B7]" : "bg-black/10"
              }`}
            >
              <motion.div
                animate={{ x: isKidMode ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-white shadow-sm absolute top-0.5"
              />
            </button>
          </div>
        </div>

        {/* Pro Upsell */}
        {!profileQuery.data?.isPro && (
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProModal(true)}
            className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-2xl p-4 border border-amber-100 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shrink-0">
                <Crown size={24} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Passport
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#1A1A1A] mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Unlock Magic Month
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-1">
                  "Parents in Central saved 4.2 hours of planning last week"
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    "Unlimited swipes",
                    "Weather auto-swap",
                    "Printable calendar",
                    "Grandparent share link",
                    "Multi-child profiles",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-1.5 text-xs text-[#1A1A1A]">
                      <Check size={12} className="text-[#E86A33]" />
                      {benefit}
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full h-12 bg-[#E86A33] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  Start Free 3-Day
                  <ChevronRight size={16} />
                </button>
                <p className="text-[10px] text-[#9E9E9E] text-center mt-2">
                  $9.99/mo after · No payment today
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Account */}
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <button
            onClick={() => {
              logout();
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-red-500"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>

      {/* Pro Modal */}
      {showProModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowProModal(false)}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-[32px] w-full max-w-[430px] p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-6" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center mx-auto mb-4">
                <Crown size={28} className="text-amber-700" />
              </div>
              <h2 className="text-2xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Get Passport
              </h2>
              <p className="text-sm text-[#6B6B6B] mt-2">
                Unlock the full KidVentour experience for your family.
              </p>
            </div>
            <div className="mt-6 space-y-2">
              {[
                "Unlimited swipes",
                "14-day Magic Plans",
                "Weather auto-swap",
                "Printable calendars",
                "Grandparent share links",
                "Multi-child profiles",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 px-3 py-2 bg-[#F6F5F0] rounded-xl">
                  <Check size={16} className="text-[#E86A33]" />
                  <span className="text-sm text-[#1A1A1A]">{benefit}</span>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full h-14 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm">
              Start Free 3-Day Trial
            </button>
            <p className="text-xs text-[#9E9E9E] text-center mt-3">
              $9.99/month after trial. Cancel anytime.
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
