import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Sparkles, ChevronDown, MapPin, Clock, Crown } from "lucide-react";
import { useOnboarding } from "../hooks/useKidMode";
import { trpc } from "@/providers/trpc";
import { durationLabels } from "../lib/activities";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Plans() {
  const childAge = useOnboarding((s) => s.childAge);
  const interests = useOnboarding((s) => s.interests);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const planQuery = trpc.plan.getCurrent.useQuery();
  const generatePlan = trpc.plan.generate.useMutation({
    onSuccess: () => {
      planQuery.refetch();
    },
  });

  const hasPlan = planQuery.data && planQuery.data.days.length > 0;

  const handleGenerate = () => {
    generatePlan.mutate({
      childAge,
      interests: interests.length > 0 ? interests : ["art", "outdoor"],
      duration: 7,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Magic Week
        </h1>
        {hasPlan && (
          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={handleGenerate}
            disabled={generatePlan.isPending}
            className="w-10 h-10 rounded-full bg-[#F6F5F0] flex items-center justify-center active:bg-[#E86A33]/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className="text-[#E86A33]" />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {!hasPlan ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-20 h-20 rounded-full bg-[#E86A33]/10 flex items-center justify-center">
              <Sparkles size={32} className="text-[#E86A33]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
              No plan yet
            </h3>
            <p className="text-sm text-[#6B6B6B] text-center max-w-[260px]">
              Generate a personalized 7-day itinerary based on your child's interests.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={generatePlan.isPending}
              className="mt-4 w-full max-w-[280px] h-14 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#E86A33]/20 disabled:opacity-70"
            >
              {generatePlan.isPending ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Magic Week
                </>
              )}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {planQuery.data!.days.map((day, idx) => {
              const isExpanded = expandedDay === idx;
              const hasActivities = day.morningActivity || day.afternoonActivity;

              return (
                <motion.div
                  key={idx}
                  layout
                  className="bg-white rounded-2xl border border-black/5 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : idx)}
                    className="w-full px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        day.day === "Sat" || day.day === "Sun"
                          ? "bg-[#E86A33]/10 text-[#E86A33]"
                          : "bg-[#F6F5F0] text-[#1A1A1A]"
                      }`}>
                        {day.day.slice(0, 2)}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-semibold text-[#1A1A1A]">
                          {daysOfWeek[idx % 7]}
                        </span>
                        {day.morningActivity && (
                          <p className="text-xs text-[#6B6B6B] line-clamp-1">
                            {day.morningActivity.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-[#9E9E9E] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 space-y-2">
                          {["morning", "afternoon", "evening"].map((slot) => {
                            const activity =
                              slot === "morning"
                                ? day.morningActivity
                                : slot === "afternoon"
                                ? day.afternoonActivity
                                : day.eveningActivity;

                            if (!activity) return null;

                            return (
                              <div key={slot} className="flex gap-3">
                                <div className="w-12 shrink-0">
                                  <span className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider">
                                    {slot}
                                  </span>
                                </div>
                                <div className="flex-1 flex gap-3 bg-[#F6F5F0] rounded-xl p-2">
                                  <img
                                    src={activity.imageUrl || ""}
                                    alt={activity.name}
                                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-1">
                                      {activity.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="inline-flex items-center gap-0.5 text-[10px] text-[#6B6B6B]">
                                        <Clock size={10} />
                                        {durationLabels[activity.duration]}
                                      </span>
                                      <span className="inline-flex items-center gap-0.5 text-[10px] text-[#6B6B6B]">
                                        <MapPin size={10} />
                                        {activity.locationName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {!hasActivities && (
                            <p className="text-xs text-[#9E9E9E] text-center py-2">
                              No activities planned for this day
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Pro teaser */}
            <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Crown size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Unlock 14-day plans
                  </p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Weather auto-swap, printable calendars, and more with Passport.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
