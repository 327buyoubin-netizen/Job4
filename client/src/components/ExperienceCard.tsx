import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Experience } from "@shared/schema";

interface ExperienceCardProps {
  experience: Experience;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

export function ExperienceCard({
  experience,
  onDelete,
  showDeleteButton = true,
}: ExperienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-white dark:bg-background border border-blue-600 rounded-md overflow-hidden"
      data-testid={`experience-card-${experience.id}`}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover-elevate"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid={`button-toggle-experience-${experience.id}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <span className="font-medium text-sm truncate" data-testid={`text-experience-title-${experience.id}`}>
            {experience.title}
          </span>
        </div>
        {showDeleteButton && onDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(experience.id);
            }}
            data-testid={`button-delete-experience-${experience.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-blue-200 dark:border-blue-800 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{experience.role}</span>
            <span>|</span>
            <span>{experience.period}</span>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">핵심 행동</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {experience.actions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">성과</p>
            <p className="text-sm text-muted-foreground">{experience.results}</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {experience.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {experience.extractedSkills.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">추출된 역량</p>
              <div className="flex flex-wrap gap-1">
                {experience.extractedSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
