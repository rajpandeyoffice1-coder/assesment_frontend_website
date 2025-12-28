import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, Trophy, TrendingUp } from "lucide-react";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExamCard } from "@/components/dashboard/ExamCard";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCandidateAssignments,
  CandidateExam,
} from "@/api/candidateAssignments";

import {
  fetchCandidateProfile
} from "@/api/candidate";

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

export type CandidateProfile = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  group?: {
    _id: string;
    name: string;
  };
  createdAt: string;
};

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  const navigate = useNavigate();

  const [exams, setExams] = useState<CandidateExam[]>([]);

  useEffect(() => {
    fetchCandidateAssignments().then(setExams);

    fetchCandidateProfile().then((data) => {
      localStorage.removeItem("candidate_profile");
      localStorage.setItem("candidate_profile", JSON.stringify(data));
      setProfile(data);
    });

  }, []);

  const assigned = exams.length;
  const completed = exams.filter((e) => e.status === "completed").length;
  const inProgress = exams.filter((e) => e.status === "in_progress").length;

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");

    if (storedUser && storedToken) {
      setProfile(JSON.parse(storedUser));
      // setToken(storedToken);
    }
  }, []);
  const avgScore =
    exams.filter((e) => e.score !== null).length > 0
      ? Math.round(
        exams
          .filter((e) => e.score !== null)
          .reduce((a, b) => a + (b.score ?? 0), 0) /
        exams.filter((e) => e.score !== null).length
      )
      : 0;

  const recentResults = exams
    .filter((e) => e.status === "completed")
    .slice(0, 3);

  return (
    <CandidateLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Welcome back, {profile?.name?.split(" ")[0] || "Candidate"} 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your assessment overview and upcoming exams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Assigned Exams" value={assigned} icon={FileText} gradient="purple" />
        <StatCard title="Completed" value={completed} icon={Trophy} gradient="green" />
        <StatCard title="In Progress" value={inProgress} icon={Clock} gradient="orange" />
        <StatCard title="Average Score" value={`${avgScore}%`} icon={TrendingUp} gradient="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold mb-4">Your Exams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <ExamCard
                key={exam.assignment_id}
                title={exam.title}
                type={exam.type}
                duration={exam.duration}
                questions={exam.questions}
                status={
                  exam.status === "pending"
                    ? "not_started"
                    : exam.status
                }
                score={exam.score ?? undefined}
                onStart={() =>
                  navigate(`/candidate/exam/${exam.assignment_id}/instructions`)
                }
                onResume={() =>
                  navigate(`/candidate/exam/${exam.assignment_id}/instructions`)
                }
                onViewResult={() =>
                  navigate(`/candidate/results/${profile?._id}/${exam.exam_id}`)
                }
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold mb-4">Recent Results</h2>
          <Card variant="glass">
            <CardContent className="p-0">
              {recentResults.map((r) => (
                <div key={r.assignment_id} className="p-4 border-b">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{r.title}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">
                        {r.score}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </CandidateLayout>
  );
}
