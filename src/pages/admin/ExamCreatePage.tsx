import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Image, HelpCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ExamType, LIKERT_SCALE, INTELLIGENCE_TYPES } from '@/types';
import { createExam } from '@/api/exams';
import api from '@/lib/axios';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

const examTypes = [
  { value: 'behavioral', label: 'Behavioral / Psychometric', description: 'Likert scale based personality assessment' },
  { value: 'aptitude', label: 'Aptitude Test', description: 'MCQ based skill assessment with scoring' },
  { value: 'knowledge', label: 'Industrial / Knowledge', description: 'Domain specific knowledge assessment' },
  { value: 'intelligence', label: 'Intelligence Oriented', description: 'Multiple intelligence mapping' },
];

type QuestionBank = {
  _id: string;
  name: string;
  examType: string;
};

export type BankQuestion = {
  _id?: string;
  id?: number;

  question_text: string;
  question_type: "behavioral" | "mcq";
  weightage: number;

  options?: {
    id?: number;
    key: string;
    text: string;
    is_correct?: boolean;
  }[];

  correct_option?: string;
};

const themeColors = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ec4899', label: 'Pink' },
];


export default function ExamCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [examType, setExamType] = useState<ExamType>('aptitude');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    duration: 60,
    totalQuestions: 50,
    shuffleQuestions: true,
    negativeMarking: false,
    allowSkip: true,
    autoSubmit: true,
    themeColor: '#6366f1',
    reverseScoring: false,
    marksPerQuestion: 1,
    negativeMarks: 0.25,
    intelligenceWeights: Object.fromEntries(INTELLIGENCE_TYPES.map(i => [i, 12.5])),
  });

  const loadQuestionBanks = async () => {
    try {
      const res = await api.get<QuestionBank[]>("/question-banks");
      setQuestionBanks(res.data);
    } catch (error) {
      console.error("Failed to load question banks", error);
    }
  };

  useEffect(() => {
    loadQuestionBanks();
  }, []);

  const loadBankQuestions = async (bankId: string) => {
    try {
      const { data } = await api.get<BankQuestion[]>(
        `/questions/bank/${bankId}`
      );
      console.log("Bank Questions:", data);
      setBankQuestions(data);
    } catch (error) {
      console.error(error);
    }
  };;

  const handleSave = async () => {
    if (!selectedBankId) {
      toast({
        title: "Question Bank Required",
        description: "Please select a question bank",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: formData.title,
      code: formData.code,
      description: formData.description,
      type: examType,
      duration: formData.duration,
      totalQuestions: formData.totalQuestions,
      themeColor: formData.themeColor,

      // 🔥 FORCE ADD
      questionBanks: [selectedBankId],

      settings: {
        shuffleQuestions: formData.shuffleQuestions,
        negativeMarking: formData.negativeMarking,
        allowSkip: formData.allowSkip,
        autoSubmit: formData.autoSubmit,
      },

      scoring: {
        marksPerQuestion: formData.marksPerQuestion,
        negativeMarks: formData.negativeMarks,
        reverseScoring: formData.reverseScoring,
      },
    };

    await createExam(payload);

    toast({
      title: "Exam Created",
      description: "Exam and question banks linked successfully",
    });

    navigate("/admin/exams");
  };


  return (
    <AdminLayout
      title="Create Exam"
      subtitle="Configure a new assessment with all exam parameters"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/exams')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exams
        </Button>
        <div className="flex gap-3">
          <Button variant="outline">Save as Draft</Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="settings">Exam Settings</TabsTrigger>
          <TabsTrigger value="pattern">Pattern Configuration</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        {/* Basic Details Tab */}
        <TabsContent value="basic" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="glass" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Exam Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Exam Title</Label>
                    <Input
                      placeholder="e.g., Software Engineering Aptitude"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Code</Label>
                    <Input
                      placeholder="e.g., APT-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the exam purpose and content..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Exam Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {examTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() => setExamType(type.value as ExamType)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${examType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <h4 className="font-semibold text-foreground">{type.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme Color</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {themeColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({ ...formData, themeColor: color.value })}
                        className={`h-12 rounded-xl transition-all ${formData.themeColor === color.value
                          ? 'ring-2 ring-offset-2 ring-primary scale-105'
                          : 'hover:scale-105'
                          }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: `${formData.themeColor}10` }}>
                  <p className="text-sm text-muted-foreground">Preview</p>
                  <div className="mt-2 h-20 rounded-lg" style={{ backgroundColor: formData.themeColor }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Time & Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Questions</Label>
                  <Input
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Exam Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Questions</Label>
                    <p className="text-sm text-muted-foreground">Randomize question order</p>
                  </div>
                  <Switch
                    checked={formData.shuffleQuestions}
                    onCheckedChange={(checked) => setFormData({ ...formData, shuffleQuestions: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Negative Marking</Label>
                    <p className="text-sm text-muted-foreground">Deduct marks for wrong answers</p>
                  </div>
                  <Switch
                    checked={formData.negativeMarking}
                    onCheckedChange={(checked) => setFormData({ ...formData, negativeMarking: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Skip</Label>
                    <p className="text-sm text-muted-foreground">Allow candidates to skip questions</p>
                  </div>
                  <Switch
                    checked={formData.allowSkip}
                    onCheckedChange={(checked) => setFormData({ ...formData, allowSkip: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Submit</Label>
                    <p className="text-sm text-muted-foreground">Submit when time expires</p>
                  </div>
                  <Switch
                    checked={formData.autoSubmit}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoSubmit: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pattern Configuration Tab */}
        <TabsContent value="pattern" className="animate-fade-in">
          {examType === 'behavioral' && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Behavioral Assessment Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Likert Scale Options</Label>
                  <div className="grid grid-cols-5 gap-4">
                    {LIKERT_SCALE.map((option) => (
                      <div key={option.value} className="p-4 rounded-xl bg-muted/50 text-center">
                        <div className="text-2xl font-bold text-primary mb-2">{option.value}</div>
                        <p className="text-xs text-muted-foreground">{option.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reverse Scoring</Label>
                    <p className="text-sm text-muted-foreground">Enable for negatively worded items</p>
                  </div>
                  <Switch
                    checked={formData.reverseScoring}
                    onCheckedChange={(checked) => setFormData({ ...formData, reverseScoring: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {(examType === 'aptitude' || examType === 'knowledge') && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Scoring Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Marks per Question</Label>
                    <Input
                      type="number"
                      value={formData.marksPerQuestion}
                      onChange={(e) => setFormData({ ...formData, marksPerQuestion: parseFloat(e.target.value) })}
                    />
                  </div>
                  {formData.negativeMarking && (
                    <div className="space-y-2">
                      <Label>Negative Marks</Label>
                      <Input
                        type="number"
                        step="0.25"
                        value={formData.negativeMarks}
                        onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {examType === 'intelligence' && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Multiple Intelligence Weightage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Adjust the weightage for each intelligence type. Total should equal 100%.
                </p>
                <div className="space-y-4">
                  {INTELLIGENCE_TYPES.map((intelligence) => (
                    <div key={intelligence} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{intelligence}</Label>
                        <span className="text-sm font-medium text-primary">
                          {formData.intelligenceWeights[intelligence]}%
                        </span>
                      </div>
                      <Slider
                        value={[formData.intelligenceWeights[intelligence]]}
                        onValueChange={([value]) => setFormData({
                          ...formData,
                          intelligenceWeights: {
                            ...formData.intelligenceWeights,
                            [intelligence]: value,
                          },
                        })}
                        max={50}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="animate-fade-in">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Select Question Bank</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* BANK SELECT */}
              <Select
                value={selectedBankId ?? ""}
                onValueChange={(value) => {
                  setSelectedBankId(value);
                  loadBankQuestions(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Question Bank" />
                </SelectTrigger>

                <SelectContent>
                  {questionBanks.map((bank) => (
                    <SelectItem key={bank._id} value={bank._id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* QUESTIONS TABLE */}
              {bankQuestions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border rounded-xl overflow-hidden">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left text-sm">#</th>
                        <th className="p-3 text-left text-sm">Question</th>
                        <th className="p-3 text-left text-sm">Type</th>
                        <th className="p-3 text-left text-sm">Weightage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankQuestions.map((q, index) => (
                        <tr key={q._id} className="border-t">
                          <td className="p-3 text-sm">{index + 1}</td>
                          <td className="p-3 text-sm">{q.question_text}</td>
                          <td className="p-3 text-sm capitalize">{q.question_type}</td>
                          <td className="p-3 text-sm">{q.weightage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                selectedBankId && (
                  <p className="text-muted-foreground text-sm">
                    No questions found in this bank
                  </p>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );

}

