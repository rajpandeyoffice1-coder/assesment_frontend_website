import { useEffect, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Clock, FileText, Edit, Trash2, Copy, Play, Pause, Eye } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/modals/Modal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { fetchExams, updateExam, deleteExam } from '@/api/exams';
import api from '@/lib/axios';

export type Exams = {
  _id: string;
  title: string;
  code: string;
  description?: string;
  type: "behavioral" | "aptitude" | "knowledge" | "intelligence";
  status: "draft" | "published" | "active" | "completed";
  duration: number;
  totalQuestions: number;
  themeColor: string;
  attempts: number;
  questionBanks?: ExamQuestionBank[];
  settings: {
    shuffleQuestions: boolean;
    negativeMarking: boolean;
    allowSkip: boolean;
    autoSubmit: boolean;
  };
};

type ExamQuestionResponse = {
  examId: string;
  title: string;
  code: string;
  type: "behavioral" | "aptitude" | "knowledge" | "intelligence";
  duration: number;
  totalQuestions: number;
  questions: ExamQuestion[];
};

const typeColors = {
  behavioral: { bg: 'bg-accent/20', text: 'text-accent', label: 'Behavioral' },
  aptitude: { bg: 'bg-primary/20', text: 'text-primary', label: 'Aptitude' },
  knowledge: { bg: 'bg-secondary/20', text: 'text-secondary', label: 'Knowledge' },
  intelligence: { bg: 'bg-info/20', text: 'text-info', label: 'Intelligence' },
};

const statusColors = {
  draft: { bg: 'bg-muted', text: 'text-muted-foreground' },
  published: { bg: 'bg-info/20', text: 'text-info' },
  active: { bg: 'bg-success/20', text: 'text-success' },
  completed: { bg: 'bg-secondary/20', text: 'text-secondary' },
};

export interface ExamQuestion {
  _id: string;
  question_text: string;
  question_type: "behavioral" | "mcq";
  weightage: number;
}

export interface ExamQuestionBank {
  _id: string;
  name: string;
  questions?: ExamQuestion[];
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exams[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState<Exams | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const loadExams = async () => {
    const data = await fetchExams();
    setExams(data);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const filteredExams = exams.filter(exam => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || exam.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const openExamModal = async (exam: Exams) => {
    const res = await api.get<ExamQuestionResponse>(
      `/exams/${exam._id}/questions`
    );

    setSelectedExam({
      ...exam,
      questionBanks: [
        {
          _id: "generated",
          name: "Selected Questions",
          questions: res.data.questions
        }
      ]
    });

    setOpenModal(true);
  };

  return (
    <AdminLayout title="Exams" subtitle="Create and manage assessments for all exam types">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => navigate('/admin/exams/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all">All Exams</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <Card
            key={exam._id}
            variant="glass"
            className="p-6 hover-lift cursor-pointer"
            onClick={() => openExamModal(exam)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge className={`${typeColors[exam.type].bg} ${typeColors[exam.type].text}`}>
                  {typeColors[exam.type].label}
                </Badge>
                <Badge className={`${statusColors[exam.status].bg} ${statusColors[exam.status].text}`}>
                  {exam.status}
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/admin/exams/edit/${exam._id}`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await updateExam(exam._id, {
                        status: exam.status === 'active' ? 'published' : 'active',
                      });
                      loadExams();
                    }}
                  >
                    {exam.status === 'active' ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {exam.status === 'active' ? 'Pause' : 'Activate'}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async () => {
                      await deleteExam(exam._id);
                      loadExams();
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
              {exam.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Code: {exam.code}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {exam.duration} mins
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {exam.totalQuestions} questions
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Attempts</span>
                <span className="text-lg font-bold text-primary">{exam.attempts}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {openModal && selectedExam && (
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={selectedExam.title}
        >
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><b>Code:</b> {selectedExam.code}</div>
            <div><b>Type:</b> {selectedExam.type}</div>
            <div><b>Duration:</b> {selectedExam.duration} mins</div>
            <div><b>Total Questions:</b> {selectedExam.totalQuestions}</div>
            <div><b>Status:</b> {selectedExam.status}</div>
          </div>

          <div className="space-y-6">
            {selectedExam.questionBanks?.map((bank) => (
              <div key={bank._id} className="border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-muted font-semibold">
                  {bank.name}
                </div>

                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Question</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bank.questions?.map((q, idx) => (
                      <tr key={q._id} className="border-t">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3">{q.question_text}</td>
                        <td className="p-3 capitalize">{q.question_type}</td>
                        <td className="p-3">{q.weightage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}