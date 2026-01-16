import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Calendar, FileText } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import JobSchedulePage from "@/pages/JobSchedulePage";
import ResumeMatchingPage from "@/pages/ResumeMatchingPage";
import { IntroScreen } from "@/components/IntroScreen";
import { AdPopup } from "@/components/AdPopup";

function MainApp() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-end">
          <ThemeToggle />
        </div>
      </header>

      <section className="py-10 text-center">
        <p className="text-2xl text-muted-foreground mb-2" data-testid="text-subtitle">
          여러분의 취업 비서
        </p>
        <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight mb-4" data-testid="text-app-title">
          JOB FOR YOU
        </h1>
        <p className="text-lg text-sky-400 font-bold" data-testid="text-description">
          채용일정 또는 자소서 매칭을 탭해보세요
        </p>
      </section>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="mb-6 w-full max-w-lg mx-auto grid grid-cols-2 h-14 bg-primary/10 p-1">
            <TabsTrigger
              value="schedule"
              className="flex items-center gap-2 text-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12"
              data-testid="tab-job-schedule"
            >
              <Calendar className="h-5 w-5" />
              채용 일정
            </TabsTrigger>
            <TabsTrigger
              value="matching"
              className="flex items-center gap-2 text-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12"
              data-testid="tab-resume-matching"
            >
              <FileText className="h-5 w-5" />
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

      <footer className="border-t border-border/50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          JOB FOR YOU - 채용 일정 자동 수집 & 자소서 경험 매칭
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
  const [showIntro, setShowIntro] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatePresence>
          {showIntro && <IntroScreen onEnter={() => setShowIntro(false)} />}
        </AnimatePresence>
        {!showIntro && (
          <>
            <Router />
            <AdPopup delay={2000} />
          </>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
