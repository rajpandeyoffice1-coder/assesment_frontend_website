import { useState } from 'react';
import { Download, Filter, BarChart2, Users, FileText, TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const examPerformance = [
  { name: 'Aptitude Test A', avgScore: 72, participants: 234 },
  { name: 'Behavioral', avgScore: 78, participants: 189 },
  { name: 'Knowledge Test', avgScore: 65, participants: 156 },
  { name: 'Intelligence', avgScore: 82, participants: 98 },
];

const monthlyTrend = [
  { month: 'Jan', candidates: 120, exams: 45, avgScore: 72 },
  { month: 'Feb', candidates: 145, exams: 52, avgScore: 75 },
  { month: 'Mar', candidates: 168, exams: 58, avgScore: 78 },
  { month: 'Apr', candidates: 190, exams: 65, avgScore: 76 },
  { month: 'May', candidates: 210, exams: 72, avgScore: 80 },
  { month: 'Jun', candidates: 245, exams: 85, avgScore: 82 },
];

const groupPerformance = [
  { name: 'Engineering Batch', value: 82, color: '#6366f1' },
  { name: 'Management Trainees', value: 78, color: '#10b981' },
  { name: 'Sales Team', value: 75, color: '#f59e0b' },
  { name: 'Customer Support', value: 72, color: '#ec4899' },
];

const topPerformers = [
  { name: 'Sarah Johnson', email: 'sarah@example.com', avgScore: 94, examsCompleted: 5 },
  { name: 'Michael Chen', email: 'michael@example.com', avgScore: 92, examsCompleted: 4 },
  { name: 'Emily Davis', email: 'emily@example.com', avgScore: 89, examsCompleted: 6 },
  { name: 'James Wilson', email: 'james@example.com', avgScore: 87, examsCompleted: 4 },
  { name: 'Lisa Anderson', email: 'lisa@example.com', avgScore: 85, examsCompleted: 5 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('last30');

  return (
    <AdminLayout 
      title="Reports & Analytics" 
      subtitle="Comprehensive insights into assessment performance"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select range" />
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
              <p className="text-2xl font-bold text-foreground">2,847</p>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exams Completed</p>
              <p className="text-2xl font-bold text-foreground">1,892</p>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-foreground">76%</p>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pass Rate</p>
              <p className="text-2xl font-bold text-foreground">84%</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exams">By Exam</TabsTrigger>
          <TabsTrigger value="groups">By Group</TabsTrigger>
          <TabsTrigger value="candidates">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 90%)" />
                  <XAxis dataKey="month" stroke="hsl(230, 15%, 45%)" fontSize={12} />
                  <YAxis stroke="hsl(230, 15%, 45%)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)', 
                      border: '1px solid hsl(230, 20%, 90%)',
                      borderRadius: '12px',
                    }} 
                  />
                  <Line type="monotone" dataKey="candidates" stroke="hsl(245, 82%, 60%)" strokeWidth={3} dot={{ fill: 'hsl(245, 82%, 60%)' }} />
                  <Line type="monotone" dataKey="avgScore" stroke="hsl(162, 72%, 45%)" strokeWidth={3} dot={{ fill: 'hsl(162, 72%, 45%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="animate-fade-in">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Exam Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={examPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 90%)" />
                  <XAxis dataKey="name" stroke="hsl(230, 15%, 45%)" fontSize={12} />
                  <YAxis stroke="hsl(230, 15%, 45%)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="hsl(245, 82%, 60%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="animate-fade-in">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Group Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={groupPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {groupPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {groupPerformance.map((group) => (
                    <div key={group.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }} />
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <span className="text-lg font-bold">{group.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="animate-fade-in">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.email} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-gradient-stat-orange' : 
                        index === 1 ? 'bg-gradient-stat-purple' : 
                        index === 2 ? 'bg-gradient-stat-green' : 
                        'bg-gradient-stat-blue'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{performer.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Avg Score</p>
                        <p className="font-bold text-success">{performer.avgScore}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Exams</p>
                        <p className="font-bold text-foreground">{performer.examsCompleted}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
