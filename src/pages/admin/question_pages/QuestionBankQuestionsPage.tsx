import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/Modal";
import api from "@/lib/axios";

type Question = {
  _id: string;
  question_text: string;
  question_type: string;
  weightage: number;
};

export default function QuestionBankQuestionsPage() {
  const { bankId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    question_text: "",
    weightage: 1,
  });

  const loadQuestions = async () => {
    const res = await api.get<Question[]>("/questions", {
      params: bankId ? { bankId } : {}
    });

    setQuestions(res.data);
  };

  const submit = async () => {
    if (editId) {
      await api.put(`/questions/${editId}`, form);
    } else {
      await api.post("/questions", {
        ...form,
        question_bank_id: bankId,
      });
    }
    setOpen(false);
    setEditId(null);
    setForm({ question_text: "", weightage: 1 });
    loadQuestions();
  };

  const remove = async (id: string) => {
    await api.delete(`/questions/${id}`);
    loadQuestions();
  };

  useEffect(() => {
    loadQuestions();
  }, [bankId]);

  const filtered = questions.filter((q) =>
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Questions" subtitle="Questions in this bank">
      <div className="flex justify-between mb-6">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/admin/questions/behavioral?bankId=${bankId}`)
            }
          >
            Add Behavioral
          </Button>
          <Button
            onClick={() =>
              navigate(`/admin/questions/mcq?bankId=${bankId}`)
            }
          >
            Add MCQ
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((q) => (
          <Card key={q._id} variant="glass" className="p-5">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{q.question_text}</p>
                <p className="text-xs text-muted-foreground">
                  Type: {q.question_type} · Weightage: {q.weightage}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
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

      <Modal open={open} onClose={() => setOpen(false)} title="Question">
        <Input
          placeholder="Question text"
          value={form.question_text}
          onChange={(e) =>
            setForm({ ...form, question_text: e.target.value })
          }
        />
        <Input
          className="mt-3"
          type="number"
          value={form.weightage}
          onChange={(e) =>
            setForm({ ...form, weightage: Number(e.target.value) })
          }
        />
        <Button className="mt-4 w-full" onClick={submit}>
          Save
        </Button>
      </Modal>
    </AdminLayout>
  );
}
