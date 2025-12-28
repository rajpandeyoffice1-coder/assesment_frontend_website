import { Users, UsersRound, FileText, Play, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const participationData = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 38 },
  { name: 'Thu', value: 65 },
  { name: 'Fri', value: 48 },
  { name: 'Sat', value: 30 },
  { name: 'Sun', value: 25 },
];

const scoreDistribution = [
  { range: '0-20', count: 5 },
  { range: '21-40', count: 15 },
  { range: '41-60', count: 35 },
  { range: '61-80', count: 55 },
  { range: '81-100', count: 40 },
];

const completionData = [
  { name: 'Completed', value: 68, color: 'hsl(142, 76%, 42%)' },
  { name: 'In Progress', value: 22, color: 'hsl(38, 92%, 55%)' },
  { name: 'Not Started', value: 10, color: 'hsl(230, 20%, 80%)' },
];

const recentCandidates = [
  { name: 'Sarah Johnson', email: 'sarah@example.com', exam: 'Aptitude Test A', status: 'completed', score: 85 },
  { name: 'Michael Chen', email: 'michael@example.com', exam: 'Behavioral Assessment', status: 'in_progress', score: null },
  { name: 'Emily Davis', email: 'emily@example.com', exam: 'Intelligence Test', status: 'completed', score: 92 },
  { name: 'James Wilson', email: 'james@example.com', exam: 'Knowledge Test B', status: 'not_started', score: null },
  { name: 'Lisa Anderson', email: 'lisa@example.com', exam: 'Aptitude Test B', status: 'completed', score: 78 },
];

const statusBadge = {
  completed: 'bg-success/20 text-success',
  in_progress: 'bg-warning/20 text-warning',
  not_started: 'bg-muted text-muted-foreground',
};

export default function AdminDashboard() {
  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Welcome back! Here's what's happening with your assessments."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Candidates"
          value="2,847"
          subtitle="Active users"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          gradient="blue"
        />
        <StatCard
          title="Total Groups"
          value="48"
          subtitle="Organized teams"
          icon={UsersRound}
          gradient="purple"
        />
        <StatCard
          title="Total Exams"
          value="156"
          subtitle="All exam types"
          icon={FileText}
          gradient="green"
        />
        <StatCard
          title="Active Exams"
          value="23"
          subtitle="Currently running"
          icon={Play}
          gradient="orange"
        />
        <StatCard
          title="Completed"
          value="1,892"
          subtitle="This month"
          icon={CheckCircle2}
          trend={{ value: 8, isPositive: true }}
          gradient="pink"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Participation Trend */}
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Participation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={participationData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(245, 82%, 60%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(245, 82%, 60%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 90%)" />
                <XAxis dataKey="name" stroke="hsl(230, 15%, 45%)" fontSize={12} />
                <YAxis stroke="hsl(230, 15%, 45%)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(230, 20%, 90%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(245, 82%, 60%)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Ratio */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Completion Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {completionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 90%)" />
                <XAxis dataKey="range" stroke="hsl(230, 15%, 45%)" fontSize={12} />
                <YAxis stroke="hsl(230, 15%, 45%)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(230, 20%, 90%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(162, 72%, 45%)" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCandidates.map((candidate, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.exam}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {candidate.score !== null && (
                      <span className="text-sm font-semibold text-success">{candidate.score}%</span>
                    )}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge[candidate.status as keyof typeof statusBadge]}`}>
                      {candidate.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
