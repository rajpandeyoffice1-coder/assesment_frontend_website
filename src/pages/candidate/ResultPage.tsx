import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Trophy, Download, Home } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import api from "@/lib/axios";

import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/* ===================== TYPES ===================== */

type ExamType = "behavioral" | "intelligence" | "aptitude" | "knowledge";

type ExamInfo = {
  _id: string;
  title: string;
  type: ExamType;
  totalQuestions: number;
};

type TraitWise = {
  trait: string;
  score: number;
};

type SectionWise = {
  section: string;
  score: number;
};

type ResultItem = {
  examType: ExamType;
  examId: ExamInfo;
  overallScore: number;
  maxScore: number;
  percentage: number;
  traitWise: TraitWise[];
  sectionWise: SectionWise[];
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  data: ResultItem[];
};

/* ===================== COMPONENT ===================== */

export default function ResultPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Record<ExamType, ResultItem | null>>({
    behavioral: null,
    intelligence: null,
    aptitude: null,
    knowledge: null,
  });

  useEffect(() => {
    const auth = localStorage.getItem("auth_user");
    const candidateId = auth ? JSON.parse(auth).id : "";
    if (!candidateId) return;

    api
      .get<ApiResponse>(`/candidate/results/${candidateId}`)
      .then(res => {
        const map: Record<ExamType, ResultItem | null> = {
          behavioral: null,
          intelligence: null,
          aptitude: null,
          knowledge: null,
        };
        console.log();
        res.data.data.forEach(r => {
          const current = map[r.examType];
          if (!current || new Date(r.createdAt) > new Date(current.createdAt)) {
            map[r.examType] = r;
          }
        });

        setData(map);
      });
  }, []);

  const allResults = useMemo(
    () => Object.values(data).filter(Boolean) as ResultItem[],
    [data]
  );

  const overall = useMemo(() => {
    if (!allResults.length) return null;

    const totalScore = allResults.reduce((s, r) => s + r.overallScore, 0);
    const maxScore = allResults.reduce((s, r) => s + r.maxScore, 0);
    const totalQuestions = allResults.reduce(
      (s, r) => s + r.examId.totalQuestions,
      0
    );

    return {
      percentage: Math.round((totalScore / maxScore) * 100),
      correct: totalScore,
      incorrect: Math.max(totalQuestions - totalScore, 0),
      skipped: 0,
      totalQuestions,
      exams: allResults.length,
    };
  }, [allResults]);

  const breakdown = useMemo(
    () =>
      overall
        ? [
          { name: "Correct", value: overall.correct, color: "#22c55e" },
          { name: "Incorrect", value: overall.incorrect, color: "#ef4444" },
          { name: "Skipped", value: overall.skipped, color: "#cbd5e1" },
        ]
        : [],
    [overall]
  );

  if (!overall) return null;

  return (
    <CandidateLayout>
      <div className="max-w-6xl mx-auto">
        <Card variant="stat" className="bg-gradient-primary mb-8 p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Your MECAT Report
              </h1>
              <p className="text-white/80">
                Overall performance across all assessments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mt-6">
            <div>
              <p className="text-white/60 text-sm">Overall Score</p>
              <p className="text-3xl font-bold text-white">
                {overall.percentage}%
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Accuracy</p>
              <p className="text-3xl font-bold text-white">
                {Math.round((overall.correct / overall.totalQuestions) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Exams Completed</p>
              <p className="text-3xl font-bold text-white">
                {overall.exams}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Correct Answers</p>
              <p className="text-3xl font-bold text-white">
                {overall.correct}
              </p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="overall" className="space-y-8">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="behavioral">Core Behaviour</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence Orientation</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
            <TabsTrigger value="knowledge">Industrial Knowledge</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold">{overall.percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">
                    {Math.round((overall.correct / overall.totalQuestions) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exams</p>
                  <p className="text-2xl font-bold">{overall.exams}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-2xl font-bold">{overall.correct}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Answer Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={90}
                    >
                      {breakdown.map((b, i) => (
                        <Cell key={i} fill={b.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavioral" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Core Behaviour</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={data.behavioral?.traitWise || []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="trait" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      dataKey="score"
                      fill="#22c55e"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-6">
              <Card><CardContent>Understanding Yourself</CardContent></Card>
              <Card><CardContent>Interpersonal Relationships</CardContent></Card>
              <Card><CardContent>How Others Perceive You</CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Intelligence Orientation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <RadarChart data={data.intelligence?.traitWise || []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="trait" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      dataKey="score"
                      fill="#ef4444"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aptitude" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Aptitude Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data.aptitude?.sectionWise || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="section" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Industrial Knowledge</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={data.knowledge?.sectionWise || []}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="section" type="category" />
                    <Tooltip />
                    <Bar dataKey="score" fill="#fb7185" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center gap-4 mt-10">
          <Button variant="outline" onClick={() => navigate("/candidate")}>
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>
    </CandidateLayout>
  );

}
