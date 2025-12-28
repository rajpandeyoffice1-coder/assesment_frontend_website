import {
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";

type Option = {
  key?: string;
  value?: number;
  text: string;
};

type PreviewQuestion = {
  text: string;
  type: "behavioral" | "mcq";
  trait?: string;
  section?: string;
  options?: Option[];
  correctOption?: string;
  isReverse?: boolean;
  weightage?: number;
  imageUrl?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  question: PreviewQuestion | null;
};

export default function QuestionPreviewModal({
  open,
  onClose,
  question,
}: Props) {
  if (!question) return null;

  return (
    <Modal open={open} onClose={onClose} title="Question Preview">
      <div className="space-y-4">
        <p className="font-medium leading-relaxed">{question.text}</p>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="capitalize">Type: {question.type}</span>
          {question.trait && <span>Trait: {question.trait}</span>}
          {question.section && <span>Section: {question.section}</span>}
          {question.weightage !== undefined && (
            <span>Weightage: {question.weightage}</span>
          )}
          {question.isReverse && (
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reverse
            </span>
          )}
        </div>

        {question.imageUrl && (
          <div className="border rounded-lg p-3 flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Image attached</span>
          </div>
        )}

        {question.options && (
          <div className="space-y-2">
            {question.options.map((opt, index) => {
              const isCorrect =
                question.type === "mcq" &&
                opt.key === question.correctOption;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 border rounded px-3 py-2 text-sm ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : ""
                  }`}
                >
                  {opt.key && (
                    <span className="font-medium">{opt.key}.</span>
                  )}
                  {opt.value && (
                    <span className="font-medium">{opt.value}</span>
                  )}
                  <span className="flex-1">{opt.text}</span>
                  {isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Button className="w-full mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
