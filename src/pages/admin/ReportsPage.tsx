import { useEffect, useState } from 'react';
import { Download, Filter, BarChart2, Users, FileText, TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/axios';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/* ================= TYPES ================= */

type Stats = {
  totalCandidates: number;
  examsCompleted: number;
  avgScore: number;
  passRate: number;
};

type ExamPerformance = {
  name: string;
  participants: number;
  avgScore: number;
};

type MonthlyTrend = {
  month: number;
  candidates: number;
  avgScore: number;
};

type GroupPerformance = {
  name: string;
  value: number;
  color: string;
};

type TopPerformer = {
  name: string;
  email: string;
  avgScore: number;
  examsCompleted: number;
};

type AnalyticsData = {
  stats: Stats;
  examPerformance: ExamPerformance[];
  monthlyTrend: MonthlyTrend[];
  groupPerformance: GroupPerformance[];
  topPerformers: TopPerformer[];
  candidateResults: CandidateResult[];
};

type CandidateResult = {
  candidateId: string;
  name: string;
  email: string;
  group: string;
  examName: string;
  percentage: number;
};

const monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ================= COMPONENT ================= */

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<'last7' | 'last30' | 'last90' | 'all'>('last30');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get<{ success: boolean; data: AnalyticsData }>(
          `/admin/result-analytics?range=${dateRange}`
        );
        setData(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <AdminLayout title="Reports & Analytics">
        <div className="flex justify-center items-center h-64">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const {
    stats,
    examPerformance,
    monthlyTrend,
    groupPerformance,
    topPerformers,
    candidateResults,
  } = data;

  const formattedMonthly = monthlyTrend.map(m => ({
    month: monthMap[m.month - 1],
    candidates: m.candidates,
    avgScore: m.avgScore,
  }));

  const sortedPerformers = [...topPerformers].sort(
    (a, b) => b.avgScore - a.avgScore
  );

  return (
    <AdminLayout title="Reports & Analytics" subtitle="Comprehensive insights into assessment performance">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={v => setDateRange(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="last90">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={<Users />} label="Total Candidates" value={stats.totalCandidates} />
        <Stat icon={<FileText />} label="Exams Completed" value={stats.examsCompleted} />
        <Stat icon={<BarChart2 />} label="Average Score" value={`${stats.avgScore}%`} />
        <Stat icon={<TrendingUp />} label="Pass Rate" value={`${stats.passRate}%`} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">

        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exams">By Exam</TabsTrigger>
          <TabsTrigger value="groups">By Group</TabsTrigger>
          <TabsTrigger value="candidates">Top Performers</TabsTrigger>
          <TabsTrigger value="candidates-results">Candidate Results</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <Card variant="glass">
            <CardHeader><CardTitle>Monthly Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedMonthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="candidates" stroke="#6366f1" strokeWidth={3} />
                  <Line dataKey="avgScore" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXAMS */}
        <TabsContent value="exams">
          <Card variant="glass">
            <CardHeader><CardTitle>Exam Performance</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={examPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GROUPS */}
        <TabsContent value="groups">
          <Card variant="glass">
            <CardHeader><CardTitle>Group Performance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={groupPerformance} dataKey="value" innerRadius={60} outerRadius={100}>
                    {groupPerformance.map((g, i) => (
                      <Cell key={i} fill={g.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                {groupPerformance.map(g => (
                  <div key={g.name} className="flex justify-between p-4 bg-muted/50 rounded-xl">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-lg font-bold">{g.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOP PERFORMERS */}
        <TabsContent value="candidates">
          <Card variant="glass">
            <CardHeader><CardTitle>Top Performers</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {sortedPerformers.map((p, i) => (
                <div key={p.email} className="flex justify-between p-4 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{p.avgScore}%</p>
                    <p className="text-sm">Exams: {p.examsCompleted}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidate Wise Result */}

        <TabsContent value="candidates-results" className="animate-fade-in">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Candidate-wise Results</CardTitle>
            </CardHeader>
            <CardContent>
              {candidateResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  No candidate results available
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 px-3">Candidate</th>
                        <th className="text-left py-2 px-3">Email</th>
                        <th className="text-left py-2 px-3">Group</th>
                        <th className="text-left py-2 px-3">Exam</th>
                        <th className="text-right py-2 px-3">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateResults.map((c) => (
                        <tr
                          key={`${c.candidateId}-${c.examName}`}
                          className="border-b hover:bg-muted/30 transition"
                        >
                          <td className="py-2 px-3 font-medium">{c.name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{c.email}</td>
                          <td className="py-2 px-3">{c.group}</td>
                          <td className="py-2 px-3">{c.examName}</td>
                          <td className="py-2 px-3 text-right font-bold text-success">
                            {c.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </AdminLayout>
  );
}

/* ================= STAT CARD ================= */

function Stat({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string | number;
}) {
  return (
    <Card variant="glass" className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
