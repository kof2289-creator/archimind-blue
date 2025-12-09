import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Download, Rocket, Brain, Lightbulb, Bot, RotateCcw, FileText, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface AXIdea {
  solutionTitle: string;
  process: string;
  category: "Assistant" | "Advisor" | "Agent";
  solutionOverview: string;
  humanRole: string;
  expectedEffects: string[];
  keywords: string[];
  technologies: string[];
}

const roleColors = {
  Assistant: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-500 text-white",
    badgeLight: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: Bot,
    iconBg: "bg-emerald-500",
  },
  Advisor: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-500 text-white",
    badgeLight: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    text: "text-blue-700 dark:text-blue-400",
    icon: Brain,
    iconBg: "bg-blue-500",
  },
  Agent: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    badge: "bg-violet-500 text-white",
    badgeLight: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    text: "text-violet-700 dark:text-violet-400",
    icon: Lightbulb,
    iconBg: "bg-violet-500",
  },
};

const Index = () => {
  const [businessArea, setBusinessArea] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [expectations, setExpectations] = useState("");
  const [ideas, setIdeas] = useState<AXIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleResetInput = () => {
    setBusinessArea("");
    setPainPoints("");
    setExpectations("");
    toast.success("입력 정보가 초기화되었습니다");
  };

  const handleResetIdeas = () => {
    setIdeas([]);
    toast.success("아이디어가 초기화되었습니다");
  };

  const handleLoadExample = () => {
    setBusinessArea("생산계획 / MPS");
    setPainPoints("장비마다 공급사(SEMI eq.)가 달라 인터페이스가 표준화되어 있지 않고, 데이터 수집이 수작업으로 이루어져 시간이 많이 소요됨. 시스템 간 연결이 미흡하여 재작업이 빈번하게 발생함.");
    setExpectations("데이터 수집 자동화, 실시간 모니터링 체계 구축, 업무 효율화 및 오류 감소");
    toast.success("예시 데이터가 입력되었습니다");
  };

  const handleGenerate = async () => {
    if (!businessArea.trim() || !painPoints.trim() || !expectations.trim()) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }

    setIsLoading(true);
    setIdeas([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ax-ideas", {
        body: {
          businessArea: businessArea.trim(),
          painPoints: painPoints.trim(),
          expectations: expectations.trim(),
        },
      });

      if (error) {
        console.error("Function error:", error);
        toast.error(error.message || "아이디어 생성 중 오류가 발생했습니다");
        return;
      }

      if (data?.ideas) {
        setIdeas(data.ideas);
        toast.success("아이디어가 생성되었습니다");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("아이디어 생성 요청 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCard = async (index: number) => {
    const cardElement = cardRefs.current[index];
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `ax-idea-${ideas[index].category}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success("카드를 PNG로 저장했습니다");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("카드 저장 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Unified Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-sky-50/50 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(210_100%_50%/0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(200_90%_50%/0.06)_0%,transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header Section - More Compact */}
        <header className="relative">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div 
              className="max-w-4xl mx-auto text-center opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              {/* Icon Badge */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-4 animate-float">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent">
                삼성전자 DS AX 과제 아이디어 생성기
              </h1>
              
              {/* Subtitle */}
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                업무 프로세스에 적용할 AI Transformation 솔루션 아이디어를 생성해보세요
              </p>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Input Form - 5 columns (약 42%) */}
          <div 
            className="lg:col-span-5 opacity-0 animate-fade-in-left"
            style={{ animationDelay: "0.2s" }}
          >
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/50 sticky top-6">
              <div className="p-6 md:p-8">
                {/* Form Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100">정보 입력</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">AX 아이디어 생성을 위한 정보</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleLoadExample}
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 text-xs"
                      disabled={isLoading}
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      예시 불러오기
                    </Button>
                    <Button
                      onClick={handleResetInput}
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
                      disabled={isLoading || (!businessArea && !painPoints && !expectations)}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      초기화
                    </Button>
                  </div>
                </div>

                {/* 업무 정보 입력 */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                      업무 정보 입력
                    </h3>
                    
                    <div className="space-y-5">
                      {/* Business Area */}
                      <div className="space-y-2">
                        <label htmlFor="businessArea" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          업무 영역
                        </label>
                        <Input
                          id="businessArea"
                          placeholder="예: 생산계획, 품질관리, 설비점검, 물류 운영 등"
                          value={businessArea}
                          onChange={(e) => setBusinessArea(e.target.value)}
                          className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl h-11 transition-all duration-200"
                          disabled={isLoading}
                        />
                      </div>

                      {/* Pain Points */}
                      <div className="space-y-2">
                        <label htmlFor="painPoints" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          현행 업무 고충 및 한계점
                        </label>
                        <Textarea
                          id="painPoints"
                          placeholder="예: 데이터 수집 수작업, 시스템 간 연결 미흡, 재작업 발생 등"
                          value={painPoints}
                          onChange={(e) => setPainPoints(e.target.value)}
                          className="min-h-[100px] resize-none bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 leading-relaxed"
                          disabled={isLoading}
                        />
                      </div>

                      {/* Expectations */}
                      <div className="space-y-2">
                        <label htmlFor="expectations" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          AX 도입을 통한 기대 사항
                        </label>
                        <Textarea
                          id="expectations"
                          placeholder="예: 업무 효율화, 오류 감소, 자동화, 실시간 모니터링 등"
                          value={expectations}
                          onChange={(e) => setExpectations(e.target.value)}
                          className="min-h-[100px] resize-none bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 leading-relaxed"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 아이디어 생성 */}
                  <div className="pt-5 border-t border-blue-100 dark:border-blue-900/50">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                      아이디어 생성
                    </h3>
                    
                    <div>
                      <Button
                        onClick={handleGenerate}
                        disabled={isLoading || !businessArea.trim() || !painPoints.trim() || !expectations.trim()}
                        className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            아이디어 생성 중...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            아이디어 생성
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
                        AI가 3가지 유형의 AX 솔루션 아이디어를 생성합니다
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Results Section - 7 columns (약 58%) */}
          <div 
            className="lg:col-span-7 space-y-8 opacity-0 animate-fade-in-right"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Results Header */}
            {ideas.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100">생성된 아이디어</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ideas.length}개의 AX 솔루션 아이디어가 생성되었습니다</p>
                  </div>
                </div>
                <Button
                  onClick={handleResetIdeas}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  초기화
                </Button>
              </div>
            )}

            {/* Empty State */}
            {ideas.length === 0 && !isLoading && (
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border-dashed border-2 border-blue-200 dark:border-blue-800">
                <div className="p-10 md:p-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
                    <Lightbulb className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 mb-2">아이디어를 생성해보세요</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    왼쪽에 업무 영역과 고충점, 기대 사항을 입력하고<br />아이디어 생성 버튼을 클릭하세요
                  </p>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="p-10 md:p-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5 animate-pulse">
                    <Sparkles className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 mb-2">AI가 아이디어를 생성하고 있습니다</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">잠시만 기다려주세요...</p>
                </div>
              </Card>
            )}

            {/* Idea Cards - 더 넉넉한 간격 */}
            <div className="space-y-7">
              {ideas.map((idea, index) => {
                const colors = roleColors[idea.category];
                const IconComponent = colors.icon;
                
                return (
                  <Card
                    key={index}
                    ref={(el) => (cardRefs.current[index] = el)}
                    className={`rounded-2xl shadow-xl shadow-slate-900/5 overflow-hidden border ${colors.bg} ${colors.border} opacity-0 animate-fade-in-up`}
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                  >
                    {/* Card Content */}
                    <div className="p-6 md:p-7">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge className={`${colors.badge} mb-2 text-xs font-medium px-2.5 py-0.5`}>
                              {idea.category}
                            </Badge>
                            <h3 className={`text-lg md:text-xl font-bold ${colors.text} leading-tight`}>
                              {idea.solutionTitle}
                            </h3>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleExportCard(index)}
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-xs opacity-70 hover:opacity-100 transition-all hover:shadow-sm flex-shrink-0"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          PNG 다운로드
                        </Button>
                      </div>

                      {/* Content Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-5">
                          <div className="bg-white/50 dark:bg-slate-800/30 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2">업무 프로세스</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-[1.65]">{idea.process}</p>
                          </div>

                          <div className="bg-white/50 dark:bg-slate-800/30 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2">AX 솔루션 개요</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-[1.65]">{idea.solutionOverview}</p>
                          </div>

                          <div className="bg-white/50 dark:bg-slate-800/30 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2">사람의 역할</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-[1.65]">{idea.humanRole}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white/50 dark:bg-slate-800/30 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2">기대효과</h4>
                            <ul className="space-y-1.5">
                              {idea.expectedEffects.map((effect, i) => (
                                <li key={i} className="text-slate-600 dark:text-slate-300 text-sm flex items-start gap-2 leading-[1.65]">
                                  <span className={`w-1.5 h-1.5 rounded-full ${colors.badge} mt-2 flex-shrink-0`} />
                                  {effect}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-white/50 dark:bg-slate-800/30 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2.5">키워드</h4>
                            <div className="flex flex-wrap gap-2">
                              {idea.keywords.map((keyword, i) => (
                                <Badge key={i} className={`${colors.badgeLight} text-xs rounded-full px-3 py-1 font-normal`}>
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white/50 dark:bg-slate-800/30 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2.5">기술</h4>
                            <div className="flex flex-wrap gap-2">
                              {idea.technologies.map((tech, i) => (
                                <Badge key={i} variant="outline" className="text-xs rounded-full px-3 py-1 font-normal border-border/80">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Index;
