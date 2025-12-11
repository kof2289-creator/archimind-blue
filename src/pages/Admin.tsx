import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Database, Users, Activity, Shield } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: "시스템 설정",
      description: "AI 모델 및 시스템 설정을 관리합니다",
      icon: Settings,
      color: "blue",
    },
    {
      title: "데이터 관리",
      description: "생성된 아이디어 및 사용 이력을 조회합니다",
      icon: Database,
      color: "emerald",
    },
    {
      title: "사용자 관리",
      description: "사용자 접근 권한을 관리합니다",
      icon: Users,
      color: "violet",
    },
    {
      title: "사용 통계",
      description: "서비스 사용 현황 및 통계를 확인합니다",
      icon: Activity,
      color: "amber",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        icon: "text-blue-500",
        border: "border-blue-200 dark:border-blue-800",
      },
      emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        icon: "text-emerald-500",
        border: "border-emerald-200 dark:border-emerald-800",
      },
      violet: {
        bg: "bg-violet-50 dark:bg-violet-950/30",
        icon: "text-violet-500",
        border: "border-violet-200 dark:border-violet-800",
      },
      amber: {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        icon: "text-amber-500",
        border: "border-amber-200 dark:border-amber-800",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen relative">
      {/* Unified Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      Admin
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      시스템 관리 페이지
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminCards.map((card, index) => {
              const colors = getColorClasses(card.color);
              const IconComponent = card.icon;
              
              return (
                <Card
                  key={index}
                  className={`${colors.bg} ${colors.border} border rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}>
                      <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Placeholder Notice */}
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              관리 기능은 현재 개발 중입니다. 곧 업데이트될 예정입니다.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
