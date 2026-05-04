import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { X, Heart, MapPin, Baby, Clock } from "lucide-react";
import { useOnboarding } from "../hooks/useKidMode";
import { trpc } from "@/providers/trpc";
import type { Activity } from "../lib/activities";
import { durationLabels, priceLabels, seedActivities } from "../lib/activities";

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
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      onSwipe("right", activity.id);
    } else if (info.offset.x < -100) {
      onSwipe("left", activity.id);
    }
  };

  const isTop = index === 0;

  return (
    <motion.div
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, opacity, scale: isTop ? scale : undefined }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={
        isTop
          ? { y: 0, scale: 1, opacity: 1, zIndex: 30 }
          : index === 1
          ? { y: 8, scale: 0.96, opacity: 0.7, zIndex: 20 }
          : { y: 16, scale: 0.92, opacity: 0.4, zIndex: 10 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-x-4 top-4 bottom-4 bg-white rounded-[28px] shadow-lg overflow-hidden touch-pan-y"
    >
      <div className="h-[55%] relative overflow-hidden">
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className="w-full h-full object-cover"
          style={{ filter: "saturate(1.1) contrast(1.05)" }}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
          <span className="text-xs font-semibold text-[#1A1A1A]">{priceLabels[activity.priceBand]}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col h-[45%]">
        <h3 className="text-lg font-semibold text-[#1A1A1A] leading-tight line-clamp-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {activity.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 bg-[#F6F5F0] rounded-full px-2.5 py-1 text-[10px] font-medium text-[#6B6B6B] uppercase tracking-wide">
            <Baby size={12} />
            {activity.ageMin}-{activity.ageMax} yrs
          </span>
          <span className="inline-flex items-center gap-1 bg-[#F6F5F0] rounded-full px-2.5 py-1 text-[10px] font-medium text-[#6B6B6B] uppercase tracking-wide">
            <Clock size={12} />
            {durationLabels[activity.duration]}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#6B6B6B]">
            <MapPin size={14} />
            <span className="text-xs">{activity.locationName}</span>
          </div>
          <div className="flex gap-1">
            {activity.interests.slice(0, 2).map((interest) => (
              <span
                key={interest}
                className="w-6 h-6 rounded-full bg-[#F6F5F0] flex items-center justify-center text-xs"
              >
                {interest === "art" && "🎨"}
                {interest === "vehicles" && "🚗"}
                {interest === "water" && "🌊"}
                {interest === "sports" && "⚽"}
                {interest === "outdoor" && "🌳"}
                {interest === "stem" && "🔬"}
                {interest === "quiet" && "📖"}
                {interest === "history" && "🏛️"}
              </span>
            ))}
          </div>
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
        lat: a.lat ? Number(a.lat) : 0,
        lng: a.lng ? Number(a.lng) : 0,
        imageUrl: a.imageUrl || "",
        interests: Array.isArray(a.interests) ? a.interests : [],
        tags: Array.isArray(a.tags) ? a.tags : [],
        bookingUrl: a.bookingUrl,
      }));
      setActivities(mapped as Activity[]);
    } else {
      // Filter seed activities client-side as fallback
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

  if (!hasMore) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 gap-4">
        <div className="w-20 h-20 rounded-full bg-[#F6F5F0] flex items-center justify-center">
          <MapPin size={32} className="text-[#9E9E9E]" />
        </div>
        <h3 className="text-xl font-semibold text-[#1A1A1A] text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          You've seen everything!
        </h3>
        <p className="text-sm text-[#6B6B6B] text-center">
          Check your Saved tab or come back later for more adventures.
        </p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="mt-4 h-12 px-6 bg-[#E86A33] text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Location bar */}
      <div className="shrink-0 h-11 px-4 flex items-center justify-between bg-[#F6F5F0]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-1.5 text-[#1A1A1A]">
          <MapPin size={16} className="text-[#E86A33]" />
          <span className="text-sm font-medium">Wan Chai, Hong Kong</span>
        </div>
      </div>

      {/* Card stack area */}
      <div className="flex-1 relative" style={{ minHeight: "420px" }}>
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
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            if (visibleActivities[0]) handleSwipe("left", visibleActivities[0].id);
          }}
          className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-sm"
        >
          <X size={24} className="text-[#6B6B6B]" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            if (visibleActivities[0]) handleSwipe("right", visibleActivities[0].id);
          }}
          className="w-14 h-14 rounded-full bg-[#E86A33] flex items-center justify-center shadow-md"
        >
          <Heart size={24} className="text-white" fill="white" />
        </motion.button>
      </div>

      {/* Map area */}
      <div className="shrink-0 h-[200px] relative bg-[#E8E4DB] overflow-hidden rounded-t-[28px] mx-2 mb-2">
        <div className="absolute top-2 left-0 right-0 flex justify-center">
          <div className="w-8 h-1 rounded-full bg-[#9E9E9E]/50" />
        </div>
        {/* Simulated map terrain */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 400 200" className="w-full h-full opacity-30">
            <path d="M0,100 Q100,80 200,100 T400,100" stroke="#C5D8E0" strokeWidth="20" fill="none" />
            <path d="M50,50 Q150,30 250,60" stroke="#D4E5C8" strokeWidth="15" fill="none" />
            <rect x="120" y="70" width="60" height="40" rx="4" fill="#D8D4CC" />
            <rect x="220" y="90" width="50" height="35" rx="4" fill="#D8D4CC" />
            <rect x="80" y="130" width="40" height="30" rx="4" fill="#D8D4CC" />
          </svg>
        </div>
        {/* Activity marker */}
        {visibleActivities[0] && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-[#E86A33] border-2 border-white shadow-lg relative z-10" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#E86A33] animate-ping opacity-50" />
              <div className="absolute -inset-3 w-10 h-10 rounded-full border-2 border-[#E86A33]/30 animate-pulse" />
            </div>
          </div>
        )}
        {/* Location label */}
        {visibleActivities[0] && (
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[#1A1A1A]">{visibleActivities[0].locationName}</span>
            <span className="text-[10px] text-[#6B6B6B]">
              {visibleActivities[0].lat.toFixed(4)}, {visibleActivities[0].lng.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
