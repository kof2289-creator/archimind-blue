import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Download, Rocket, Brain, Lightbulb, Bot, RotateCcw } from "lucide-react";
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
    bg: "bg-success/10",
    border: "border-success/30",
    badge: "bg-success text-success-foreground",
    text: "text-success",
    icon: Bot,
  },
  Advisor: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    badge: "bg-primary text-primary-foreground",
    text: "text-primary",
    icon: Brain,
  },
  Agent: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    badge: "bg-warning text-warning-foreground",
    text: "text-warning",
    icon: Lightbulb,
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
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="relative overflow-hidden bg-gradient-header">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.08)_0%,transparent_50%)]" />
        
        <div className="container mx-auto px-4 py-10 md:py-14 relative">
          <div 
            className="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Icon Badge */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-button shadow-button mb-6 animate-float">
              <Rocket className="w-8 h-8 text-primary-foreground" />
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              삼성전자 DS AX 과제 아이디어 생성기
            </h1>
            
            {/* Subtitle */}
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              업무 프로세스에 적용할 AI Transformation 솔루션 아이디어를 생성해보세요
            </p>
          </div>
        </div>
        
        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left: Input Form */}
          <div 
            className="lg:col-span-2 opacity-0 animate-fade-in-left"
            style={{ animationDelay: "0.2s" }}
          >
            <Card className="glass-strong shadow-card rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8 space-y-6">
                {/* Form Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-button flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">정보 입력</h2>
                      <p className="text-sm text-muted-foreground">아이디어 생성을 위한 정보를 입력하세요</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleResetInput}
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-muted-foreground hover:text-foreground"
                    disabled={isLoading || (!businessArea && !painPoints && !expectations)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    초기화
                  </Button>
                </div>

                {/* Business Area */}
                <div className="space-y-2">
                  <label htmlFor="businessArea" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    업무 영역
                  </label>
                  <Input
                    id="businessArea"
                    placeholder="예: QA, 생산계획, MPS 등"
                    value={businessArea}
                    onChange={(e) => setBusinessArea(e.target.value)}
                    className="bg-input/50 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl h-12 transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>

                {/* Pain Points */}
                <div className="space-y-2">
                  <label htmlFor="painPoints" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    현행 업무 고충 및 한계점
                  </label>
                  <Textarea
                    id="painPoints"
                    placeholder="예: 장비마다 공급사(SEMI eq.)가 달라 인터페이스가 표준화되어 있지 않음"
                    value={painPoints}
                    onChange={(e) => setPainPoints(e.target.value)}
                    className="min-h-[120px] resize-none bg-input/50 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>

                {/* Expectations */}
                <div className="space-y-2">
                  <label htmlFor="expectations" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    AX 도입을 통한 기대 사항
                  </label>
                  <Textarea
                    id="expectations"
                    placeholder="예: 업무 자동화 필요"
                    value={expectations}
                    onChange={(e) => setExpectations(e.target.value)}
                    className="min-h-[120px] resize-none bg-input/50 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !businessArea.trim() || !painPoints.trim() || !expectations.trim()}
                  className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-button hover:shadow-button hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
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
              </div>
            </Card>
          </div>

          {/* Right: Results Section */}
          <div 
            className="lg:col-span-3 space-y-6 opacity-0 animate-fade-in-right"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Results Header */}
            {ideas.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">생성된 아이디어</h2>
                    <p className="text-sm text-muted-foreground">{ideas.length}개의 AX 솔루션 아이디어</p>
                  </div>
                </div>
                <Button
                  onClick={handleResetIdeas}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  초기화
                </Button>
              </div>
            )}

            {/* Empty State */}
            {ideas.length === 0 && !isLoading && (
              <Card className="glass rounded-2xl border-dashed border-2 border-border/50">
                <div className="p-12 md:p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                    <Lightbulb className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">아이디어를 생성해보세요</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    왼쪽에 업무 영역과 고충점, 기대 사항을 입력하고 아이디어를 생성해보세요
                  </p>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <Card className="glass rounded-2xl">
                <div className="p-12 md:p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">AI가 아이디어를 생성하고 있습니다</h3>
                  <p className="text-muted-foreground">잠시만 기다려주세요...</p>
                </div>
              </Card>
            )}

            {/* Idea Cards */}
            <div className="space-y-5">
              {ideas.map((idea, index) => {
                const colors = roleColors[idea.category];
                const IconComponent = colors.icon;
                
                return (
                  <Card
                    key={index}
                    ref={(el) => (cardRefs.current[index] = el)}
                    className={`rounded-2xl shadow-card overflow-hidden border-2 ${colors.bg} ${colors.border} opacity-0 animate-fade-in-up`}
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                  >
                    {/* Card Header */}
                    <div className="p-6 md:p-8 relative">
                      <Button
                        onClick={() => handleExportCard(index)}
                        size="sm"
                        variant="outline"
                        className="absolute top-4 right-4 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PNG
                      </Button>

                      <div className="space-y-5">
                        {/* Title & Badge */}
                        <div className="flex items-start gap-4 pr-20">
                          <div className={`w-12 h-12 rounded-xl ${colors.badge} flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge className={`${colors.badge} mb-2`}>{idea.category}</Badge>
                            <h3 className={`text-xl md:text-2xl font-bold ${colors.text}`}>{idea.solutionTitle}</h3>
                          </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-foreground text-sm mb-1.5">업무 프로세스</h4>
                              <p className="text-foreground/80 text-sm leading-relaxed">{idea.process}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground text-sm mb-1.5">AX 솔루션 개요</h4>
                              <p className="text-foreground/80 text-sm leading-relaxed">{idea.solutionOverview}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground text-sm mb-1.5">사람의 역할</h4>
                              <p className="text-foreground/80 text-sm leading-relaxed">{idea.humanRole}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-foreground text-sm mb-1.5">기대효과</h4>
                              <ul className="space-y-1">
                                {idea.expectedEffects.map((effect, i) => (
                                  <li key={i} className="text-foreground/80 text-sm flex items-start gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${colors.badge} mt-1.5 flex-shrink-0`} />
                                    {effect}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground text-sm mb-2">키워드</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {idea.keywords.map((keyword, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs rounded-full px-2.5 py-0.5">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground text-sm mb-2">기술</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {idea.technologies.map((tech, i) => (
                                  <Badge key={i} variant="outline" className="text-xs rounded-full px-2.5 py-0.5">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
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
  );
};

export default Index;