import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------ المستخدمون ------------------------------ */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  phone: varchar("phone", { length: 30 }),
  passwordHash: text("password_hash"),
  googleId: varchar("google_id", { length: 190 }),
  role: varchar("role", { length: 20 }).notNull().default("user"), // user | admin
  level: varchar("level", { length: 20 }).notNull().default("beginner"),
  artType: varchar("art_type", { length: 20 }).notNull().default("painting"),
  bio: text("bio").notNull().default(""),
  verified: boolean("verified").notNull().default(false),
  banned: boolean("banned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: varchar("token", { length: 80 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 190 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  payload: jsonb("payload").$type<{ name: string; passwordHash: string; artType: string }>(),
  userId: uuid("user_id"), // when verifying an existing user
  consumed: boolean("consumed").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ الأعمال الفنية ------------------------------ */
export const artworks = pgTable("artworks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // ArtType
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  /** path (/art/x.jpg) أو data URL لمحتوى مرفوع */
  fileUrl: text("file_url").notNull().default(""),
  fileKind: varchar("file_kind", { length: 10 }).notNull().default("image"), // image | audio | video | text
  textContent: text("text_content"),
  likesCount: integer("likes_count").notNull().default(0),
  viewsCount: integer("views_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const artworkLikes = pgTable(
  "artwork_likes",
  {
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.artworkId, t.userId] })],
);

/* ------------------------------ الاختبارات ------------------------------ */
export interface ExamQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  artType: varchar("art_type", { length: 20 }).notNull(),
  description: text("description").notNull().default(""),
  questions: jsonb("questions").$type<ExamQuestion[]>().notNull().default([]),
  practicalRequired: boolean("practical_required").notNull().default(false),
  practicalPrompt: text("practical_prompt"),
  durationMin: integer("duration_min").notNull().default(15),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const examSubmissions = pgTable("exam_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  examId: uuid("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  answers: jsonb("answers").$type<number[]>().notNull().default([]),
  practicalFileUrl: text("practical_file_url"),
  practicalNote: text("practical_note"),
  score: integer("score").notNull().default(0), // 0..100
  status: varchar("status", { length: 20 }).notNull().default("scored"), // scored | pending | reviewed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ الورش ------------------------------ */
export const workshops = pgTable("workshops", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  artType: varchar("art_type", { length: 20 }).notNull(),
  description: text("description").notNull().default(""),
  mode: varchar("mode", { length: 10 }).notNull().default("live"), // live | recorded
  instructor: varchar("instructor", { length: 120 }).notNull().default(""),
  location: varchar("location", { length: 190 }).notNull().default("أونلاين"),
  videoUrl: text("video_url").notNull().default(""),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  capacity: integer("capacity").notNull().default(30),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workshopBookings = pgTable("workshop_bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workshopId: uuid("workshop_id")
    .notNull()
    .references(() => workshops.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ الكورسات ------------------------------ */
export interface CourseModule {
  title: string;
  kind: "video" | "reading" | "exercise";
  body: string;
  videoUrl?: string;
  durationMin?: number;
}

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  artType: varchar("art_type", { length: 20 }).notNull(),
  level: varchar("level", { length: 20 }).notNull().default("beginner"),
  description: text("description").notNull().default(""),
  price: integer("price").notNull().default(0), // 0 = مجاني
  instructor: varchar("instructor", { length: 120 }).notNull().default(""),
  modules: jsonb("modules").$type<CourseModule[]>().notNull().default([]),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ العروض ------------------------------ */
export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  discount: varchar("discount", { length: 40 }).notNull().default(""),
  code: varchar("code", { length: 40 }).notNull().default(""),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ الصفحات الثابتة ------------------------------ */
export const pages = pgTable("pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull().default(""),
  published: boolean("published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ أنواع مشتقة ------------------------------ */
export type User = typeof users.$inferSelect;
export type Artwork = typeof artworks.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type ExamSubmission = typeof examSubmissions.$inferSelect;
export type Workshop = typeof workshops.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type Page = typeof pages.$inferSelect;

/** صف عمل فني مع بيانات صاحبه (مشترك بين البطاقات والصفحات) */
export interface ArtworkWithAuthor {
  artwork: Artwork;
  author: { id: string; name: string; level: string; artType: string };
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  level: string;
  artType: string;
  bio: string;
  phone: string | null;
  createdAt: Date;
}
