import { z } from "zod";

export const jobPostingSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  url: z.string(),
  createdAt: z.string(),
});

export const insertJobPostingSchema = jobPostingSchema.omit({ id: true, createdAt: true });

export type JobPosting = z.infer<typeof jobPostingSchema>;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;

export const experienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  role: z.string(),
  period: z.string(),
  actions: z.array(z.string()),
  results: z.string(),
  tags: z.array(z.string()),
  extractedSkills: z.array(z.string()),
  createdAt: z.string(),
});

export const insertExperienceSchema = experienceSchema.omit({ id: true, createdAt: true, extractedSkills: true });

export type Experience = z.infer<typeof experienceSchema>;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export const matchResultSchema = z.object({
  experience: experienceSchema,
  score: z.number(),
  matchedKeywords: z.array(z.string()),
});

export type MatchResult = z.infer<typeof matchResultSchema>;

export const parseResultSchema = z.object({
  success: z.boolean(),
  jobPosting: jobPostingSchema.optional(),
  error: z.string().optional(),
});

export type ParseResult = z.infer<typeof parseResultSchema>;

export { users, insertUserSchema, type InsertUser, type User } from "./user-schema";
