import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/layout/Logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

type MCQOption = {
  key: string;
  text: string;
};

type ScaleOption = {
  value: number;
  label: string;
};

type Question = {
  _id: string;
  question_text: string;
  question_type: "mcq" | "behavioral";
  qb_type: "behavioral" | "aptitude" | "knowledge" | "intelligence";
  options?: MCQOption[];
  scale?: ScaleOption[];
};

type ExamData = {
  assignment: {
    _id: string;
    status: string;
  };
  exam: {
    _id: string;
    title: string;
    type: "behavioral" | "aptitude" | "knowledge" | "intelligence";
    duration: number;
    totalQuestions: number;
  };
  questions: Question[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export default function ExamPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<ExamData | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);

  const candidateId = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidate_profile") || "")._id;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!assignmentId || !candidateId) return;

    api
      .get<ApiResponse<ExamData>>(
        `/candidate/${candidateId}/assignments/${assignmentId}/exam`
      )
      .then((res) => {
        setData(res.data.data);
        setTimeLeft(res.data.data.exam.duration * 60);
      });
  }, [assignmentId, candidateId]);

  useEffect(() => {
    if (!data) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  const saveAnswer = (qid: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const submitExam = async () => {
    const attemptId = localStorage.getItem("exam_attempt_id");
    if (!attemptId) return;

    const responses = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: questionId,
      answer,
    }));

    await api.post(`/candidate/exam/${attemptId}/submit`, { responses });
    navigate("/candidate/results");
  };

  const questions = data?.questions || [];
  const question = questions[current];

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return (Object.keys(answers).length / questions.length) * 100;
  }, [answers, questions]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  if (!data || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading exam...
      </div>
    );
  }

  const sectionLabel =
    question.qb_type === "behavioral"
      ? "Behavioral Section"
      : question.qb_type === "intelligence"
        ? "Intelligence Section"
        : question.qb_type === "knowledge"
          ? "Knowledge Section"
          : "Aptitude Section";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size="sm" />

          <div className="flex items-center gap-4">
            <Progress value={progress} className="w-32" />
            <span className="text-xs text-muted-foreground">
              {Object.keys(answers).length}/{questions.length}
            </span>

            <div
              className={cn(
                "px-3 py-1 rounded text-xs",
                timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-muted"
              )}
            >
              <Clock className="inline w-4 h-4 mr-1" />
              {formatTime(timeLeft)}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm">
                  <Send className="w-4 h-4 mr-1" />
                  Submit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit Exam</AlertDialogTitle>
                  <AlertDialogDescription>
                    You answered {Object.keys(answers).length} of{" "}
                    {questions.length}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={Object.keys(answers).length === 0}
                    onClick={submitExam}
                  >
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-6 p-6">
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="mb-3 text-xs font-semibold text-primary uppercase">
              {sectionLabel}
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-sm">
                Question {current + 1} of {questions.length}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setFlagged(prev => {
                    const s = new Set(prev);

                    if (s.has(question._id)) {
                      s.delete(question._id);
                    } else {
                      s.add(question._id);
                    }

                    return s;
                  })
                }
              >
                <Flag className="w-4 h-4 mr-1" />
                {flagged.has(question._id) ? "Flagged" : "Flag"}
              </Button>
            </div>

            <h2 className="text-lg font-medium mb-6">
              {question.question_text}
            </h2>

            {question.question_type === "mcq" && (
              <div className="space-y-3">
                {question.options?.map((o, i) => (
                  <button
                    key={o.key}
                    onClick={() => saveAnswer(question._id, o.key)}
                    className={cn(
                      "w-full p-3 border rounded flex gap-3",
                      answers[question._id] === o.key
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="w-6 h-6 flex items-center justify-center border rounded-full">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {o.text}
                  </button>
                ))}
              </div>
            )}

            {question.question_type === "behavioral" && (
              <div className="grid grid-cols-5 gap-3">
                {question.scale?.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => saveAnswer(question._id, s.value)}
                    className={cn(
                      "p-3 border rounded text-xs",
                      answers[question._id] === s.value
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                disabled={current === 0}
                onClick={() => setCurrent(c => c - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                disabled={current === questions.length - 1}
                onClick={() => setCurrent(c => c + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-4 sticky top-20">
          <h3 className="text-sm font-medium mb-3">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const isAnswered = answers[q._id] !== undefined;
              const isFlagged = flagged.has(q._id);

              return (
                <button
                  key={q._id}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "w-8 h-8 text-xs rounded",
                    current === i && "ring-2 ring-primary",
                    isAnswered
                      ? "bg-green-500 text-white"
                      : isFlagged
                        ? "bg-yellow-400 text-white"
                        : "bg-muted"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
