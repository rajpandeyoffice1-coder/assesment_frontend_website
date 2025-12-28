import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { ExamCard } from "@/components/dashboard/ExamCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchCandidateAssignments,
  CandidateExam,
} from "@/api/candidateAssignments";

type ExamCardStatus = "not_started" | "in_progress" | "completed";

export default function CandidateExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<CandidateExam[]>([]);

  useEffect(() => {
    fetchCandidateAssignments().then(setExams);
  }, []);

  const normalizedExams = useMemo(() => {
    return exams.map((e) => ({
      ...e,
      uiStatus:
        e.status === "pending"
          ? ("not_started" as ExamCardStatus)
          : (e.status as ExamCardStatus),
    }));
  }, [exams]);

  const pendingExams = normalizedExams.filter(
    (e) => e.uiStatus !== "completed"
  );

  const completedExams = normalizedExams.filter(
    (e) => e.uiStatus === "completed"
  );

  return (
    <CandidateLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          My Exams
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage your assigned assessments
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all">
            All Exams ({normalizedExams.length})
          </TabsTrigger>  
          <TabsTrigger value="pending">
            Pending ({pendingExams.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedExams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingExams.map((exam) => (
              <ExamCard
                key={exam.assignment_id}
                title={exam.title}
                type={exam.type}
                duration={exam.duration}
                questions={exam.questions}
                status={exam.uiStatus}
                onStart={() =>
                  navigate(
                    `/candidate/exam/${exam.assignment_id}/instructions`
                  )
                }
                onResume={() =>
                  navigate(`/candidate/exam/${exam.assignment_id}`)
                }
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedExams.map((exam) => (
              <ExamCard
                key={exam.assignment_id}
                title={exam.title}
                type={exam.type}
                duration={exam.duration}
                questions={exam.questions}
                status="completed"
                score={exam.score ?? undefined}
                onViewResult={() =>
                  navigate(`/candidate/results/${exam.assignment_id}`)
                }
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalizedExams.map((exam) => (
              <ExamCard
                key={exam.assignment_id}
                title={exam.title}
                type={exam.type}
                duration={exam.duration}
                questions={exam.questions}
                status={exam.uiStatus}
                score={exam.score ?? undefined}
                onStart={() =>
                  navigate(
                    `/candidate/exam/${exam.assignment_id}/instructions`
                  )
                }
                onResume={() =>
                  navigate(`/candidate/exam/${exam.assignment_id}/instructions`)
                }
                onViewResult={() =>
                  navigate(`/candidate/results/${exam.assignment_id}`)
                }
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </CandidateLayout>
  );
}
