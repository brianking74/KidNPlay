import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { X, Heart, MapPin, Baby, Clock, Sparkles, Compass } from "lucide-react";
import { useOnboarding } from "../hooks/useKidMode";
import { trpc } from "@/providers/trpc";
import type { Activity } from "../lib/activities";
import { durationLabels, priceLabels, seedActivities, interestOptions } from "../lib/activities";

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

function ActivityCard({
  activity,
  index,
  onSwipe,
}: {
  activity: Activity;
  index: number;
  onSwipe: (direction: "left" | "right", activityId: string) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

  const handleDragEnd = (info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      onSwipe("right", activity.id);
    } else if (info.offset.x < -100) {
      onSwipe("left", activity.id);
    }
  };

  const isTop = index === 0;

  return (
    <motion.div
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => isTop && handleDragEnd(info)}
      animate={
        isTop
          ? { y: 0, scale: 1, opacity: 1, zIndex: 30 }
          : index === 1
          ? { y: 8, scale: 0.96, opacity: 0.7, zIndex: 20 }
          : { y: 16, scale: 0.92, opacity: 0.4, zIndex: 10 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-x-4 top-4 bottom-4 bg-white rounded-[28px] shadow-lg overflow-hidden select-none"
    >
      {/* Swipe direction overlays */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-10 left-6 z-20 -rotate-12 pointer-events-none"
          >
            <div className="border-[3px] border-red-500 rounded-xl px-3 py-1.5 bg-white/30 backdrop-blur-[2px]">
              <span className="text-red-500 text-lg font-black tracking-[0.15em]">NOPE</span>
            </div>
          </motion.div>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-10 right-6 z-20 rotate-12 pointer-events-none"
          >
            <div className="border-[3px] border-[#3AE2B7] rounded-xl px-3 py-1.5 bg-white/30 backdrop-blur-[2px]">
              <span className="text-[#3AE2B7] text-lg font-black tracking-[0.15em]">SAVE</span>
            </div>
          </motion.div>
        </>
      )}

      {/* Image section */}
      <div className="h-[55%] relative overflow-hidden">
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className="w-full h-full object-cover"
          style={{ filter: "saturate(1.1) contrast(1.05)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
          <span className="text-xs font-semibold text-[#1A1A1A]">{priceLabels[activity.priceBand]}</span>
        </div>

        {/* Interest emoji badges — pinned to the image */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {activity.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white"
              style={{ backgroundColor: getInterestColor(interest) }}
            >
              {getInterestEmoji(interest)}
            </span>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col h-[45%]">
        <h3
          className="text-lg font-semibold text-[#1A1A1A] leading-tight line-clamp-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {activity.name}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 bg-[#F6F5F0] rounded-full px-2.5 py-1 text-[10px] font-medium text-[#6B6B6B] uppercase tracking-wide">
            <Baby size={12} />
            {activity.ageMin}-{activity.ageMax}
          </span>
          <span className="inline-flex items-center gap-1 bg-[#F6F5F0] rounded-full px-2.5 py-1 text-[10px] font-medium text-[#6B6B6B] uppercase tracking-wide">
            <Clock size={12} />
            {durationLabels[activity.duration]}
          </span>
        </div>

        <p className="text-xs text-[#6B6B6B] mt-2 leading-relaxed line-clamp-2">
          {activity.description}
        </p>

        <div className="flex-1" />

        <div className="flex items-center gap-1 text-[#6B6B6B]">
          <MapPin size={14} />
          <span className="text-xs font-medium">{activity.locationName}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Explore() {
  const childAge = useOnboarding((s) => s.childAge);
  const interests = useOnboarding((s) => s.interests);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activitiesQuery = trpc.activity.getAll.useQuery({
    age: childAge,
    interests: interests.length > 0 ? interests : undefined,
  });

  const toggleSaved = trpc.user.toggleSaved.useMutation();

  useEffect(() => {
    if (activitiesQuery.data && activitiesQuery.data.length > 0) {
      const mapped = activitiesQuery.data.map((a) => ({
        ...a,
        lat: Number(a.lat),
        lng: Number(a.lng),
        imageUrl: a.imageUrl || "",
        interests: Array.isArray(a.interests) ? a.interests : [],
        tags: Array.isArray(a.tags) ? a.tags : [],
      }));
      setActivities(mapped as Activity[]);
    } else {
      const filtered = seedActivities.filter(
        (a) =>
          a.ageMin <= childAge &&
          a.ageMax >= childAge &&
          (interests.length === 0 || a.interests.some((i) => interests.includes(i)))
      );
      setActivities(filtered.length > 0 ? filtered : seedActivities);
    }
  }, [activitiesQuery.data, childAge, interests]);

  const handleSwipe = useCallback(
    (direction: "left" | "right", activityId: string) => {
      if (direction === "right") {
        toggleSaved.mutate({ activityId });
      }
      setCurrentIndex((prev) => prev + 1);
    },
    [toggleSaved]
  );

  const visibleActivities = activities.slice(currentIndex, currentIndex + 3);
  const hasMore = currentIndex < activities.length;
  const discovered = currentIndex;
  const total = activities.length;
  const progress = total > 0 ? discovered / total : 0;

  if (!hasMore) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3AE2B7] to-[#E86A33]/30 flex items-center justify-center"
        >
          <Sparkles size={40} className="text-white" />
        </motion.div>
        <h3
          className="text-xl font-semibold text-[#1A1A1A] text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          All explored!
        </h3>
        <p className="text-sm text-[#6B6B6B] text-center max-w-[280px]">
          You checked out {total} adventures. Head to <strong>Saved</strong> to see the ones you loved
          &#x1F496;
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentIndex(0)}
          className="mt-4 h-12 px-6 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-[#E86A33]/20"
        >
          Start Over
        </motion.button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Location + progress */}
      <div className="shrink-0 px-4 pt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#1A1A1A]">
          <MapPin size={16} className="text-[#E86A33]" />
          <span className="text-sm font-medium">Wan Chai, Hong Kong</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass size={14} className="text-[#9E9E9E]" />
          <span className="text-xs font-semibold text-[#6B6B6B]">
            {discovered} / {total}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 px-4 pt-1.5 pb-1">
        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 100 }}
            className="h-full bg-gradient-to-r from-[#E86A33] to-[#E86A33]/60 rounded-full"
          />
        </div>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative" style={{ minHeight: "400px" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative" style={{ perspective: "1000px" }}>
            <AnimatePresence>
              {visibleActivities
                .slice()
                .reverse()
                .map((activity, revIdx) => {
                  const idx = visibleActivities.length - 1 - revIdx;
                  return (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      index={idx}
                      onSwipe={handleSwipe}
                    />
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Swipe buttons */}
      <div className="shrink-0 h-24 flex items-center justify-center gap-6 pb-2">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            if (visibleActivities[0]) handleSwipe("left", visibleActivities[0].id);
          }}
          className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <X size={24} className="text-[#6B6B6B]" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.85 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(232,106,51,0.3)",
              "0 0 0 14px rgba(232,106,51,0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => {
            if (visibleActivities[0]) handleSwipe("right", visibleActivities[0].id);
          }}
          className="w-16 h-16 rounded-full bg-[#E86A33] flex items-center justify-center shadow-lg"
        >
          <Heart size={28} className="text-white" fill="white" />
        </motion.button>
      </div>

      {/* Mini activity map */}
      <div className="shrink-0 h-[170px] relative bg-gradient-to-b from-[#E8E4DB] to-[#ddd9cf] overflow-hidden rounded-t-[28px] mx-2 mb-2">
        <div className="absolute top-2 left-0 right-0 flex justify-center z-10">
          <div className="w-8 h-1 rounded-full bg-[#9E9E9E]/40" />
        </div>

        {/* Terrain */}
        <div className="absolute inset-0 opacity-15">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path d="M0,100 Q100,80 200,100 T400,100" stroke="#A8C5D6" strokeWidth="20" fill="none" />
            <path d="M50,50 Q150,30 250,60" stroke="#B8D4A0" strokeWidth="15" fill="none" />
            <rect x="120" y="70" width="60" height="40" rx="4" fill="#C8C4B8" />
            <rect x="220" y="90" width="50" height="35" rx="4" fill="#C8C4B8" />
          </svg>
        </div>

        {/* Activity location pins */}
        {visibleActivities.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
            className="absolute"
            style={{
              left: `${15 + ((a.lat * 7 + a.lng * 3) % 55)}%`,
              top: `${20 + ((a.lng * 5 + a.lat * 2) % 45)}%`,
            }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#E86A33] border-2 border-white shadow-md" />
              <span className="text-[8px] font-semibold text-[#1A1A1A] bg-white/80 px-1.5 py-0.5 rounded-full whitespace-nowrap backdrop-blur-sm shadow-sm">
                {a.locationName.split(",")[0]}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Current activity info */}
        {visibleActivities[0] && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#E86A33] shrink-0" />
              <span className="text-xs font-semibold text-[#1A1A1A] truncate">
                {visibleActivities[0].name}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
