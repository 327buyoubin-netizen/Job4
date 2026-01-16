import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  return (
    <Card className="relative" data-testid={`experience-card-${experience.id}`}>
      {showDeleteButton && onDelete && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2"
          onClick={() => onDelete(experience.id)}
          data-testid={`button-delete-experience-${experience.id}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-base pr-8" data-testid={`text-experience-title-${experience.id}`}>
          {experience.title}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{experience.role}</span>
          <span>|</span>
          <span>{experience.period}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
}
