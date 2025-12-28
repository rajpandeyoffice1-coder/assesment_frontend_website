import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar, Clock, ArrowRight } from "lucide-react";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";

const typeColors: Record<string, string> = {
  behavioral: "bg-accent/20 text-accent",
  aptitude: "bg-primary/20 text-primary",
  knowledge: "bg-secondary/20 text-secondary",
  intelligence: "bg-info/20 text-info",
};

type Result = {
  assignment_id: string;
  exam_id: string;
  title: string;
  type: string;
  duration: number;
  questions: number;
  status: string;
  score: number;
};

type AssignmentsResponse = {
  success: boolean;
  data: Result[];
};

export default function CandidateResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    api.get<AssignmentsResponse>("/candidate/assignments").then(res => {
      setResults(res.data.data.filter(r => r.status === "completed"));
    });
  }, []);

  const stats = useMemo(() => {
    if (!results.length) return { avg: 0, best: 0 };
    return {
      avg: Math.round(results.reduce((a, b) => a + b.score, 0) / results.length),
      best: Math.round(Math.max(...results.map(r => r.score)))
    };
  }, [results]);

  return (
    <CandidateLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">My Results</h1>
        <p className="text-muted-foreground mt-2">
          View your assessment results and performance analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card variant="stat" className="bg-gradient-stat-green p-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-white">{stats.avg}%</p>
            </div>
          </div>
        </Card>

        <Card variant="stat" className="bg-gradient-stat-purple p-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Best Score</p>
              <p className="text-3xl font-bold text-white">{stats.best}%</p>
            </div>
          </div>
        </Card>

        <Card variant="stat" className="bg-gradient-stat-blue p-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Exams Completed</p>
              <p className="text-3xl font-bold text-white">{results.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {results.map(r => (
          <Card key={r.assignment_id} variant="glass" className="p-6 hover-lift">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div>
                <Badge className={typeColors[r.type]}>
                  {r.type.toUpperCase()}
                </Badge>

                <h3 className="text-xl font-bold mt-2">{r.title}</h3>

                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Completed
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {r.duration} mins
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold text-success">
                    {Math.round(r.score)}%
                  </p>
                </div>

                <Button onClick={() => navigate(`/candidate/results/${r.exam_id}`)}>
                  View Details <ArrowRight className="ml-2" size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </CandidateLayout>
  );
}
