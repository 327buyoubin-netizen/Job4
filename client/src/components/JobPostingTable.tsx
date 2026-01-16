import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JobPosting } from "@shared/schema";
import { format, parseISO, isPast, isToday } from "date-fns";

interface JobPostingTableProps {
  jobPostings: JobPosting[];
  onDelete?: (id: string) => void;
}

export function JobPostingTable({ jobPostings, onDelete }: JobPostingTableProps) {
  const getStatusBadge = (posting: JobPosting) => {
    if (!posting.endDate) {
      return <Badge variant="secondary">마감일 미정</Badge>;
    }
    const endDate = parseISO(posting.endDate);
    if (isPast(endDate) && !isToday(endDate)) {
      return <Badge variant="destructive">마감</Badge>;
    }
    if (isToday(endDate)) {
      return <Badge className="bg-amber-500 text-white">오늘 마감</Badge>;
    }
    return <Badge variant="default">진행중</Badge>;
  };

  if (jobPostings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="empty-job-postings">
        <p className="text-lg mb-2">등록된 채용 공고가 없습니다</p>
        <p className="text-sm">URL을 입력하거나 샘플 데이터를 불러오세요</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="job-posting-table">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">회사명</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">공고명</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">시작일</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">마감일</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">액션</th>
          </tr>
        </thead>
        <tbody>
          {jobPostings.map((posting) => (
            <tr
              key={posting.id}
              className="border-b last:border-0 hover-elevate"
              data-testid={`job-posting-row-${posting.id}`}
            >
              <td className="py-3 px-4 font-medium" data-testid={`text-company-${posting.id}`}>
                {posting.company}
              </td>
              <td className="py-3 px-4" data-testid={`text-title-${posting.id}`}>
                {posting.title}
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {posting.startDate
                  ? format(parseISO(posting.startDate), "yyyy.MM.dd")
                  : "-"}
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {posting.endDate
                  ? format(parseISO(posting.endDate), "yyyy.MM.dd")
                  : "-"}
              </td>
              <td className="py-3 px-4">{getStatusBadge(posting)}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => window.open(posting.url, "_blank")}
                    data-testid={`button-open-url-${posting.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(posting.id)}
                      data-testid={`button-delete-${posting.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
