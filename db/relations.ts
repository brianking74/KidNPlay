import { relations } from "drizzle-orm";
import { users, userProfiles, activities, savedActivities, plans, planDays } from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  savedActivities: many(savedActivities),
  plans: many(plans),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const savedActivitiesRelations = relations(savedActivities, ({ one }) => ({
  user: one(users, {
    fields: [savedActivities.userId],
    references: [users.id],
  }),
  activity: one(activities, {
    fields: [savedActivities.activityId],
    references: [activities.id],
  }),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
  user: one(users, {
    fields: [plans.userId],
    references: [users.id],
  }),
  days: many(planDays),
}));

export const planDaysRelations = relations(planDays, ({ one }) => ({
  plan: one(plans, {
    fields: [planDays.planId],
    references: [plans.id],
  }),
  morningActivity: one(activities, {
    fields: [planDays.morningActivityId],
    references: [activities.id],
  }),
  afternoonActivity: one(activities, {
    fields: [planDays.afternoonActivityId],
    references: [activities.id],
  }),
  eveningActivity: one(activities, {
    fields: [planDays.eveningActivityId],
    references: [activities.id],
  }),
}));
