import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Trophy, User, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/candidate" },
  { icon: FileText, label: "My Exams", path: "/candidate/exams" },
  { icon: Trophy, label: "Results", path: "/candidate/results" },
  { icon: User, label: "Profile", path: "/candidate/profile" },
];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "candidate";
};

export type AuthContextType = {
  profile: AuthUser | null;
  token: string | null;
  login: (data: { token: string; user: AuthUser }) => void;
  logout: () => void;
};

interface CandidateLayoutProps {
  children: ReactNode;
}

export function CandidateLayout({ children }: CandidateLayoutProps) {
  const location = useLocation();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const { logout } = useAuth();
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");

    if (storedUser && storedToken) {
      setProfile(JSON.parse(storedUser));
      // setToken(storedToken);
    }
  }, []);
  return (
    <div className="min-h-screen animated-bg">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            <Logo size="md" />

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/candidate" &&
                    location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-primary text-primary-foreground shadow-md"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                  {profile?.name?.charAt(0) ?? "C"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {profile?.name ?? "Candidate"}
                  </p>
                  <p className="text-xs text-muted-foreground">Candidate</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
