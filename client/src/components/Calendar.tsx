import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobPosting } from "@shared/schema";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

interface CalendarProps {
  jobPostings: JobPosting[];
  onDateClick?: (date: Date) => void;
}

export function Calendar({ jobPostings, onDateClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDate = (date: Date) => {
    return jobPostings.filter((posting) => {
      if (posting.endDate) {
        const endDate = parseISO(posting.endDate);
        return isSameDay(endDate, date);
      }
      return false;
    });
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="w-full" data-testid="calendar-view">
      <div className="flex items-center justify-between mb-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          data-testid="button-prev-month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold" data-testid="text-current-month">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          data-testid="button-next-month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dayItem, idx) => {
          const events = getEventsForDate(dayItem);
          const isCurrentMonth = isSameMonth(dayItem, monthStart);
          const isToday = isSameDay(dayItem, new Date());

          return (
            <div
              key={idx}
              onClick={() => onDateClick?.(dayItem)}
              className={`
                min-h-[80px] p-1 rounded-md border cursor-pointer transition-colors
                ${isCurrentMonth ? "bg-card" : "bg-muted/30"}
                ${isToday ? "border-primary" : "border-transparent"}
                hover-elevate
              `}
              data-testid={`calendar-day-${format(dayItem, "yyyy-MM-dd")}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? "" : "text-muted-foreground"
                } ${isToday ? "text-primary font-bold" : ""}`}
              >
                {format(dayItem, "d")}
              </div>
              <div className="space-y-1">
                {events.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded truncate"
                    title={`${event.company} - ${event.title}`}
                  >
                    {event.company}
                  </div>
                ))}
                {events.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{events.length - 2}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
