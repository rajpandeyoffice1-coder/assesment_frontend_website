import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
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
  options?: MCQOption[];
  scale?: ScaleOption[];
  maxScale?: number;
  isReverse?: boolean;
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
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ExamData | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);

  const candidateId = (() => {
    try {
      const raw = localStorage.getItem("candidate_profile");
      if (!raw) return null;
      return JSON.parse(raw)._id;
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

  const saveAnswer = (qid: string, value: number | string) => {
    setAnswers((p) => ({ ...p, [qid]: value }));
  };

  const submitExam = async () => {
    const attemptId = localStorage.getItem("exam_attempt_id");
    if (!attemptId) return;

    await api.post(`/candidate/exam/${attemptId}/submit`, { answers });
    navigate("/candidate/results");
  };

  const question = data?.questions[current];

  const progress = useMemo(() => {
    if (!data) return 0;
    return ((current + 1) / data.questions.length) * 100;
  }, [current, data]);

  const answeredCount = Object.keys(answers).length;
  const lowTime = timeLeft < 300;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (!data || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading exam…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <Progress value={progress} className="w-28 h-1.5" />
                <span className="text-xs text-muted-foreground">
                  {answeredCount}/{data.questions.length}
                </span>
              </div>
              <div
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-mono",
                  lowTime ? "bg-red-100 text-red-600" : "bg-muted"
                )}
              >
                <Clock className="inline w-3.5 h-3.5 mr-1" />
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
                      Answered {answeredCount} of {data.questions.length}
                      {answeredCount < data.questions.length && (
                        <span className="block text-yellow-600 text-xs mt-2">
                          <AlertTriangle className="inline w-3.5 h-3.5 mr-1" />
                          Unanswered questions remain
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue</AlertDialogCancel>
                    <AlertDialogAction onClick={submitExam}>
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-muted-foreground">
                Question {current + 1} of {data.questions.length}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setFlagged((prev) => {
                    const next = new Set(prev);
                    if (next.has(question._id)) {
                      next.delete(question._id);
                    } else {
                      next.add(question._id);
                    }
                    return next;
                  })
                }
              >
                <Flag className="w-3.5 h-3.5 mr-1" />
                {flagged.has(question._id) ? "Flagged" : "Flag"}
              </Button>
            </div>

            <h2 className="text-lg font-medium mb-6 leading-relaxed">
              {question.question_text}
            </h2>

            {question.question_type === "mcq" && (
              <div className="space-y-3">
                {question.options?.map((o, i) => (
                  <button
                    key={o.key}
                    onClick={() => saveAnswer(question._id, o.key)}
                    className={cn(
                      "w-full px-4 py-3 rounded-md border flex gap-3 text-sm text-left",
                      answers[question._id] === o.key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs",
                        answers[question._id] === o.key
                          ? "bg-primary text-white"
                          : "border"
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{o.text}</span>
                  </button>
                ))}
              </div>
            )}

            {question.question_type === "behavioral" && (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {question.scale?.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => saveAnswer(question._id, s.value)}
                    className={cn(
                      "px-3 py-3 rounded-md border text-xs text-center",
                      answers[question._id] === s.value
                        ? "bg-primary text-white border-primary"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                disabled={current === data.questions.length - 1}
                onClick={() => setCurrent((c) => c + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-4 sticky top-20">
            <h3 className="text-sm font-medium mb-3">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {data.questions.map((q, i) => (
                <button
                  key={q._id}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "w-8 h-8 rounded text-xs",
                    current === i && "ring-2 ring-primary",
                    answers[q._id]
                      ? "bg-green-500 text-white"
                      : flagged.has(q._id)
                        ? "bg-yellow-400 text-white"
                        : "bg-muted"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
