import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Calendar, FileText, Briefcase } from "lucide-react";
import JobSchedulePage from "@/pages/JobSchedulePage";
import ResumeMatchingPage from "@/pages/ResumeMatchingPage";

function MainApp() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight" data-testid="text-app-title">
                취준 매니저
              </h1>
              <p className="text-xs text-muted-foreground">
                채용일정 & 자소서 통합 관리
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="mb-6 w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger
              value="schedule"
              className="flex items-center gap-2"
              data-testid="tab-job-schedule"
            >
              <Calendar className="h-4 w-4" />
              채용 일정
            </TabsTrigger>
            <TabsTrigger
              value="matching"
              className="flex items-center gap-2"
              data-testid="tab-resume-matching"
            >
              <FileText className="h-4 w-4" />
              자소서 매칭
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <JobSchedulePage />
          </TabsContent>

          <TabsContent value="matching">
            <ResumeMatchingPage />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          취준 매니저 PoC - 채용 일정 자동 수집 & 자소서 경험 매칭
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainApp} />
      <Route component={MainApp} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
