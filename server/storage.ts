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
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleJobs = [
      {
        company: "네이버",
        title: "2026 신입 개발자 공개채용",
        positions: ["프론트엔드 개발", "백엔드 개발", "AI/ML", "데이터 분석", "PM/기획"],
        startDate: "2026-01-10",
        endDate: "2026-01-31",
        url: "https://recruit.navercorp.com",
      },
      {
        company: "카카오",
        title: "2026 상반기 경력 개발자 모집",
        positions: ["백엔드 개발", "iOS 개발", "Android 개발", "DevOps/인프라"],
        startDate: "2026-01-15",
        endDate: "2026-02-15",
        url: "https://careers.kakao.com",
      },
      {
        company: "삼성전자",
        title: "2026년 상반기 신입사원 모집",
        positions: ["SW 개발", "HW 개발", "AI 연구", "품질관리", "데이터 분석"],
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        url: "https://careers.samsung.com",
      },
    ];

    for (const job of sampleJobs) {
      const id = randomUUID();
      this.jobPostings.set(id, {
        ...job,
        id,
        createdAt: new Date().toISOString(),
      });
    }

    const sampleExperiences = [
      {
        title: "대학 동아리 프로젝트 리더",
        role: "팀장",
        period: "2024.03 - 2024.12",
        actions: [
          "10명 규모 팀의 역할 분담 및 일정 관리",
          "주간 회의 진행 및 회의록 작성",
          "외부 협력사와의 커뮤니케이션 담당",
        ],
        results: "프로젝트 기한 내 100% 완료, 팀원 만족도 95% 달성",
        tags: ["리더십", "프로젝트관리", "커뮤니케이션", "협업"],
        extractedSkills: ["리더십", "프로젝트관리", "커뮤니케이션", "협업"],
      },
      {
        title: "스타트업 마케팅 인턴",
        role: "마케팅 인턴",
        period: "2025.01 - 2025.06",
        actions: [
          "SNS 콘텐츠 기획 및 제작 (월 30건)",
          "Google Analytics를 활용한 마케팅 성과 분석",
          "인플루언서 협업 캠페인 기획",
        ],
        results: "SNS 팔로워 200% 증가, 캠페인 ROI 150% 달성",
        tags: ["마케팅", "데이터분석", "콘텐츠기획", "SNS운영"],
        extractedSkills: ["마케팅", "데이터분석", "콘텐츠기획", "SNS운영"],
      },
      {
        title: "품질관리 현장실습",
        role: "품질관리 실습생",
        period: "2025.07 - 2025.08",
        actions: [
          "제조 공정 품질 데이터 수집 및 Excel 분석",
          "불량률 원인 파악을 위한 파레토 분석 수행",
          "품질 개선 보고서 작성 및 발표",
        ],
        results: "분석 결과 기반 개선안 제시, 불량률 15% 감소 기여",
        tags: ["품질관리", "데이터분석", "Excel", "문제해결", "보고서작성"],
        extractedSkills: ["품질관리", "데이터분석", "Excel", "문제해결", "보고서작성"],
      },
    ];

    for (const exp of sampleExperiences) {
      const id = randomUUID();
      this.experiences.set(id, {
        ...exp,
        id,
        createdAt: new Date().toISOString(),
      });
    }
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
