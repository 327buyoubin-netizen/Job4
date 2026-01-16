import { randomUUID } from "crypto";
import type { JobPosting, InsertJobPosting, Experience, InsertExperience } from "@shared/schema";

export interface IStorage {
  getJobPostings(): Promise<JobPosting[]>;
  getJobPosting(id: string): Promise<JobPosting | undefined>;
  createJobPosting(posting: InsertJobPosting): Promise<JobPosting>;
  deleteJobPosting(id: string): Promise<boolean>;

  getExperiences(): Promise<Experience[]>;
  getExperience(id: string): Promise<Experience | undefined>;
  createExperience(experience: Omit<InsertExperience, "extractedSkills"> & { extractedSkills: string[] }): Promise<Experience>;
  deleteExperience(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private jobPostings: Map<string, JobPosting>;
  private experiences: Map<string, Experience>;

  constructor() {
    this.jobPostings = new Map();
    this.experiences = new Map();
  }

  async getJobPostings(): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getJobPosting(id: string): Promise<JobPosting | undefined> {
    return this.jobPostings.get(id);
  }

  async createJobPosting(insertPosting: InsertJobPosting): Promise<JobPosting> {
    const id = randomUUID();
    const posting: JobPosting = {
      ...insertPosting,
      id,
      createdAt: new Date().toISOString(),
    };
    this.jobPostings.set(id, posting);
    return posting;
  }

  async deleteJobPosting(id: string): Promise<boolean> {
    return this.jobPostings.delete(id);
  }

  async getExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getExperience(id: string): Promise<Experience | undefined> {
    return this.experiences.get(id);
  }

  async createExperience(insertExperience: Omit<InsertExperience, "extractedSkills"> & { extractedSkills: string[] }): Promise<Experience> {
    const id = randomUUID();
    const experience: Experience = {
      ...insertExperience,
      id,
      createdAt: new Date().toISOString(),
    };
    this.experiences.set(id, experience);
    return experience;
  }

  async deleteExperience(id: string): Promise<boolean> {
    return this.experiences.delete(id);
  }
}

export const storage = new MemStorage();
