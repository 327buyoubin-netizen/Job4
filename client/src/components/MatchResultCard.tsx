import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MatchResult } from "@shared/schema";

interface MatchResultCardProps {
  result: MatchResult;
  rank: number;
  isTop?: boolean;
}

export function MatchResultCard({ result, rank, isTop }: MatchResultCardProps) {
  const { experience, score, matchedKeywords } = result;

  return (
    <Card
      className={isTop ? "border-primary" : ""}
      data-testid={`match-result-card-${experience.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                rank === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {rank}
            </div>
            <div>
              <CardTitle className="text-base" data-testid={`text-match-title-${experience.id}`}>
                {experience.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {experience.role} | {experience.period}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary" data-testid={`text-match-score-${experience.id}`}>
              {score}
            </div>
            <div className="text-xs text-muted-foreground">점</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">매칭 점수</span>
            <span className="text-sm font-medium">{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">매칭 근거 키워드</p>
          <div className="flex flex-wrap gap-1">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  className="bg-primary/10 text-primary border-0"
                >
                  {keyword}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                직접적인 키워드 매칭 없음
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-1">핵심 경험</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {experience.actions.slice(0, 2).map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
