import type { MatchResult } from "@shared/schema";

interface MatchScoreChartProps {
  results: MatchResult[];
}

export function MatchScoreChart({ results }: MatchScoreChartProps) {
  const maxScore = Math.max(...results.map((r) => r.score), 100);

  return (
    <div className="space-y-3" data-testid="match-score-chart">
      {results.map((result, index) => (
        <div key={result.experience.id} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium truncate max-w-[200px]">
              {index + 1}. {result.experience.title}
            </span>
            <span className="text-muted-foreground">{result.score}점</span>
          </div>
          <div className="h-6 bg-muted rounded-md overflow-hidden">
            <div
              className={`h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2 ${
                index === 0
                  ? "bg-primary"
                  : index === 1
                  ? "bg-chart-2"
                  : "bg-chart-3"
              }`}
              style={{ width: `${(result.score / maxScore) * 100}%` }}
              data-testid={`bar-score-${result.experience.id}`}
            >
              <span className="text-xs font-medium text-white">
                {result.score}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
