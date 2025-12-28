import { useEffect, useState } from "react";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
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

/* ================= TYPES ================= */

type Bank = {
  _id: string;
  name: string;
  examType: "behavioral" | "mcq" | "aptitude" | "knowledge" | "intelligence";
};
type Trait = { _id: string; name: string };
type Scale = { _id: string; name: string };

type BehavioralQuestion = {
  _id: string;
  question_text: string;
  trait_id: Trait;
  scale_id: Scale;
  weightage: number;
  isReverse: boolean;
  image?: string;
};

type QuestionForm = {
  question_text: string;
  trait_id: string;
  scale_id: string;
  weightage: number;
  isReverse: boolean;
  image: File | null;
};

/* ================= PAGE ================= */

export default function BehavioralQuestionPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [questions, setQuestions] = useState<BehavioralQuestion[]>([]);

  const [selectedBankId, setSelectedBankId] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<QuestionForm>({
    question_text: "",
    trait_id: "",
    scale_id: "",
    weightage: 1,
    isReverse: false,
    image: null,
  });

  /* ================= API ================= */

  const loadBanks = async () => {
    const res = await api.get<Bank[]>("/question-banks");
    setBanks(res.data);

    // ✅ AUTO SELECT BEHAVIORAL BANK
    const behavioralBank = res.data.find(
      (b) => b.examType === "behavioral"
    );

    if (behavioralBank) {
      setSelectedBankId(behavioralBank._id);
    }
  };

  const loadTraits = async () => {
    const res = await api.get<Trait[]>("/traits");
    setTraits(res.data);
  };

  const loadScales = async () => {
    const res = await api.get<Scale[]>("/scales");
    setScales(res.data);
  };

  const loadQuestions = async () => {
    if (!selectedBankId) return;

    // const res = await api.get<BehavioralQuestion[]>(
    //   `/questions?bankId=${selectedBankId}&type=behavioral`
    // );

    const res = await api.get<BehavioralQuestion[]>(
      `/questions/bank/${selectedBankId}`
    );

    setQuestions(res.data);
  };


  const submit = async () => {
    if (!selectedBankId) {
      alert("Please select a Question Bank");
      return;
    }

    const payload = new FormData();
    console.log("form", form);
    payload.append("question_text", form.question_text);
    payload.append("trait_id", form.trait_id);
    payload.append("scale_id", form.scale_id);
    payload.append("weightage", String(form.weightage));
    payload.append("isReverse", String(form.isReverse));
    payload.append("maxScale", "5");
    payload.append("question_type", "behavioral");
    payload.append("question_bank_id", selectedBankId);
    if (form.image) payload.append("image", form.image);

    await (editId
      ? api.put(`/questions/${editId}`, payload)
      : api.post("/questions", payload));

    setOpen(false);
    setEditId(null);
    setForm({
      question_text: "",
      trait_id: "",
      scale_id: "",
      weightage: 1,
      isReverse: false,
      image: null,
    });

    loadQuestions();
  };

  const remove = async (id: string) => {
    await api.delete(`/questions/${id}`);
    loadQuestions();
  };

  useEffect(() => {
    loadBanks();
    loadTraits();
    loadScales();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedBankId]);

  return (
    <AdminLayout
      title="Behavioral Questions"
      subtitle="Psychometric questions with Likert scale & traits"
    >
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <select
          className="
    w-full md:max-w-sm
    rounded-xl
    border border-slate-200 dark:border-slate-700
    bg-white/80 dark:bg-slate-900/80
    px-4 py-2.5
    text-sm font-medium
    text-slate-800 dark:text-slate-100
    shadow-sm
    backdrop-blur
    transition-all duration-200
    focus:outline-none
    focus:ring-2 focus:ring-indigo-500
    focus:border-indigo-500
    hover:border-slate-300 dark:hover:border-slate-600
  "
          value={selectedBankId}
          onChange={(e) => setSelectedBankId(e.target.value)}
        >
          <option value="">Select Question Bank *</option>
          {banks.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <Button disabled={!selectedBankId} onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* QUESTIONS */}
      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q._id} variant="glass" className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{q.question_text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Trait: {q.trait_id?.name} · Scale: {q.scale_id?.name} ·
                  Weightage: {q.weightage}
                  {q.isReverse && " · Reverse"}
                </p>
                {q.image && (
                  <span className="flex items-center gap-1 text-xs mt-1">
                    <ImageIcon className="w-3 h-3" /> Image
                  </span>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditId(q._id);
                      setForm({
                        question_text: q.question_text,
                        trait_id: q.trait_id._id,
                        scale_id: q.scale_id._id,
                        weightage: q.weightage,
                        isReverse: q.isReverse,
                        image: null,
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => remove(q._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Behavioral Question" : "Add Behavioral Question"}
      >
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedBankId}
          required
          onChange={(e) => setSelectedBankId(e.target.value)}
        >
          <option value="">Select Question Bank *</option>
          {banks.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <Input
          className="mt-3"
          placeholder="Question text"
          value={form.question_text}
          onChange={(e) =>
            setForm({ ...form, question_text: e.target.value })
          }
        />

        <select
          className="mt-3 w-full border rounded px-3 py-2"
          value={form.trait_id}
          onChange={(e) =>
            setForm({ ...form, trait_id: e.target.value })
          }
        >
          <option value="">Select Trait *</option>
          {traits.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          className="mt-3 w-full border rounded px-3 py-2"
          value={form.scale_id}
          onChange={(e) =>
            setForm({ ...form, scale_id: e.target.value })
          }
        >
          <option value="">Select Scale *</option>
          {scales.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <Input
          className="mt-3"
          type="number"
          placeholder="Weightage"
          value={form.weightage}
          onChange={(e) =>
            setForm({ ...form, weightage: Number(e.target.value) })
          }
        />

        <label className="flex items-center gap-2 mt-3 text-sm">
          <input
            type="checkbox"
            checked={form.isReverse}
            onChange={(e) =>
              setForm({ ...form, isReverse: e.target.checked })
            }
          />
          Reverse Scoring
        </label>

        <Input
          className="mt-3"
          type="file"
          onChange={(e) =>
            setForm({ ...form, image: e.target.files?.[0] || null })
          }
        />

        <Button className="mt-4 w-full" onClick={submit}>
          Save Question
        </Button>
      </Modal>
    </AdminLayout>
  );
}
