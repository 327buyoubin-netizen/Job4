import express from "express";
import serverless from "serverless-http";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());

interface JobPosting {
  id: string;
  company: string;
  title: string;
  positions: string[];
  startDate: string | null;
  endDate: string | null;
  url: string;
  createdAt: string;
}

interface Experience {
  id: string;
  title: string;
  role: string;
  period: string;
  actions: string[];
  results: string;
  tags: string[];
  extractedSkills: string[];
  createdAt: string;
}

const jobPostings: Map<string, JobPosting> = new Map();
const experiences: Map<string, Experience> = new Map();

function extractPositions(content: string): string[] {
  const positionKeywords = [
    "프론트엔드", "백엔드", "풀스택", "개발자", "엔지니어",
    "PM", "프로덕트 매니저", "기획자",
    "디자이너", "UI", "UX",
    "마케터", "마케팅", "콘텐츠",
    "데이터", "분석가", "AI", "ML",
    "영업", "세일즈",
    "인사", "HR",
    "재무", "회계",
    "QA", "테스터", "품질",
    "DevOps", "인프라",
    "iOS", "Android", "모바일",
  ];

  const mapping: Record<string, string> = {
    "프론트엔드": "프론트엔드 개발",
    "백엔드": "백엔드 개발",
    "풀스택": "풀스택 개발",
    "PM": "PM/기획",
    "프로덕트 매니저": "PM/기획",
    "기획자": "PM/기획",
    "디자이너": "디자인",
    "UI": "UI/UX 디자인",
    "UX": "UI/UX 디자인",
    "마케터": "마케팅",
    "마케팅": "마케팅",
    "콘텐츠": "콘텐츠 마케팅",
    "데이터": "데이터 분석",
    "분석가": "데이터 분석",
    "AI": "AI/ML",
    "ML": "AI/ML",
    "영업": "영업/세일즈",
    "세일즈": "영업/세일즈",
    "인사": "인사/HR",
    "HR": "인사/HR",
    "재무": "재무/회계",
    "회계": "재무/회계",
    "QA": "QA/테스트",
    "테스터": "QA/테스트",
    "품질": "품질관리",
    "DevOps": "DevOps/인프라",
    "인프라": "DevOps/인프라",
    "iOS": "iOS 개발",
    "Android": "Android 개발",
    "모바일": "모바일 개발",
  };

  const foundPositions: string[] = [];
  const lowerContent = content.toLowerCase();

  for (const keyword of positionKeywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      const normalized = mapping[keyword] || keyword;
      if (!foundPositions.includes(normalized)) {
        foundPositions.push(normalized);
      }
    }
  }

  return foundPositions.slice(0, 20);
}

function parseJobContent(content: string, url?: string) {
  const datePatterns = [
    /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g,
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g,
  ];

  const dates: Date[] = [];
  
  for (const pattern of datePatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      let year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      
      if (year >= 2020 && year <= 2030 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      }
    }
  }

  dates.sort((a, b) => a.getTime() - b.getTime());

  let startDate: string | null = null;
  let endDate: string | null = null;

  if (dates.length >= 2) {
    startDate = dates[0].toISOString().split("T")[0];
    endDate = dates[dates.length - 1].toISOString().split("T")[0];
  } else if (dates.length === 1) {
    endDate = dates[0].toISOString().split("T")[0];
  }

  let company = "알 수 없음";
  let title = "채용 공고";

  const companyPatterns = [
    /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i,
    /<title>([^<]+)<\/title>/i,
  ];

  for (const pattern of companyPatterns) {
    const match = content.match(pattern);
    if (match) {
      const extracted = match[1].trim();
      if (extracted.length > 0 && extracted.length < 50) {
        company = extracted.split(/[-|–]/).map(s => s.trim())[0] || company;
        break;
      }
    }
  }

  const titlePatterns = [
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<title>([^<]+)<\/title>/i,
  ];

  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match) {
      const extracted = match[1].trim();
      if (extracted.length > 0 && extracted.length < 200) {
        title = extracted;
        break;
      }
    }
  }

  if (url) {
    try {
      const urlObj = new URL(url);
      if (company === "알 수 없음") {
        const hostname = urlObj.hostname.replace(/^www\./, "");
        const parts = hostname.split(".");
        if (parts.length >= 2) {
          company = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }
      }
    } catch {}
  }

  const positions = extractPositions(content);

  return { company, title, positions, startDate, endDate };
}

function extractSkillsFromExperience(actions: string[], results: string, tags: string[]): string[] {
  const skillKeywords: Record<string, string[]> = {
    리더십: ["리더", "팀장", "주도", "이끌", "관리", "조율"],
    커뮤니케이션: ["소통", "협력", "조율", "커뮤니케이션", "설득", "발표", "협업"],
    문제해결: ["문제", "해결", "분석", "개선", "최적화"],
    기획력: ["기획", "전략", "계획", "설계", "구상"],
    실행력: ["실행", "추진", "완료", "달성", "성과"],
    창의성: ["창의", "아이디어", "혁신", "새로운"],
    데이터분석: ["데이터", "분석", "통계", "인사이트"],
    프로젝트관리: ["프로젝트", "일정", "관리", "진행"],
  };

  const allText = [...actions, results, ...tags].join(" ").toLowerCase();
  const foundSkills: string[] = [];

  for (const [skill, keywords] of Object.entries(skillKeywords)) {
    if (keywords.some((kw) => allText.includes(kw))) {
      foundSkills.push(skill);
    }
  }

  return Array.from(new Set(foundSkills));
}

