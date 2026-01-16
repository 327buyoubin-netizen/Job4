import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const experienceFormSchema = z.object({
  title: z.string().min(1, "경험 제목을 입력하세요"),
  role: z.string().min(1, "역할을 입력하세요"),
  period: z.string().min(1, "기간을 입력하세요"),
  actions: z.string().min(1, "핵심 행동을 입력하세요"),
  results: z.string().min(1, "성과를 입력하세요"),
  tags: z.string().min(1, "키워드를 입력하세요"),
});

type ExperienceFormData = z.infer<typeof experienceFormSchema>;

interface ExperienceFormProps {
  onSubmit: (data: {
    title: string;
    role: string;
    period: string;
    actions: string[];
    results: string;
    tags: string[];
  }) => void;
  isLoading?: boolean;
}

export function ExperienceForm({ onSubmit, isLoading }: ExperienceFormProps) {
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: "",
      role: "",
      period: "",
      actions: "",
      results: "",
      tags: "",
    },
  });

  const handleSubmit = (data: ExperienceFormData) => {
    onSubmit({
      title: data.title,
      role: data.role,
      period: data.period,
      actions: data.actions.split("\n").filter((a) => a.trim()),
      results: data.results,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    form.reset();
  };

  return (
    <Card data-testid="experience-form-card">
      <CardHeader>
        <CardTitle className="text-lg">경험 데이터 입력</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">경험 제목</Label>
            <Input
              id="title"
              placeholder="예: 대학 동아리 프로젝트 리더"
              {...form.register("title")}
              data-testid="input-experience-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Input
                id="role"
                placeholder="예: 팀장"
                {...form.register("role")}
                data-testid="input-experience-role"
              />
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">기간</Label>
              <Input
                id="period"
                placeholder="예: 2023.03 - 2023.12"
                {...form.register("period")}
                data-testid="input-experience-period"
              />
              {form.formState.errors.period && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.period.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actions">핵심 행동 (줄바꿈으로 구분)</Label>
            <Textarea
              id="actions"
              placeholder="예:&#10;팀원 10명의 역할 분담 및 일정 관리&#10;주간 회의 진행 및 문서화&#10;외부 협력사 커뮤니케이션 담당"
              rows={3}
              {...form.register("actions")}
              data-testid="input-experience-actions"
            />
            {form.formState.errors.actions && (
              <p className="text-sm text-destructive">
                {form.formState.errors.actions.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="results">성과 (수치 포함 권장)</Label>
            <Textarea
              id="results"
              placeholder="예: 프로젝트 기한 내 완료, 팀 만족도 95% 달성"
              rows={2}
              {...form.register("results")}
              data-testid="input-experience-results"
            />
            {form.formState.errors.results && (
              <p className="text-sm text-destructive">
                {form.formState.errors.results.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">키워드 (쉼표로 구분)</Label>
            <Input
              id="tags"
              placeholder="예: 리더십, 프로젝트관리, 커뮤니케이션, 협업"
              {...form.register("tags")}
              data-testid="input-experience-tags"
            />
            {form.formState.errors.tags && (
              <p className="text-sm text-destructive">
                {form.formState.errors.tags.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="button-generate-experience-metadata"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "메타데이터 생성 (경험)"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
