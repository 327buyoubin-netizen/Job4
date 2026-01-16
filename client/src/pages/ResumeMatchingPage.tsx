import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [draft, setDraft] = useState("");

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
    mutationFn: async (questionText: string) => {
      const response = await apiRequest("POST", "/api/match-experiences", {
        question: questionText,
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
    matchMutation.mutate(question);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="lg:w-[420px] flex-shrink-0 space-y-4">
        <ExperienceForm
          onSubmit={addExperienceMutation.mutate}
          isLoading={addExperienceMutation.isPending}
        />

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
                placeholder="예: 팀 프로젝트에서 갈등 상황을 어떻게 해결했는지 경험을 작성해 주세요."
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                data-testid="input-resume-question"
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
          </CardContent>
        </Card>

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

      <div className="flex-1 space-y-4 min-w-0">
        {matchResults.length > 0 && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">매칭 점수 차트</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchScoreChart results={matchResults} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Top 3 매칭 결과</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {draft && <DraftPreview draft={draft} question={question} />}
          </>
        )}

        {matchResults.length === 0 && (
          <Card className="flex-1">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">매칭 결과가 여기에 표시됩니다</h3>
              <p className="text-muted-foreground max-w-md">
                자소서 문항을 입력하고 "자동 매칭" 버튼을 클릭하면
                저장된 경험 중 가장 적합한 Top 3를 찾아 점수와 함께 보여드립니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
