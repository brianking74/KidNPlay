import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  decimal,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const activities = mysqlTable("activities", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  ageMin: int("ageMin").notNull(),
  ageMax: int("ageMax").notNull(),
  interests: text("interests").notNull(),
  duration: mysqlEnum("duration", ["30-90min", "halfDay", "fullDay"]).notNull(),
  priceBand: mysqlEnum("priceBand", ["free", "$", "$$", "$$$"]).notNull(),
  isIndoor: boolean("isIndoor").notNull(),
  locationName: varchar("locationName", { length: 255 }),
  bookingUrl: varchar("bookingUrl", { length: 500 }),
  tags: text("tags"),
});

export const userProfiles = mysqlTable("userProfiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  childName: varchar("childName", { length: 255 }),
  childAge: int("childAge"),
  interests: text("interests"),
  isPro: boolean("isPro").default(false).notNull(),
  streakDays: int("streakDays").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const savedActivities = mysqlTable("savedActivities", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  activityId: varchar("activityId", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const plans = mysqlTable("plans", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const planDays = mysqlTable("planDays", {
  id: serial("id").primaryKey(),
  planId: bigint("planId", { mode: "number", unsigned: true }).notNull(),
  day: varchar("day", { length: 20 }).notNull(),
  date: timestamp("date"),
  morningActivityId: varchar("morningActivityId", { length: 50 }),
  afternoonActivityId: varchar("afternoonActivityId", { length: 50 }),
  eveningActivityId: varchar("eveningActivityId", { length: 50 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type PlanDay = typeof planDays.$inferSelect;
export type SavedActivity = typeof savedActivities.$inferSelect;
