import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Ban,
  Shuffle,
  ArrowRight,
  Info,
} from "lucide-react";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/axios";
import {
  fetchCandidateAssignments,
  CandidateExam,
} from "@/api/candidateAssignments";

type ExamType =
  | "behavioral"
  | "aptitude"
  | "knowledge"
  | "intelligence";

export type ExamData = {
  assignment_id: string;
  exam_id: string;
  title: string;
  type: "behavioral" | "aptitude" | "knowledge" | "intelligence";
  duration: number;
  questions: number;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  score?: number | null;
  totalQuestions: number;
};

type AssignmentResponse = {
  exam: ExamData;
};

type StartExamResponse = {
  success: boolean;
  data: {
    attemptId: string;
    examId: string;
    status: string;
  };
};

const instructions = [
  { icon: Clock, text: "The timer starts immediately after clicking Start Exam." },
  { icon: FileText, text: "All questions carry equal marks unless specified." },
  { icon: Shuffle, text: "Questions may appear in random order." },
  { icon: CheckCircle, text: "You can change your answer before final submission." },
  { icon: Ban, text: "Do not refresh or close the browser during the exam." },
  { icon: AlertTriangle, text: "Any suspicious activity may auto-submit your exam." },
];

const dosList = [
  "Read each question carefully",
  "Manage your time wisely",
  "Submit before time ends",
];

const dontsList = [
  "Refresh the browser",
  "Open other tabs or apps",
  "Use unfair means",
];

export default function ExamInstructionsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [exam, setExam] = useState<ExamData | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    fetchCandidateAssignments().then((assignments) => {
      const found = assignments.find(
        (a) => a.assignment_id === assignmentId
      );

      if (found) {
        setExam({
          assignment_id: found.assignment_id,
          exam_id: found.exam_id,
          title: found.title,
          type: found.type,
          duration: found.duration,
          questions: found.questions,
          totalQuestions: found.questions,
          status: found.status,
          score: found.score ?? null,
          description: found.description ? found.description : "",
        });
      }
    });
  }, [assignmentId]);

  const getCandidateId = () => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.id || null;
    } catch {
      return null;
    }
  };

  const handleStartExam = async () => {
    if (!assignmentId) {
      console.error("Assignment ID is missing");
      return;
    } 
    const candidateId = getCandidateId();
    if (!candidateId) {
      console.error("Candidate ID not found");
      return;
    }
    const { data } = await api.post<StartExamResponse>(
      `/candidate/exam/${assignmentId}/start`
    );
    console.log("Start exam response:", data);
    localStorage.setItem("exam_attempt_id", data.data.attemptId);

    if (data.data.status !== "in_progress") {
      console.error("Failed to start exam. Status:", data.data.status);
      return;
    }

    console.log("Exam started with attempt ID:", data.data.attemptId);
    navigate(`/candidate/exam/${assignmentId}`);
  };

  if (!exam) {
    return (
      <CandidateLayout>
        <div className="py-20 text-center text-muted-foreground">
          Loading exam details...
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <div className="max-w-4xl mx-auto">
        <Card variant="glass" className="mb-6 overflow-hidden">
          <div className="bg-gradient-primary p-8 text-white">
            <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
              <Info className="w-4 h-4" />
              {exam.type.toUpperCase()} EXAM
            </div>

            <h1 className="font-display text-3xl font-bold mb-2">
              {exam.title}
            </h1>

            {exam.description && (
              <p className="text-white/80">{exam.description}</p>
            )}

            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{exam.duration} minutes</span>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>{exam.totalQuestions} questions</span>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {instructions.map((i, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/30"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <i.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="pt-2">{i.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card variant="glass" className="border border-success/20">
            <CardHeader>
              <CardTitle className="text-success">Do’s</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dosList.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-success rounded-full" />
                    {d}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass" className="border border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Don’ts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dontsList.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-destructive rounded-full" />
                    {d}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card variant="glass" className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(Boolean(v))}
            />
            <label htmlFor="agree">
              I have read and understood the instructions and agree to follow
              the exam rules.
            </label>
          </div>

          <Button
            disabled={!agreed}
            className="w-full"
            size="xl"
            onClick={() =>
              handleStartExam()
            }
          >
            Start Exam
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </div>
    </CandidateLayout >
  );
}
