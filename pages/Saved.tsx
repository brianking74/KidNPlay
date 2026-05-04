import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Clock, Filter } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { durationLabels, interestOptions } from "../lib/activities";

function getInterestEmoji(id: string) {
  const map: Record<string, string> = {
    art: "\uD83C\uDFA8", vehicles: "\uD83D\uDE97", water: "\uD83C\uDF0A", sports: "\u26BD",
    outdoor: "\uD83C\uDF33", stem: "\uD83D\uDD2C", quiet: "\uD83D\uDCD6", history: "\uD83C\uDFDB\uFE0F",
  };
  return map[id] || "\u2728";
}

function getInterestColor(id: string) {
  return interestOptions.find((o) => o.id === id)?.color || "#E86A33";
}

export default function Saved() {
  const [activeFilter, setActiveFilter] = useState("All");
  const savedQuery = trpc.user.getSaved.useQuery();
  const toggleSaved = trpc.user.toggleSaved.useMutation({
    onSuccess: () => savedQuery.refetch(),
  });

  const savedActivities = savedQuery.data || [];

  const filtered =
    activeFilter === "All"
      ? savedActivities
      : savedActivities.filter((s) =>
          s.activity?.interests?.some(
            (i: string) => i.toLowerCase() === activeFilter.toLowerCase()
          )
        );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1
            className="text-2xl font-semibold text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Saved
          </h1>
          {savedActivities.length > 0 && (
            <span className="bg-[#E86A33] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {savedActivities.length}
            </span>
          )}
        </div>
      </div>

      {/* Filter chips — now with emoji! */}
      <div className="shrink-0 px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveFilter("All")}
            className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all ${
              activeFilter === "All"
                ? "bg-[#E86A33] text-white"
                : "bg-white text-[#6B6B6B] border border-black/10"
            }`}
          >
            All
          </button>
          {interestOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.label)}
              className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === opt.label
                  ? "text-white border-transparent"
                  : "bg-white text-[#6B6B6B] border border-black/10"
              }`}
              style={
                activeFilter === opt.label
                  ? { backgroundColor: opt.color }
                  : {}
              }
            >
              <span className="text-sm">{getInterestEmoji(opt.id)}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {savedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-[#F6F5F0] flex items-center justify-center"
            >
              <Heart size={32} className="text-[#9E9E9E]" />
            </motion.div>
            <h3
              className="text-lg font-semibold text-[#1A1A1A] text-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              No adventures saved
            </h3>
            <p className="text-sm text-[#6B6B6B] text-center max-w-[240px]">
              Swipe right on the Explore tab to start collecting favourites
              &#x1F496;
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Filter size={24} className="text-[#9E9E9E] mb-2" />
            <p className="text-sm text-[#6B6B6B]">
              No activities match this filter
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((saved) => {
                if (!saved.activity) return null;
                const a = saved.activity;
                return (
                  <motion.div
                    key={saved.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm"
                  >
                    <div className="flex">
                      {/* Color accent strip */}
                      {a.interests?.[0] && (
                        <div
                          className="w-1.5 shrink-0"
                          style={{
                            backgroundColor: getInterestColor(a.interests[0]),
                          }}
                        />
                      )}
                      <div className="flex-1 p-3 flex gap-3">
                        <img
                          src={a.imageUrl || ""}
                          alt={a.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#1A1A1A] line-clamp-1">
                            {a.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#6B6B6B]">
                              <Clock size={10} />
                              {durationLabels[a.duration]}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#6B6B6B]">
                              <MapPin size={10} />
                              {a.locationName}
                            </span>
                          </div>
                          {/* Interest tags — now colorful! */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(a.interests || []).slice(0, 3).map((interest: string) => (
                              <span
                                key={interest}
                                className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
                                style={{
                                  backgroundColor: getInterestColor(interest),
                                }}
                              >
                                {getInterestEmoji(interest)}
                                {interestOptions.find((o) => o.id === interest)
                                  ?.label || interest}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-between shrink-0">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() =>
                              toggleSaved.mutate({ activityId: a.id })
                            }
                            className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"
                          >
                            <Heart
                              size={14}
                              className="text-red-400"
                              fill="#f87171"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
