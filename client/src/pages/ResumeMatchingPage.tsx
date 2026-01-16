import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExperienceForm } from "@/components/ExperienceForm";
import { ExperienceCard } from "@/components/ExperienceCard";
import { MatchResultCard } from "@/components/MatchResultCard";
import { MatchScoreChart } from "@/components/MatchScoreChart";
import { DraftPreview } from "@/components/DraftPreview";
import { Loader2, Database, FileText, Sparkles } from "lucide-react";
import type { Experience, MatchResult } from "@shared/schema";

export default function ResumeMatchingPage() {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [keywords, setKeywords] = useState("");
  const [charLimit, setCharLimit] = useState("");
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [draft, setDraft] = useState("");
  const [additionalDetail, setAdditionalDetail] = useState("");
  const [improvedDraft, setImprovedDraft] = useState("");

  const { data: experiences = [], isLoading } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  const addExperienceMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      role: string;
      period: string;
      actions: string[];
      results: string;
      tags: string[];
    }) => {
      const response = await apiRequest("POST", "/api/experiences", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      toast({
        title: "경험 추가 완료",
        description: "새로운 경험이 메타데이터와 함께 저장되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "경험 저장 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/experiences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      toast({ title: "삭제 완료" });
    },
  });

  const loadSampleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/load-sample-experiences");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      toast({
        title: "샘플 데이터 로드 완료",
        description: "3개의 샘플 경험이 추가되었습니다.",
      });
    },
  });

  const matchMutation = useMutation({
    mutationFn: async ({ questionText, keywordsText, charLimitValue }: { questionText: string; keywordsText: string; charLimitValue: string }) => {
      const response = await apiRequest("POST", "/api/match-experiences", {
        question: questionText,
        keywords: keywordsText,
        charLimit: charLimitValue ? parseInt(charLimitValue) : undefined,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMatchResults(data.matches || []);
      setDraft(data.draft || "");
      if (data.matches?.length > 0) {
        toast({
          title: "매칭 완료",
          description: `Top ${data.matches.length} 경험이 매칭되었습니다.`,
        });
      } else {
        toast({
          title: "매칭 결과 없음",
          description: "저장된 경험이 없거나 매칭되는 경험이 없습니다.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "매칭 처리 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleMatch = () => {
    if (!question.trim()) {
      toast({
        title: "문항 입력 필요",
        description: "자소서 문항을 입력하세요.",
        variant: "destructive",
      });
      return;
    }
    if (experiences.length === 0) {
      toast({
        title: "경험 필요",
        description: "먼저 경험을 추가하거나 샘플 데이터를 로드하세요.",
        variant: "destructive",
      });
      return;
    }
    matchMutation.mutate({ questionText: question, keywordsText: keywords, charLimitValue: charLimit });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="space-y-4">
        <ExperienceForm
          onSubmit={addExperienceMutation.mutate}
          isLoading={addExperienceMutation.isPending}
        />

        <Button
          variant="outline"
          onClick={() => loadSampleMutation.mutate()}
          disabled={loadSampleMutation.isPending}
          className="w-full"
          data-testid="button-load-sample-experiences"
        >
          <Database className="h-4 w-4 mr-1" />
          샘플 경험 로드
        </Button>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">저장된 경험 ({experiences.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="empty-experiences">
                <p className="mb-1">저장된 경험이 없습니다</p>
                <p className="text-sm">위 폼에서 경험을 추가하거나</p>
                <p className="text-sm">샘플 데이터를 로드하세요</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {experiences.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              자소서 문항 입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>자소서 문항</Label>
              <Textarea
                placeholder="예: 품질직무에 필요한 데이터 분석 역량 경험을 기술해주세요"
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                data-testid="input-resume-question"
              />
            </div>

            <div className="space-y-2">
              <Label>핵심 역량 키워드 (선택)</Label>
              <Input
                placeholder="예: 리더십, 협업, 커뮤니케이션, 마케팅"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                data-testid="input-keywords"
              />
            </div>

            <div className="space-y-2">
              <Label>글자수 제한 (선택)</Label>
              <Input
                type="number"
                placeholder="예: 500"
                value={charLimit}
                onChange={(e) => setCharLimit(e.target.value)}
                data-testid="input-char-limit"
              />
            </div>

            <Button
              onClick={handleMatch}
              disabled={matchMutation.isPending}
              className="w-full"
              data-testid="button-auto-match"
            >
              {matchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  매칭 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  자동 매칭
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">매칭 점수 차트</CardTitle>
          </CardHeader>
          <CardContent>
            {matchResults.length > 0 ? (
              <MatchScoreChart results={matchResults} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">자동 매칭 후 점수 차트가 표시됩니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top 3 매칭 결과</CardTitle>
          </CardHeader>
          <CardContent>
            {matchResults.length > 0 ? (
              <div className="space-y-4">
                {matchResults.map((result, index) => (
                  <MatchResultCard
                    key={result.experience.id}
                    result={result}
                    rank={index + 1}
                    isTop={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">자동 매칭 후 결과가 표시됩니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {draft ? (
          <DraftPreview draft={draft} question={question} charLimit={charLimit ? parseInt(charLimit) : undefined} />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">자소서 초안</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">자소서 문항을 입력하고</p>
                <p className="text-sm">"자동 매칭"을 클릭하면</p>
                <p className="text-sm">초안이 생성됩니다</p>
              </div>
            </CardContent>
          </Card>
        )}

        {draft && keywords && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">추천 보완 사항</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">"{keywords}"</span>에 대해 더 자세히 작성해주시면 자소서를 개선하는데 도움이 됩니다.
                </p>
              </div>
              <div className="space-y-2">
                <Label>추가 내용 작성</Label>
                <Textarea
                  placeholder="예: 팀 프로젝트에서 의견 충돌 시 양측의 입장을 경청하고 절충안을 제시하여 합의를 이끌어냈습니다..."
                  rows={4}
                  value={additionalDetail}
                  onChange={(e) => setAdditionalDetail(e.target.value)}
                  data-testid="input-additional-detail"
                />
              </div>
              <Button
                onClick={() => {
                  if (additionalDetail.trim()) {
                    const improved = draft + "\n\n[보완 내용]\n" + additionalDetail;
                    setImprovedDraft(improved);
                    toast({
                      title: "보완 완료",
                      description: "추가 내용이 반영된 자소서가 생성되었습니다.",
                    });
                  }
                }}
                disabled={!additionalDetail.trim()}
                className="w-full"
                data-testid="button-apply-improvement"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                보완 내용 적용
              </Button>
            </CardContent>
          </Card>
        )}

        {improvedDraft && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">수정된 자소서</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="p-4 bg-muted/50 rounded-md text-sm leading-relaxed whitespace-pre-wrap"
                data-testid="text-improved-draft"
              >
                {improvedDraft}
              </div>
              <div className="mt-3 flex items-center justify-end gap-2 text-sm">
                <span className={charLimit && improvedDraft.length > parseInt(charLimit) ? "text-red-500 font-medium" : "text-muted-foreground"}>
                  {improvedDraft.length}자
                </span>
                {charLimit && (
                  <span className="text-muted-foreground">/ {charLimit}자</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
