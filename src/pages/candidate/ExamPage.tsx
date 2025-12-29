import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/layout/Logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

type Option = {
  key: string;
  text: string;
};

type Scale = {
  value: number;
  label: string;
};

type Question = {
  _id: string;
  question_text: string;
  question_type: "mcq" | "behavioral";
  qb_type: "behavioral" | "intelligence" | "aptitude" | "knowledge";
  options?: Option[];
  scale?: Scale[];
};

type ExamData = {
  exam: {
    title: string;
    duration: number;
  };
  questions: Question[];
};

type InstructionType =
  | "behavioral"
  | "intelligence"
  | "aptitude"
  | "knowledge";

const ORDER: InstructionType[] = [
  "behavioral",
  "intelligence",
  "aptitude",
  "knowledge",
];

export default function ExamPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<ExamData | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [phase, setPhase] = useState<"instruction" | "exam">("instruction");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const candidateId = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidate_profile") || "{}")?._id;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!assignmentId || !candidateId) return;

    api
      .get<{ data: ExamData }>(
        `/candidate/${candidateId}/assignments/${assignmentId}/exam`
      )
      .then(res => {
        setData(res.data.data);
        setTimeLeft(res.data.data.exam.duration * 60);
      });
  }, [assignmentId, candidateId]);

  useEffect(() => {
    if (!data) return;

    const timer = setInterval(() => {
      setTimeLeft(v => {
        if (v <= 1) {
          submitExam();
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  const sections = useMemo(() => {
    if (!data) return [];
    return ORDER.map(type => ({
      type,
      questions: data.questions.filter(q => q.qb_type === type),
    })).filter(s => s.questions.length > 0);
  }, [data]);

  if (!sections.length) return null;

  const section = sections[sectionIndex];
  const questions = section.questions;
  const question = questions[current];

  const saveAnswer = (id: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const goNext = () => {
    if (current < questions.length - 1) {
      setCurrent(v => v + 1);
    } else {
      if (sectionIndex < sections.length - 1) {
        setSectionIndex(v => v + 1);
        setCurrent(0);
        setPhase("instruction");
      } else {
        submitExam();
      }
    }
  };

  const submitExam = async () => {
    const attemptId = localStorage.getItem("exam_attempt_id");
    if (!attemptId) return;

    await api.post(`/candidate/exam/${attemptId}/submit`, {
      responses: Object.entries(answers).map(([q, a]) => ({
        question_id: q,
        answer: a,
      })),
    });

    navigate("/candidate/results");
  };

  const instructions: Record<
    InstructionType,
    { title: string; points: string[] }
  > = {
    behavioral: {
      title: "Part 1 - Personality Assessment",
      points: [
        `Total Questions: ${questions.length}`,
        "Arrange options based on preference",
        "No right or wrong answers",
      ],
    },
    intelligence: {
      title: "Part 2 - Intelligence Orientation",
      points: [
        `Total Questions: ${questions.length}`,
        "Choose the most suitable option",
        "No right or wrong answers",
      ],
    },
    aptitude: {
      title: "Part 3 - Aptitude Assessment",
      points: [
        `Total Questions: ${questions.length}`,
        "One correct answer",
        "Scored section",
      ],
    },
    knowledge: {
      title: "Part 4 - Industrial Assessment",
      points: [
        `Total Questions: ${questions.length}`,
        "One correct answer",
        "Scored section",
      ],
    },
  };

  if (phase === "instruction") {
    const info = instructions[section.type];

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-2xl w-full p-8">
          <h2 className="text-2xl font-bold mb-4">{info.title}</h2>
          <ul className="space-y-2 mb-6 text-sm">
            {info.points.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
          <Button className="w-full" onClick={() => setPhase("exam")}>
            Start Section
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Progress
              value={(Object.keys(answers).length / data!.questions.length) * 100}
              className="w-32"
            />
            <div className="text-sm">
              <Clock className="inline w-4 h-4 mr-1" />
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
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
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={submitExam}>
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-6">
          <div className="mb-3 font-semibold">
            Question {current + 1} / {questions.length}
          </div>

          <h2 className="text-lg mb-6">{question.question_text}</h2>

          {question.question_type === "mcq" && (
            <div className="space-y-3">
              {question.options?.map((o, i) => (
                <button
                  key={o.key}
                  onClick={() => saveAnswer(question._id, o.key)}
                  className={cn(
                    "w-full p-3 border rounded",
                    answers[question._id] === o.key
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  )}
                >
                  {String.fromCharCode(65 + i)}. {o.text}
                </button>
              ))}
            </div>
          )}

          {question.question_type === "behavioral" && (
            <div className="grid grid-cols-5 gap-3">
              {question.scale?.map(s => (
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

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent(v => v - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button onClick={goNext}>
              {current === questions.length - 1
                ? "Finish Section"
                : "Next"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>

        <Card className="p-4 sticky top-20">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "w-8 h-8 rounded text-xs",
                  current === i && "ring-2 ring-primary",
                  answers[q._id] ? "bg-green-500 text-white" : "bg-muted"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
