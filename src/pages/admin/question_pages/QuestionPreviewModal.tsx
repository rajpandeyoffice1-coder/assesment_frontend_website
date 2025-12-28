import { useCallback, useEffect, useState } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";
import QuestionPreviewModal from "@/components/modals/QuestionPreviewModal";

type Question = {
  _id: string;
  question_text: string;
  question_type: "mcq" | "behavioral";
  weightage: number;
  section_id?: { name: string };
  trait_id?: { name: string };
  scale_id?: {
    options: { value: number; label: string }[];
  };
  options?: { key: string; text: string }[];
  correct_option?: string;
  isReverse?: boolean;
  image?: string;
};

export default function QuestionBankQuestionsPage() {
  const { bankId } = useParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<{
    text: string;
    type: "mcq" | "behavioral";
    trait?: string;
    section?: string;
    options?: { key?: string; value?: number; text: string }[];
    correctOption?: string;
    isReverse?: boolean;
    weightage?: number;
    imageUrl?: string;
  } | null>(null);

  const loadQuestions = useCallback(async () => {
    if (!bankId) return;

    const res = await api.get<Question[]>(`/questions/bank/${bankId}`);
    setQuestions(res.data);
  }, [bankId]);

  const previewMCQ = (q: Question) => {
    setPreviewQuestion({
      text: q.question_text,
      type: "mcq",
      section: q.section_id?.name,
      options: q.options,
      correctOption: q.correct_option,
      weightage: q.weightage,
      imageUrl: q.image,
    });
    setPreviewOpen(true);
  };

  const previewBehavioral = (q: Question) => {
    setPreviewQuestion({
      text: q.question_text,
      type: "behavioral",
      trait: q.trait_id?.name,
      options: q.scale_id?.options?.map(o => ({
        value: o.value,
        text: o.label,
      })),
      isReverse: q.isReverse,
      weightage: q.weightage,
      imageUrl: q.image,
    });
    setPreviewOpen(true);
  };

  const remove = async (id: string) => {
    await api.delete(`/questions/${id}`);
    loadQuestions();
  };

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <AdminLayout title="Questions" subtitle="All questions in this bank">
      <div className="space-y-4">
        {questions.map(q => (
          <Card key={q._id} variant="glass" className="p-5">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{q.question_text}</p>
                <p className="text-xs text-muted-foreground">
                  {q.question_type} · Weightage: {q.weightage}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      q.question_type === "mcq"
                        ? previewMCQ(q)
                        : previewBehavioral(q)
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => remove(q._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      <QuestionPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        question={previewQuestion}
      />
    </AdminLayout>
  );
}
