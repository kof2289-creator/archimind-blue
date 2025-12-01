import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface AXIdea {
  title: string;
  role: "Assistant" | "Advisor" | "Agent";
  description: string;
  userRole: string;
  expectedEffect: string;
  effectDetails: string[];
  keywords: string[];
  technologies: string[];
}

const roleColors = {
  Assistant: {
    bg: "bg-success/10",
    border: "border-success",
    badge: "bg-success text-success-foreground",
    text: "text-success",
  },
  Advisor: {
    bg: "bg-primary/10",
    border: "border-primary",
    badge: "bg-primary text-primary-foreground",
    text: "text-primary",
  },
  Agent: {
    bg: "bg-warning/10",
    border: "border-warning",
    badge: "bg-warning text-warning-foreground",
    text: "text-warning",
  },
};

const Index = () => {
  const [businessArea, setBusinessArea] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [expectations, setExpectations] = useState("");
  const [ideas, setIdeas] = useState<AXIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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
      link.download = `ax-idea-${ideas[index].role}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success("카드를 PNG로 저장했습니다");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("카드 저장 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow mb-3">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            삼성전자 DS AX 과제 아이디어 생성기
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            업무 프로세스에 적용할 AI Transformation 솔루션 아이디어를 생성해보세요
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input Section */}
          <Card className="p-6 md:p-8 shadow-soft border-border/50 backdrop-blur-sm bg-card/80 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="space-y-6">
              {/* Business Area */}
              <div className="space-y-2">
                <label htmlFor="businessArea" className="text-sm font-medium text-foreground">
                  업무 영역
                </label>
                <Input
                  id="businessArea"
                  placeholder="예: QA, 생산관리, 물류 등"
                  value={businessArea}
                  onChange={(e) => setBusinessArea(e.target.value)}
                  className="bg-background/50 border-border focus:border-primary transition-smooth"
                  disabled={isLoading}
                />
              </div>

              {/* Pain Points */}
              <div className="space-y-2">
                <label htmlFor="painPoints" className="text-sm font-medium text-foreground">
                  현행 업무 고충 및 한계점
                </label>
                <Textarea
                  id="painPoints"
                  placeholder="예: 시스템 자동화가 안되어 있고 수기로 작성하는 프로세스의 많음"
                  value={painPoints}
                  onChange={(e) => setPainPoints(e.target.value)}
                  className="min-h-[120px] resize-none bg-background/50 border-border focus:border-primary transition-smooth"
                  disabled={isLoading}
                />
              </div>

              {/* Expectations */}
              <div className="space-y-2">
                <label htmlFor="expectations" className="text-sm font-medium text-foreground">
                  AX 도입을 통한 기대 사항
                </label>
                <Textarea
                  id="expectations"
                  placeholder="예: 업무 자동화 필요"
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  className="min-h-[120px] resize-none bg-background/50 border-border focus:border-primary transition-smooth"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !businessArea.trim() || !painPoints.trim() || !expectations.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-smooth shadow-soft"
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

          {/* Right: Results Section */}
          <div className="space-y-6">
            {ideas.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">생성된 아이디어 카드</h2>
              </div>
            )}

            {ideas.length === 0 && !isLoading && (
              <Card className="p-12 text-center border-dashed border-2 border-border/50 bg-card/50 animate-in fade-in duration-700">
                <p className="text-muted-foreground">왼쪽에 정보를 입력하고 아이디어를 생성해보세요</p>
              </Card>
            )}

            <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-700">
              {ideas.map((idea, index) => (
                <Card
                  key={index}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className={`p-6 md:p-8 shadow-soft backdrop-blur-sm border-2 ${roleColors[idea.role].bg} ${roleColors[idea.role].border} transition-smooth relative`}
                >
                  <Button
                    onClick={() => handleExportCard(index)}
                    size="sm"
                    variant="outline"
                    className="absolute top-4 right-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PNG 저장
                  </Button>

                  <div className="space-y-4 mt-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold mb-2 ${roleColors[idea.role].text}`}>{idea.title}</h3>
                        <Badge className={roleColors[idea.role].badge}>{idea.role}</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">AX 솔루션 아이디어 개요</h4>
                      <p className="text-foreground/80 text-sm">{idea.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">사람의 역할</h4>
                      <p className="text-foreground/80 text-sm">{idea.userRole}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">기대효과</h4>
                      <p className="text-foreground/80 text-sm mb-2">{idea.expectedEffect}</p>
                      <ul className="list-disc list-inside space-y-1">
                        {idea.effectDetails.map((detail, i) => (
                          <li key={i} className="text-foreground/70 text-sm">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">키워드</h4>
                      <div className="flex flex-wrap gap-2">
                        {idea.keywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">기술</h4>
                      <div className="flex flex-wrap gap-2">
                        {idea.technologies.map((tech, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