function extractKeywordsFromQuestion(question: string): string[] {
  const stopWords = [
    "의", "를", "을", "이", "가", "은", "는", "에", "와", "과", "도", "로", "으로",
    "에서", "부터", "까지", "하는", "한", "있는", "있습니다", "해주세요", "작성",
    "경험", "어떤", "무엇", "어떻게", "왜", "때", "통해", "대해", "관해",
  ];

  const words = question
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.includes(w));

  return Array.from(new Set(words));
}

function matchExperienceToQuestion(
  question: string,
  exps: Array<{ tags: string[]; extractedSkills: string[] }>,
  keywords?: string
): Array<{ index: number; score: number; matchedKeywords: string[] }> {
  const questionKeywords = extractKeywordsFromQuestion(question);
  
  const userKeywords = keywords
    ? keywords.split(/[,，\s]+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 0)
    : [];
  
  const allSearchKeywords = [...questionKeywords, ...userKeywords];

  const results = exps.map((exp, index) => {
    const expKeywords = [
      ...exp.tags.map((t) => t.toLowerCase()),
      ...exp.extractedSkills.map((s) => s.toLowerCase()),
    ];

    const matchedKeywords: string[] = [];

    for (const qk of allSearchKeywords) {
      for (const ek of expKeywords) {
        if (ek.includes(qk) || qk.includes(ek)) {
          matchedKeywords.push(ek);
        }
      }
    }

    const uniqueMatches = Array.from(new Set(matchedKeywords));
    const score = Math.min(
      100,
      Math.round((uniqueMatches.length / (allSearchKeywords.length + 1)) * 100) + 
      Math.min(30, uniqueMatches.length * 15)
    );

    return { index, score, matchedKeywords: uniqueMatches };
  });

  return results.sort((a, b) => b.score - a.score);
}

function normalizeAction(action: string): string {
  let normalized = action.trim();
  normalized = normalized.replace(/[.。,，;；!！?？]+$/, "");
  return normalized;
}

function formatActionSentence(action: string, index: number): string {
  const normalized = normalizeAction(action);
  
  switch (index) {
    case 0:
      return `먼저, ${normalized} 업무를 수행했습니다.`;
    case 1:
      return `이와 함께 ${normalized}에도 힘썼습니다.`;
    case 2:
      return `또한, ${normalized}을 담당하며 팀에 기여했습니다.`;
    default:
      return `${normalized}도 진행했습니다.`;
  }
}

function generateDraft(
  question: string,
  experience: {
    title: string;
    role: string;
    period: string;
    actions: string[];
    results: string;
    tags: string[];
  },
  charLimit?: number
): string {
  const mainSkill = experience.tags[0] || "협업";
  const secondSkill = experience.tags[1] || "문제해결";
  
  const intro = `저는 '${experience.title}' 경험을 통해 ${mainSkill}과 ${secondSkill} 역량을 키울 수 있었습니다. ${experience.period} 동안 ${experience.role}로 활동하며 다양한 도전과 성장의 기회를 얻었습니다.`;
  
  const actions = experience.actions;
  const bodyParts: string[] = [];
  
  for (let i = 0; i < Math.min(actions.length, 3); i++) {
    bodyParts.push(formatActionSentence(actions[i], i));
  }
  
  const body = bodyParts.join(" ");

  const normalizedResult = normalizeAction(experience.results);
  const result = `이러한 노력의 결과, ${normalizedResult}라는 성과를 달성할 수 있었습니다. 이 과정에서 ${mainSkill}의 중요성을 깊이 체감했으며, 어려운 상황에서도 포기하지 않는 끈기를 기를 수 있었습니다.`;
  
  const conclusion = `이 경험을 바탕으로 귀사에서도 ${mainSkill}과 ${secondSkill}을 발휘하여 조직의 목표 달성에 기여하는 인재가 되겠습니다. 항상 배우는 자세로 성장하며, 맡은 업무에 책임감을 가지고 최선을 다하겠습니다.`;

  let fullDraft = `${intro}\n\n${body}\n\n${result}\n\n${conclusion}`;

  if (charLimit && fullDraft.length > charLimit) {
    const shortIntro = `저는 '${experience.title}' 경험을 통해 ${mainSkill} 역량을 키웠습니다.`;
    
    let shortBody = "";
    if (actions.length >= 1) {
      shortBody = `${experience.role}로서 ${normalizeAction(actions[0])} 업무를 수행했습니다.`;
      if (actions.length >= 2) {
        shortBody += ` ${normalizeAction(actions[1])}에도 힘썼습니다.`;
      }
    }
    
    const shortResult = `그 결과, ${normalizedResult}라는 성과를 얻었습니다.`;
    const shortConclusion = `이 경험을 바탕으로 귀사에서 ${mainSkill}을 발휘하여 기여하겠습니다.`;
    
    fullDraft = `${shortIntro}\n\n${shortBody}\n\n${shortResult}\n\n${shortConclusion}`;
    
    if (fullDraft.length > charLimit) {
      fullDraft = fullDraft.substring(0, charLimit - 3) + "...";
    }
  }

  return fullDraft;
}

