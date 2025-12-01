import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Briefcase, Workflow } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

const inputSchema = z.object({
  role: z.string()
    .trim()
    .min(1, "담당 업무를 입력해주세요")
    .max(200, "담당 업무는 200자 이내로 입력해주세요"),
  workflow: z.string()
    .trim()
    .min(10, "워크플로우를 최소 10자 이상 입력해주세요")
    .max(2000, "워크플로우는 2000자 이내로 입력해주세요"),
});

const Index = () => {
  const [role, setRole] = useState("");
  const [workflow, setWorkflow] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    // Validate inputs
    const validation = inputSchema.safeParse({ role, workflow });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setIsLoading(true);
    setAnalysis("");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-architecture", {
        body: { 
          role: validation.data.role,
          workflow: validation.data.workflow 
        },
      });

      if (error) {
        console.error("Function error:", error);
        toast.error(error.message || "분석 중 오류가 발생했습니다");
        return;
      }

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast.success("분석이 완료되었습니다");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("분석 요청 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            솔루션 아키텍쳐 자동 구성
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            업무 워크플로우를 입력하면 AI가 확장 가능한 솔루션 아키텍쳐를 자동으로 생성합니다
          </p>
        </header>

        {/* Input Section */}
        <Card className="p-6 md:p-8 mb-8 shadow-soft border-border/50 backdrop-blur-sm bg-card/80 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <div className="space-y-6">
            {/* Role Input */}
            <div className="space-y-2">
              <label htmlFor="role" className="flex items-center text-sm font-medium text-foreground">
                <Briefcase className="w-4 h-4 mr-2 text-primary" />
                담당 업무
              </label>
              <Input
                id="role"
                placeholder="예: 물류 관리자, IT 시스템 운영자, 영업 팀장 등"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-background/50 border-border focus:border-primary transition-smooth"
                disabled={isLoading}
                maxLength={200}
              />
            </div>

            {/* Workflow Input */}
            <div className="space-y-2">
              <label htmlFor="workflow" className="flex items-center text-sm font-medium text-foreground">
                <Workflow className="w-4 h-4 mr-2 text-primary" />
                업무 워크플로우
              </label>
              <Textarea
                id="workflow"
                placeholder="예: 고객 주문 접수부터 배송까지의 전체 프로세스를 관리하는 시스템이 필요합니다. 주문 관리, 재고 관리, 배송 추적 기능이 포함되어야 합니다."
                value={workflow}
                onChange={(e) => setWorkflow(e.target.value)}
                className="min-h-[160px] resize-none bg-background/50 border-border focus:border-primary transition-smooth"
                disabled={isLoading}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {workflow.length}/2000
              </p>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !workflow.trim() || !role.trim()}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-smooth shadow-soft"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  아키텍쳐 분석 시작
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {analysis && (
          <Card className="p-6 md:p-8 shadow-soft border-border/50 backdrop-blur-sm bg-card/80 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:text-foreground/90 prose-li:text-foreground/90">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!analysis && !isLoading && (
          <div className="text-center py-12 text-muted-foreground animate-in fade-in duration-700 delay-300">
            <p className="text-sm">워크플로우를 입력하고 분석을 시작하세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;