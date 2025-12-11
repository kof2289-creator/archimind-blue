import { NavLink } from "@/components/NavLink";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TopNavigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="absolute top-4 right-4 z-20 flex items-center gap-2">
      <div className="flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full p-1 border border-blue-100 dark:border-blue-900/50 shadow-lg shadow-blue-900/5">
        <NavLink
          to="/"
          end
          className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          activeClassName="bg-blue-500 text-white shadow-md hover:text-white dark:hover:text-white"
        >
          아이디어 생성기
        </NavLink>
        <NavLink
          to="/scenario"
          end
          className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          activeClassName="bg-blue-500 text-white shadow-md hover:text-white dark:hover:text-white"
        >
          시나리오 생성기
        </NavLink>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/admin")}
        className="ml-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-blue-100 dark:border-blue-900/50 shadow-lg shadow-blue-900/5 text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-slate-800"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </nav>
  );
};

export default TopNavigation;
