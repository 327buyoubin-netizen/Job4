import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseJobContent, extractSkillsFromExperience, matchExperienceToQuestion, generateDraft } from "./parser";
import { insertJobPostingSchema, insertExperienceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/job-postings", async (_req, res) => {
    const postings = await storage.getJobPostings();
    res.json(postings);
  });

  app.post("/api/parse-jobs", async (req, res) => {
    try {
      const { urls, htmlContent } = req.body;
      const results: Array<{ success: boolean; error?: string }> = [];

      if (urls && Array.isArray(urls)) {
        const validUrls = urls.slice(0, 5).filter((url: unknown) => {
          if (typeof url !== "string") return false;
          try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
          } catch {
            return false;
          }
        });

        for (const url of validUrls) {
          try {
            let content = "";
            try {
              const response = await fetch(url, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (compatible; JobParserBot/1.0)",
                },
              });
              content = await response.text();
            } catch {
              results.push({ success: false, error: "URL fetch failed" });
              continue;
            }

            const parsed = parseJobContent(content, url);
            await storage.createJobPosting({
              company: parsed.company,
              title: parsed.title,
              startDate: parsed.startDate,
              endDate: parsed.endDate,
              url,
            });
            results.push({ success: true });
          } catch (err) {
            results.push({ success: false, error: String(err) });
          }
        }
      } else if (htmlContent) {
        try {
          const parsed = parseJobContent(htmlContent);
          await storage.createJobPosting({
            company: parsed.company,
            title: parsed.title,
            startDate: parsed.startDate,
            endDate: parsed.endDate,
            url: "manual-input",
          });
          results.push({ success: true });
        } catch (err) {
          results.push({ success: false, error: String(err) });
        }
      }

      res.json({ results });
    } catch (error) {
      res.status(500).json({ error: "Failed to parse jobs" });
    }
  });

  app.delete("/api/job-postings/:id", async (req, res) => {
    const deleted = await storage.deleteJobPosting(req.params.id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/load-sample-jobs", async (_req, res) => {
    const sampleJobs = [
      {
        company: "네이버",
        title: "2026 신입 개발자 공개채용",
        startDate: "2026-01-10",
        endDate: "2026-01-31",
        url: "https://recruit.navercorp.com",
      },
      {
        company: "카카오",
        title: "2026 상반기 경력 개발자 모집",
        startDate: "2026-01-15",
        endDate: "2026-02-15",
        url: "https://careers.kakao.com",
      },
      {
        company: "삼성전자",
        title: "2026년 상반기 신입사원 모집",
        startDate: "2026-01-20",
        endDate: "2026-02-28",
        url: "https://www.samsung.com/sec/careers/",
      },
    ];

    for (const job of sampleJobs) {
      await storage.createJobPosting(job);
    }

    res.json({ success: true, count: sampleJobs.length });
  });

  app.get("/api/experiences", async (_req, res) => {
    const experiences = await storage.getExperiences();
    res.json(experiences);
  });

  app.post("/api/experiences", async (req, res) => {
    try {
      const data = req.body;
      
      if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
        return res.status(400).json({ error: "Title is required" });
      }
      if (!data.role || typeof data.role !== "string") {
        return res.status(400).json({ error: "Role is required" });
      }
      if (!data.period || typeof data.period !== "string") {
        return res.status(400).json({ error: "Period is required" });
      }
      if (!Array.isArray(data.actions)) {
        return res.status(400).json({ error: "Actions must be an array" });
      }
      if (!data.results || typeof data.results !== "string") {
        return res.status(400).json({ error: "Results is required" });
      }
      if (!Array.isArray(data.tags)) {
        return res.status(400).json({ error: "Tags must be an array" });
      }

      const extractedSkills = extractSkillsFromExperience(
        data.actions,
        data.results,
        data.tags
      );

      const experience = await storage.createExperience({
        title: data.title.trim(),
        role: data.role.trim(),
        period: data.period.trim(),
        actions: data.actions.filter((a: unknown) => typeof a === "string" && a.trim()),
        results: data.results.trim(),
        tags: data.tags.filter((t: unknown) => typeof t === "string" && t.trim()),
        extractedSkills,
      });

      res.json(experience);
    } catch (error) {
      res.status(400).json({ error: "Invalid experience data" });
    }
  });

  app.delete("/api/experiences/:id", async (req, res) => {
    const deleted = await storage.deleteExperience(req.params.id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/load-sample-experiences", async (_req, res) => {
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
      },
      {
        title: "스타트업 마케팅 인턴",
        role: "마케팅 인턴",
        period: "2025.01 - 2025.06",
        actions: [
          "SNS 콘텐츠 기획 및 제작 (월 30건)",
          "광고 성과 데이터 분석 및 리포트 작성",
          "신규 캠페인 아이디어 제안 및 실행",
        ],
        results: "팔로워 30% 증가, 광고 클릭률 2배 향상",
        tags: ["마케팅", "데이터분석", "창의성", "콘텐츠기획"],
      },
      {
        title: "학술 연구 프로젝트 참여",
        role: "연구 보조원",
        period: "2024.09 - 2025.02",
        actions: [
          "문헌 조사 및 선행 연구 분석",
          "데이터 수집 및 통계 분석 수행",
          "연구 결과 보고서 작성 보조",
        ],
        results: "학술대회 발표 논문 공동 저자로 등재",
        tags: ["연구", "분석", "문서작성", "꼼꼼함"],
      },
    ];

    for (const exp of sampleExperiences) {
      const extractedSkills = extractSkillsFromExperience(
        exp.actions,
        exp.results,
        exp.tags
      );
      await storage.createExperience({
        ...exp,
        extractedSkills,
      });
    }

    res.json({ success: true, count: sampleExperiences.length });
  });

  app.post("/api/match-experiences", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const experiences = await storage.getExperiences();
      if (experiences.length === 0) {
        return res.json({ matches: [], draft: "" });
      }

      const matchResults = matchExperienceToQuestion(question, experiences);
      const top3 = matchResults.slice(0, 3);

      const matches = top3.map((result) => ({
        experience: experiences[result.index],
        score: result.score,
        matchedKeywords: result.matchedKeywords,
      }));

      let draft = "";
      if (matches.length > 0) {
        const topExperience = matches[0].experience;
        draft = generateDraft(question, topExperience);
      }

      res.json({ matches, draft });
    } catch (error) {
      res.status(500).json({ error: "Failed to match experiences" });
    }
  });

  return httpServer;
}
