import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  Layers,
  ListChecks,
  Brain,
  SlidersHorizontal,
  Upload,
  Sigma,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ================= NAV DATA ================= */

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: UsersRound, label: "Groups", path: "/admin/groups" },
  { icon: Users, label: "Candidates", path: "/admin/candidates" },
];

const mainNavTwo = [
  { icon: FileText, label: "Exams", path: "/admin/exams" },
  { icon: ClipboardList, label: "Assignments", path: "/admin/assignments" },
  { icon: BarChart3, label: "Reports", path: "/admin/reports" },
];

const questionNav = [
  { icon: Layers, label: "Question Banks", path: "/admin/question-banks" },
  // { icon: ListChecks, label: "Bank Questions", path: "/admin/question-banks/1/questions" },
  { icon: Brain, label: "Behavioral Questions", path: "/admin/questions/behavioral" },
  { icon: ListChecks, label: "MCQ Questions", path: "/admin/questions/mcq" },
  { icon: Brain, label: "Traits", path: "/admin/traits" },
  { icon: Layers, label: "Sections", path: "/admin/sections" },
  { icon: SlidersHorizontal, label: "Likert Scales", path: "/admin/scales" },
  { icon: Upload, label: "Bulk Upload", path: "/admin/questions/bulk-upload" },
  { icon: Sigma, label: "Scoring Analytics", path: "/admin/questions/analytics" },
];

const bottomNav = [
  { icon: Settings, label: "Settings", path: "/admin/settings" },
  { icon: HelpCircle, label: "Help", path: "/admin/help" },
];

/* ================= COMPONENT ================= */

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [openQuestions, setOpenQuestions] = useState(false);

  useEffect(() => {
    if (
      location.pathname.includes("/admin/question") ||
      location.pathname.includes("/admin/traits") ||
      location.pathname.includes("/admin/sections") ||
      location.pathname.includes("/admin/scales")
    ) {
      setOpenQuestions(true);
    }
  }, [location.pathname]);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/admin" && location.pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border"
    >
      <div className="flex h-full flex-col">
        {/* LOGO */}
        <div className="flex h-20 items-center px-6 border-b border-sidebar-border">
          <Logo size="md" />
        </div>

        {/* SCROLLABLE NAV (INLINE SCROLLBAR HIDE) */}
        <nav
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
          style={{
            scrollbarWidth: "none",        // Firefox
            msOverflowStyle: "none",       // IE
          }}
        >
          {/* Chrome / Edge */}
          <style>
            {`
              nav::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          {/* MAIN NAV */}
          {mainNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                isActive(item.path)
                  ? "bg-gradient-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {/* QUESTIONS DROPDOWN */}
          <button
            onClick={() => setOpenQuestions(!openQuestions)}
            className={cn(
              "w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              openQuestions
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <span className="flex items-center gap-3">
              <Layers className="h-5 w-5" />
              Questions
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                openQuestions && "rotate-180"
              )}
            />
          </button>

          {openQuestions && (
            <div className="ml-6 mt-1 space-y-1">
              {questionNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all",
                    isActive(item.path)
                      ? "bg-gradient-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}


          {mainNavTwo.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                isActive(item.path)
                  ? "bg-gradient-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {/* SETTINGS / HELP (NOT FIXED) */}
          <div className="pt-6 space-y-1">
            {bottomNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-4 py-2.5 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </nav>

        {/* USER INFO (SCROLLS WITH CONTENT, NOT FIXED) */}
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
