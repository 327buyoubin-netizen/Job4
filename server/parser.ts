export interface ParsedJobInfo {
  company: string;
  title: string;
  positions: string[];
  startDate: string | null;
  endDate: string | null;
}

export function parseJobContent(content: string, url?: string): ParsedJobInfo {
  const datePatterns = [
    /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g,
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g,
    /(\d{2})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g,
  ];

  const dates: Date[] = [];
  
  for (const pattern of datePatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      let year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      
      if (year < 100) {
        year += 2000;
      }
      
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
    /<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i,
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

  const keywordPatterns = [
    /채용|모집|공고|신입|경력|인턴/,
    /마감|접수|지원/,
  ];

  const foundKeywords = keywordPatterns.some((p) => p.test(content));
  if (!foundKeywords && title === "채용 공고") {
    const lines = content.split(/[\r\n]+/).filter((l) => l.trim().length > 10);
    if (lines.length > 0) {
      title = lines[0].substring(0, 100).trim();
    }
  }

  const positions = extractPositions(content);

  return { company, title, positions, startDate, endDate };
}

function extractPositions(content: string): string[] {
  const positionKeywords = [
    "프론트엔드", "백엔드", "풀스택", "개발자", "엔지니어", "developer", "engineer",
    "PM", "프로덕트 매니저", "프로젝트 매니저", "기획자", "서비스 기획",
    "디자이너", "UI", "UX", "그래픽",
    "마케터", "마케팅", "콘텐츠", "광고", "브랜드",
    "데이터", "분석가", "analyst", "scientist", "AI", "ML", "머신러닝",
    "영업", "세일즈", "sales", "어카운트",
    "인사", "HR", "채용 담당", "교육",
    "재무", "회계", "경리",
    "QA", "테스터", "품질",
    "DevOps", "인프라", "클라우드", "SRE",
    "보안", "security",
    "iOS", "Android", "모바일", "앱 개발",
  ];

  const foundPositions: string[] = [];
  const lowerContent = content.toLowerCase();

  for (const keyword of positionKeywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      const normalizedKeyword = normalizePosition(keyword);
      if (!foundPositions.includes(normalizedKeyword)) {
        foundPositions.push(normalizedKeyword);
      }
    }
  }

  return foundPositions.slice(0, 20);
}

function normalizePosition(keyword: string): string {
  const mapping: Record<string, string> = {
    "프론트엔드": "프론트엔드 개발",
    "백엔드": "백엔드 개발",
    "풀스택": "풀스택 개발",
    "developer": "개발",
    "engineer": "엔지니어",
    "PM": "PM/기획",
    "프로덕트 매니저": "PM/기획",
    "프로젝트 매니저": "PM/기획",
    "기획자": "PM/기획",
    "서비스 기획": "PM/기획",
    "디자이너": "디자인",
    "UI": "UI/UX 디자인",
    "UX": "UI/UX 디자인",
    "그래픽": "그래픽 디자인",
    "마케터": "마케팅",
    "마케팅": "마케팅",
    "콘텐츠": "콘텐츠 마케팅",
    "광고": "광고/마케팅",
    "브랜드": "브랜드 마케팅",
    "데이터": "데이터 분석",
    "분석가": "데이터 분석",
    "analyst": "데이터 분석",
    "scientist": "데이터 사이언스",
    "AI": "AI/ML",
    "ML": "AI/ML",
    "머신러닝": "AI/ML",
    "영업": "영업/세일즈",
    "세일즈": "영업/세일즈",
    "sales": "영업/세일즈",
    "어카운트": "어카운트 매니저",
    "인사": "인사/HR",
    "HR": "인사/HR",
    "채용 담당": "인사/HR",
    "교육": "교육/HRD",
    "재무": "재무/회계",
    "회계": "재무/회계",
    "경리": "재무/회계",
    "QA": "QA/테스트",
    "테스터": "QA/테스트",
    "품질": "QA/테스트",
    "DevOps": "DevOps/인프라",
    "인프라": "DevOps/인프라",
    "클라우드": "클라우드",
    "SRE": "SRE",
    "보안": "보안",
    "security": "보안",
    "iOS": "iOS 개발",
    "Android": "Android 개발",
    "모바일": "모바일 개발",
    "앱 개발": "모바일 개발",
  };

  return mapping[keyword] || keyword;
}

export function extractSkillsFromExperience(
  actions: string[],
  results: string,
  tags: string[]
): string[] {
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

export function matchExperienceToQuestion(
  question: string,
  experiences: Array<{ tags: string[]; extractedSkills: string[] }>
): Array<{ index: number; score: number; matchedKeywords: string[] }> {
  const questionKeywords = extractKeywordsFromQuestion(question);

  const results = experiences.map((exp, index) => {
    const expKeywords = [
      ...exp.tags.map((t) => t.toLowerCase()),
      ...exp.extractedSkills.map((s) => s.toLowerCase()),
    ];

    const matchedKeywords: string[] = [];

    for (const qk of questionKeywords) {
      for (const ek of expKeywords) {
        if (ek.includes(qk) || qk.includes(ek)) {
          matchedKeywords.push(ek);
        }
      }
    }

    const uniqueMatches = Array.from(new Set(matchedKeywords));
    const score = Math.min(
      100,
      Math.round((uniqueMatches.length / (questionKeywords.length + 1)) * 100) + 
      Math.min(30, uniqueMatches.length * 15)
    );

    return { index, score, matchedKeywords: uniqueMatches };
  });

  return results.sort((a, b) => b.score - a.score);
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

export function generateDraft(
  question: string,
  experience: {
    title: string;
    role: string;
    period: string;
    actions: string[];
    results: string;
    tags: string[];
  }
): string {
  const intro = `저는 ${experience.title} 경험을 통해 ${experience.tags.slice(0, 2).join(", ")} 역량을 기를 수 있었습니다.`;
  
  const body = experience.actions
    .slice(0, 3)
    .map((action, i) => {
      if (i === 0) return `당시 ${experience.role}로서 ${action}을 담당했습니다.`;
      if (i === 1) return `또한, ${action}을 수행하며 책임감을 발휘했습니다.`;
      return `이 과정에서 ${action}의 중요성을 깨달았습니다.`;
    })
    .join(" ");

  const result = `그 결과, ${experience.results}`;
  
  const conclusion = `이 경험을 통해 ${experience.tags[0] || "협업"}의 중요성을 배웠으며, 이를 바탕으로 귀사에서도 기여하고 싶습니다.`;

  return `${intro}\n\n${body}\n\n${result}\n\n${conclusion}`;
}
