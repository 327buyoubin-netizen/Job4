import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/Calendar";
import { JobPostingTable } from "@/components/JobPostingTable";
import { Loader2, Plus, Trash2, Download, Database, Link as LinkIcon, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { JobPosting } from "@shared/schema";

interface JobCategory {
  name: string;
  keywords: string[];
  count: number;
  companies: string[];
}

function analyzeJobCategories(postings: JobPosting[]): JobCategory[] {
  const categoryDefs: { name: string; keywords: string[] }[] = [
    { name: "개발/IT", keywords: ["개발", "developer", "engineer", "프론트엔드", "백엔드", "풀스택", "소프트웨어", "IT", "프로그래머", "SW"] },
    { name: "마케팅", keywords: ["마케팅", "marketing", "광고", "브랜드", "SNS", "콘텐츠", "홍보", "PR"] },
    { name: "디자인", keywords: ["디자인", "design", "UI", "UX", "그래픽", "웹디자인", "영상"] },
    { name: "기획/PM", keywords: ["기획", "PM", "프로젝트", "매니저", "product", "서비스기획", "전략"] },
    { name: "데이터/AI", keywords: ["데이터", "data", "AI", "머신러닝", "분석", "analyst", "scientist"] },
    { name: "영업/세일즈", keywords: ["영업", "세일즈", "sales", "B2B", "B2C", "어카운트"] },
    { name: "인사/HR", keywords: ["인사", "HR", "채용", "인재", "조직문화", "교육"] },
    { name: "재무/회계", keywords: ["재무", "회계", "finance", "경리", "세무", "감사"] },
    { name: "기타", keywords: [] },
  ];

  const results: JobCategory[] = categoryDefs.map((def) => ({
    name: def.name,
    keywords: def.keywords,
    count: 0,
    companies: [],
  }));

  for (const posting of postings) {
    const text = `${posting.title} ${posting.company}`.toLowerCase();
    let matched = false;

    for (const category of results) {
      if (category.name === "기타") continue;
      for (const keyword of category.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          category.count++;
          if (!category.companies.includes(posting.company)) {
            category.companies.push(posting.company);
          }
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      const etcCategory = results.find((c) => c.name === "기타")!;
      etcCategory.count++;
      if (!etcCategory.companies.includes(posting.company)) {
        etcCategory.companies.push(posting.company);
      }
    }
  }

  return results.filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
}

export default function JobSchedulePage() {
  const { toast } = useToast();
  const [urls, setUrls] = useState<string[]>([""]);
  const [manualInput, setManualInput] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "manual">("url");

  const { data: jobPostings = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/job-postings"],
  });

  const parseMutation = useMutation({
    mutationFn: async (data: { urls?: string[]; htmlContent?: string }) => {
      const response = await apiRequest("POST", "/api/parse-jobs", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      if (data.results) {
        const successCount = data.results.filter((r: { success: boolean }) => r.success).length;
        const failCount = data.results.filter((r: { success: boolean }) => !r.success).length;
        if (successCount > 0) {
          toast({
            title: "메타데이터 생성 완료",
            description: `${successCount}개 공고 추출 성공${failCount > 0 ? `, ${failCount}개 실패` : ""}`,
          });
        } else {
          toast({
            title: "추출 실패",
            description: "공고 정보를 추출할 수 없습니다. 수동 입력을 시도하세요.",
            variant: "destructive",
          });
        }
      }
      setUrls([""]);
      setManualInput("");
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "공고 정보 추출 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/job-postings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      toast({ title: "삭제 완료" });
    },
  });

  const loadSampleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/load-sample-jobs");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      toast({
        title: "샘플 데이터 로드 완료",
        description: "3개의 샘플 채용 공고가 추가되었습니다.",
      });
    },
  });

  const handleAddUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, ""]);
    }
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = () => {
    if (inputMode === "url") {
      const validUrls = urls.filter((u) => u.trim());
      if (validUrls.length === 0) {
        toast({
          title: "URL 입력 필요",
          description: "최소 1개의 URL을 입력하세요.",
          variant: "destructive",
        });
        return;
      }
      parseMutation.mutate({ urls: validUrls });
    } else {
      if (!manualInput.trim()) {
        toast({
          title: "내용 입력 필요",
          description: "공고 HTML/텍스트를 입력하세요.",
          variant: "destructive",
        });
        return;
      }
      parseMutation.mutate({ htmlContent: manualInput });
    }
  };

  const handleDownloadICS = () => {
    const events = jobPostings
      .filter((p) => p.endDate)
      .map((p) => {
        const endDate = new Date(p.endDate!);
        const dateStr = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        return `BEGIN:VEVENT
DTSTART:${dateStr}
DTEND:${dateStr}
SUMMARY:${p.company} - ${p.title} 마감
DESCRIPTION:${p.url}
END:VEVENT`;
      });

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//취준매니저//KO
${events.join("\n")}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "ICS 다운로드 완료",
      description: "캘린더 파일이 다운로드되었습니다.",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="lg:w-[400px] flex-shrink-0 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              채용 공고 입력
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              관심있는 기업 공고를 최대 5개 입력하시면 자동으로 캘린더에 일정이 추가됩니다
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "url" | "manual")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" data-testid="tab-url-input">URL 입력</TabsTrigger>
                <TabsTrigger value="manual" data-testid="tab-manual-input">수동 입력</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-3 mt-3">
                {urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="https://example.com/job/123"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      data-testid={`input-url-${index}`}
                    />
                    {urls.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveUrl(index)}
                        data-testid={`button-remove-url-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                {urls.length < 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddUrl}
                    className="w-full"
                    data-testid="button-add-url"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    URL 추가 (최대 5개)
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="manual" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>HTML/텍스트 붙여넣기</Label>
                  <Textarea
                    placeholder="채용 공고 페이지의 HTML이나 텍스트를 붙여넣으세요..."
                    rows={8}
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    data-testid="input-manual-content"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleSubmit}
              disabled={parseMutation.isPending}
              className="w-full"
              data-testid="button-generate-job-metadata"
            >
              {parseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "메타데이터 생성 (채용)"
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => loadSampleMutation.mutate()}
                disabled={loadSampleMutation.isPending}
                className="flex-1"
                data-testid="button-load-sample-jobs"
              >
                <Database className="h-4 w-4 mr-1" />
                샘플 로드
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadICS}
                disabled={jobPostings.length === 0}
                className="flex-1"
                data-testid="button-download-ics"
              >
                <Download className="h-4 w-4 mr-1" />
                ICS 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              공고 분석
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              지원한 직무를 분석하여 관심 분야를 파악합니다
            </p>
          </CardHeader>
          <CardContent>
            {jobPostings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                공고를 추가하면 직무 분석 결과가 표시됩니다
              </p>
            ) : (
              <div className="space-y-3">
                {analyzeJobCategories(jobPostings).map((category, index) => (
                  <div
                    key={category.name}
                    className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
                    data-testid={`job-category-${index}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary">{category.count}개</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {category.companies.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 space-y-4 min-w-0">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">추출된 공고 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <JobPostingTable
                jobPostings={jobPostings}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">캘린더 뷰</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar jobPostings={jobPostings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
