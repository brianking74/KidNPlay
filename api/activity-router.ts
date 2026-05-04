import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { activities } from "@db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export const activityRouter = createRouter({
  getAll: publicQuery
    .input(
      z.object({
        age: z.number().optional(),
        interests: z.array(z.string()).optional(),
        priceBand: z.enum(["free", "$", "$$", "$$$"]).optional(),
        isIndoor: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      
      if (input?.age !== undefined) {
        conditions.push(and(gte(activities.ageMin, input.age), lte(activities.ageMax, input.age)));
      }
      if (input?.priceBand) {
        conditions.push(eq(activities.priceBand, input.priceBand));
      }
      if (input?.isIndoor !== undefined) {
        conditions.push(eq(activities.isIndoor, input.isIndoor));
      }
      
      const result = await db.query.activities.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
      });
      
      // Parse JSON fields
      return result.map((a) => ({
        ...a,
        interests: typeof a.interests === "string" ? JSON.parse(a.interests) : a.interests,
        tags: typeof a.tags === "string" ? JSON.parse(a.tags || "[]") : a.tags,
      }));
    }),
    
  getById: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.activities.findFirst({
        where: eq(activities.id, input.id),
      });
      
      if (!result) return null;
      
      return {
        ...result,
        interests: typeof result.interests === "string" ? JSON.parse(result.interests) : result.interests,
        tags: typeof result.tags === "string" ? JSON.parse(result.tags || "[]") : result.tags,
      };
    }),
    
  getNearby: publicQuery
    .input(z.object({
      lat: z.number(),
      lng: z.number(),
      radiusKm: z.number().default(5),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.activities.findMany();
      
      // Haversine distance calculation
      const R = 6371; // Earth's radius in km
      const filtered = result.filter((a) => {
        if (!a.lat || !a.lng) return false;
        const dLat = (Number(a.lat) - input.lat) * Math.PI / 180;
        const dLon = (Number(a.lng) - input.lng) * Math.PI / 180;
        const lat1 = input.lat * Math.PI / 180;
        const lat2 = Number(a.lat) * Math.PI / 180;
        const a_ = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a_), Math.sqrt(1 - a_));
        const d = R * c;
        return d <= input.radiusKm;
      });
      
      return filtered.map((a) => ({
        ...a,
        interests: typeof a.interests === "string" ? JSON.parse(a.interests) : a.interests,
        tags: typeof a.tags === "string" ? JSON.parse(a.tags || "[]") : a.tags,
      }));
    }),
});
