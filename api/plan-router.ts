import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { plans, planDays } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

function pickRandom<T>(pool: T[], predicate?: (a: T) => boolean): T | null {
  const filtered = predicate ? pool.filter(predicate) : pool;
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const planRouter = createRouter({
  getCurrent: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    
    const db = getDb();
    const plan = await db.query.plans.findFirst({
      where: and(eq(plans.userId, ctx.user.id), eq(plans.isActive, true)),
      with: {
        days: {
          with: {
            morningActivity: true,
            afternoonActivity: true,
            eveningActivity: true,
          },
        },
      },
      orderBy: desc(plans.createdAt),
    });
    
    if (!plan) return null;
    
    return {
      ...plan,
      days: plan.days.map((d) => ({
        ...d,
        morningActivity: d.morningActivity ? {
          ...d.morningActivity,
          interests: typeof d.morningActivity.interests === "string" ? JSON.parse(d.morningActivity.interests) : d.morningActivity.interests,
          tags: typeof d.morningActivity.tags === "string" ? JSON.parse(d.morningActivity.tags || "[]") : d.morningActivity.tags,
        } : null,
        afternoonActivity: d.afternoonActivity ? {
          ...d.afternoonActivity,
          interests: typeof d.afternoonActivity.interests === "string" ? JSON.parse(d.afternoonActivity.interests) : d.afternoonActivity.interests,
          tags: typeof d.afternoonActivity.tags === "string" ? JSON.parse(d.afternoonActivity.tags || "[]") : d.afternoonActivity.tags,
        } : null,
        eveningActivity: d.eveningActivity ? {
          ...d.eveningActivity,
          interests: typeof d.eveningActivity.interests === "string" ? JSON.parse(d.eveningActivity.interests) : d.eveningActivity.interests,
          tags: typeof d.eveningActivity.tags === "string" ? JSON.parse(d.eveningActivity.tags || "[]") : d.eveningActivity.tags,
        } : null,
      })),
    };
  }),
  
  generate: authedQuery
    .input(z.object({
      childAge: z.number().min(1).max(12),
      interests: z.array(z.string()),
      duration: z.number().min(7).max(14).default(7),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Get all activities
      const allActivities = await db.query.activities.findMany();
      
      // Parse JSON fields
      const parsedActivities = allActivities.map((a) => ({
        ...a,
        interests: typeof a.interests === "string" ? JSON.parse(a.interests) : a.interests,
        tags: typeof a.tags === "string" ? JSON.parse(a.tags || "[]") : a.tags,
      }));
      
      // Filter by age and interests
      const filtered = parsedActivities.filter((a) => 
        a.ageMin <= input.childAge && 
        a.ageMax >= input.childAge &&
        a.interests.some((i: string) => input.interests.includes(i))
      );
      
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const planDaysData = [];
      const usedActivityIds = new Set<string>();
      
      for (let i = 0; i < input.duration; i++) {
        const dayName = days[i % 7];
        const isWeekend = dayName === "Sat" || dayName === "Sun";
        
        // Pick morning activity
        const morning = pickRandom(
          filtered.filter((a) => !usedActivityIds.has(a.id)),
          (a) => a.duration === "30-90min" || a.duration === "halfDay"
        ) || pickRandom(filtered, (a) => a.duration === "30-90min" || a.duration === "halfDay");
        
        if (morning) usedActivityIds.add(morning.id);
        
        // Pick afternoon activity for weekends
        const afternoon = isWeekend ? 
          (pickRandom(
            filtered.filter((a) => !usedActivityIds.has(a.id) && a.id !== morning?.id),
            (a) => a.duration === "halfDay" || a.duration === "fullDay"
          ) || pickRandom(filtered, (a) => a.duration === "halfDay" || a.duration === "fullDay"))
          : null;
        
        if (afternoon) usedActivityIds.add(afternoon.id);
        
        planDaysData.push({
          day: dayName,
          date: addDays(new Date(), i),
          morning: morning,
          afternoon: afternoon,
          evening: null,
        });
      }
      
      // Deactivate existing plans
      await db.update(plans)
        .set({ isActive: false })
        .where(eq(plans.userId, ctx.user.id));
      
      // Get user's existing plans count for title
      const existingPlans = await db.query.plans.findMany({
        where: eq(plans.userId, ctx.user.id),
      });
      const weekNumber = existingPlans.length + 1;
      
      // Create new plan
      const [newPlan] = await db.insert(plans).values({
        userId: ctx.user.id,
        title: `Magic Week ${weekNumber}`,
        isActive: true,
      }).$returningId();
      
      const planId = newPlan.id;
      
      // Insert plan days
      for (const day of planDaysData) {
        await db.insert(planDays).values({
          planId,
          day: day.day,
          date: day.date,
          morningActivityId: day.morning?.id || null,
          afternoonActivityId: day.afternoon?.id || null,
          eveningActivityId: null,
        });
      }
      
      return {
        id: planId,
        title: `Magic Week ${weekNumber}`,
        days: planDaysData,
      };
    }),
    
  removeActivity: authedQuery
    .input(z.object({
      planDayId: z.number(),
      timeSlot: z.enum(["morning", "afternoon", "evening"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      const updateField = input.timeSlot === "morning" 
        ? { morningActivityId: null }
        : input.timeSlot === "afternoon"
        ? { afternoonActivityId: null }
        : { eveningActivityId: null };
      
      await db.update(planDays)
        .set(updateField)
        .where(eq(planDays.id, input.planDayId));
      
      return { success: true };
    }),
});