function initializeSampleData() {
  if (jobPostings.size === 0) {
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
        positions: ["마케팅", "영업/세일즈", "인사/HR", "재무/회계", "품질관리"],
        startDate: "2026-01-20",
        endDate: "2026-02-28",
        url: "https://www.samsung.com/sec/careers/",
      },
    ];

    for (const job of sampleJobs) {
      const id = randomUUID();
      const posting: JobPosting = {
        ...job,
        id,
        createdAt: new Date().toISOString(),
      };
      jobPostings.set(id, posting);
    }
  }

  if (experiences.size === 0) {
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
      const id = randomUUID();
      const experience: Experience = {
        ...exp,
        id,
        extractedSkills,
        createdAt: new Date().toISOString(),
      };
      experiences.set(id, experience);
    }
  }
}

initializeSampleData();

app.get("/api/job-postings", (_req, res) => {
  initializeSampleData();
  const postings = Array.from(jobPostings.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
          const id = randomUUID();
          const posting: JobPosting = {
            id,
            company: parsed.company,
            title: parsed.title,
            positions: parsed.positions,
            startDate: parsed.startDate,
            endDate: parsed.endDate,
            url,
            createdAt: new Date().toISOString(),
          };
          jobPostings.set(id, posting);
          results.push({ success: true });
        } catch (err) {
          results.push({ success: false, error: String(err) });
        }
      }
    } else if (htmlContent) {
      try {
        const parsed = parseJobContent(htmlContent);
        const id = randomUUID();
        const posting: JobPosting = {
          id,
          company: parsed.company,
          title: parsed.title,
          positions: parsed.positions,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          url: "manual-input",
          createdAt: new Date().toISOString(),
        };
        jobPostings.set(id, posting);
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

app.delete("/api/job-postings/:id", (req, res) => {
  const deleted = jobPostings.delete(req.params.id);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.post("/api/load-sample-jobs", (_req, res) => {
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
      positions: ["마케팅", "영업/세일즈", "인사/HR", "재무/회계", "품질관리"],
      startDate: "2026-01-20",
      endDate: "2026-02-28",
      url: "https://www.samsung.com/sec/careers/",
    },
  ];

  for (const job of sampleJobs) {
    const id = randomUUID();
    const posting: JobPosting = {
      ...job,
      id,
      createdAt: new Date().toISOString(),
    };
    jobPostings.set(id, posting);
  }

  res.json({ success: true, count: sampleJobs.length });
});

app.get("/api/experiences", (_req, res) => {
  initializeSampleData();
  const exps = Array.from(experiences.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(exps);
});

app.post("/api/experiences", (req, res) => {
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

    const id = randomUUID();
    const experience: Experience = {
      id,
      title: data.title.trim(),
      role: data.role.trim(),
      period: data.period.trim(),
      actions: data.actions.filter((a: unknown) => typeof a === "string" && (a as string).trim()),
      results: data.results.trim(),
      tags: data.tags.filter((t: unknown) => typeof t === "string" && (t as string).trim()),
      extractedSkills,
      createdAt: new Date().toISOString(),
    };
    experiences.set(id, experience);

    res.json(experience);
  } catch (error) {
    res.status(400).json({ error: "Invalid experience data" });
  }
});

app.delete("/api/experiences/:id", (req, res) => {
  const deleted = experiences.delete(req.params.id);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.post("/api/load-sample-experiences", (_req, res) => {
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
    const id = randomUUID();
    const experience: Experience = {
      ...exp,
      id,
      extractedSkills,
      createdAt: new Date().toISOString(),
    };
    experiences.set(id, experience);
  }

  res.json({ success: true, count: sampleExperiences.length });
});

app.post("/api/match-experiences", (req, res) => {
  try {
    initializeSampleData();
    const { question, keywords, charLimit } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const allExperiences = Array.from(experiences.values());
    if (allExperiences.length === 0) {
      return res.json({ matches: [], draft: "" });
    }

    const matchResults = matchExperienceToQuestion(question, allExperiences, keywords);
    const top3 = matchResults.slice(0, 3);

    const matches = top3.map((result) => ({
      experience: allExperiences[result.index],
      score: result.score,
      matchedKeywords: result.matchedKeywords,
    }));

    let draft = "";
    if (matches.length > 0) {
      const topExperience = matches[0].experience;
      draft = generateDraft(question, topExperience, charLimit);
    }

    res.json({ matches, draft });
  } catch (error) {
    res.status(500).json({ error: "Failed to match experiences" });
  }
});

export const handler = serverless(app);
