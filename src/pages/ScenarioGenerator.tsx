import TopNavigation from "@/components/TopNavigation";
import { Card } from "@/components/ui/card";
import { FileText, Rocket } from "lucide-react";

const ScenarioGenerator = () => {
  return (
    <div className="min-h-screen relative">
      {/* Unified Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-sky-50/50 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(210_100%_50%/0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(200_90%_50%/0.06)_0%,transparent_50%)]" />
      
      {/* Navigation */}
      <TopNavigation />

      {/* Content */}
      <div className="relative z-10">
        {/* Header Section */}
        <header className="relative">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
              {/* Icon Badge */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-4 animate-float">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent">
                AX 시나리오 생성기
              </h1>
              
              {/* Subtitle */}
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                AX 도입 시나리오와 로드맵을 생성해보세요
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/50">
            <div className="p-10 md:p-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
                <FileText className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 mb-2">
                시나리오 생성기 준비 중
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                AX 도입 시나리오 생성 기능이 곧 추가될 예정입니다.<br />
                지금은 아이디어 생성기를 이용해주세요.
              </p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ScenarioGenerator;
