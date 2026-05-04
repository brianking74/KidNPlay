import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userProfiles, savedActivities } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const userRouter = createRouter({
  getProfile: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });
    
    if (!profile) {
      // Create default profile
      await db.insert(userProfiles).values({
        userId: ctx.user.id,
        childName: null,
        childAge: null,
        interests: JSON.stringify([]),
        isPro: false,
        streakDays: 0,
      });
      
      return {
        id: 0,
        userId: ctx.user.id,
        childName: null,
        childAge: null,
        interests: [],
        isPro: false,
        streakDays: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    return {
      ...profile,
      interests: typeof profile.interests === "string" ? JSON.parse(profile.interests || "[]") : profile.interests,
    };
  }),
  
  updateProfile: authedQuery
    .input(z.object({
      childName: z.string().optional(),
      childAge: z.number().min(1).max(12).optional(),
      interests: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const existing = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, ctx.user.id),
      });
      
      if (!existing) {
        await db.insert(userProfiles).values({
          userId: ctx.user.id,
          childName: input.childName || null,
          childAge: input.childAge || null,
          interests: JSON.stringify(input.interests || []),
          isPro: false,
          streakDays: 0,
        });
      } else {
        await db.update(userProfiles)
          .set({
            childName: input.childName !== undefined ? input.childName : existing.childName,
            childAge: input.childAge !== undefined ? input.childAge : existing.childAge,
            interests: input.interests !== undefined ? JSON.stringify(input.interests) : existing.interests,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, ctx.user.id));
      }
      
      return { success: true };
    }),
    
  toggleSaved: authedQuery
    .input(z.object({ activityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const existing = await db.query.savedActivities.findFirst({
        where: and(
          eq(savedActivities.userId, ctx.user.id),
          eq(savedActivities.activityId, input.activityId)
        ),
      });
      
      if (existing) {
        await db.delete(savedActivities)
          .where(eq(savedActivities.id, existing.id));
        return { saved: false };
      } else {
        await db.insert(savedActivities).values({
          userId: ctx.user.id,
          activityId: input.activityId,
        });
        return { saved: true };
      }
    }),
    
  getSaved: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    
    const db = getDb();
    const saved = await db.query.savedActivities.findMany({
      where: eq(savedActivities.userId, ctx.user.id),
      with: {
        activity: true,
      },
    });
    
    return saved.map((s) => ({
      ...s,
      activity: s.activity ? {
        ...s.activity,
        interests: typeof s.activity.interests === "string" ? JSON.parse(s.activity.interests) : s.activity.interests,
        tags: typeof s.activity.tags === "string" ? JSON.parse(s.activity.tags || "[]") : s.activity.tags,
      } : null,
    }));
  }),
  
  isSaved: publicQuery
    .input(z.object({ activityId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return false;
      
      const db = getDb();
      const existing = await db.query.savedActivities.findFirst({
        where: and(
          eq(savedActivities.userId, ctx.user.id),
          eq(savedActivities.activityId, input.activityId)
        ),
      });
      
      return !!existing;
    }),
});
