import { useState } from "react";
import {
  Calculator,
  RotateCcw,
  CheckCircle2,
  Sigma,
  ListChecks,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type QuestionType = "behavioral" | "mcq";

export default function QuestionAnalyticsPage() {
  const [questionType, setQuestionType] = useState<QuestionType>("behavioral");

  const [selectedValue, setSelectedValue] = useState(4);
  const [maxScale, setMaxScale] = useState(5);
  const [weightage, setWeightage] = useState(1);
  const [isReverse, setIsReverse] = useState(false);

  const [isCorrect, setIsCorrect] = useState(true);

  const reverseValue = maxScale + 1 - selectedValue;

  const behavioralScore = isReverse
    ? reverseValue * weightage
    : selectedValue * weightage;

  const mcqScore = isCorrect ? weightage : 0;

  return (
    <AdminLayout
      title="Question Scoring Preview"
      subtitle="Preview scoring logic based on question format"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONFIG */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Configuration</h3>
          </div>

          <select
            className="w-full mb-4 rounded-xl border px-4 py-2 text-sm"
            value={questionType}
            onChange={(e) =>
              setQuestionType(e.target.value as QuestionType)
            }
          >
            <option value="behavioral">Behavioral (Likert Scale)</option>
            <option value="mcq">MCQ</option>
          </select>

          {questionType === "behavioral" && (
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Selected Value"
                value={selectedValue}
                onChange={(e) => setSelectedValue(Number(e.target.value))}
              />

              <Input
                type="number"
                placeholder="Max Scale"
                value={maxScale}
                onChange={(e) => setMaxScale(Number(e.target.value))}
              />

              <Input
                type="number"
                placeholder="Weightage"
                value={weightage}
                onChange={(e) => setWeightage(Number(e.target.value))}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isReverse}
                  onChange={(e) => setIsReverse(e.target.checked)}
                />
                Reverse Scoring
              </label>
            </div>
          )}

          {questionType === "mcq" && (
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Weightage"
                value={weightage}
                onChange={(e) => setWeightage(Number(e.target.value))}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isCorrect}
                  onChange={(e) => setIsCorrect(e.target.checked)}
                />
                Answer is Correct
              </label>
            </div>
          )}
        </Card>

        {/* CALCULATION */}
        <Card variant="glass" className="p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Sigma className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Calculation</h3>
          </div>

          {questionType === "behavioral" && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border rounded px-4 py-2">
                <span>Selected Value</span>
                <span>{selectedValue}</span>
              </div>

              <div className="flex justify-between border rounded px-4 py-2">
                <span>Max Scale</span>
                <span>{maxScale}</span>
              </div>

              {isReverse && (
                <div className="flex justify-between border rounded px-4 py-2 bg-muted">
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-4 h-4" />
                    Reverse Value
                  </span>
                  <span>{reverseValue}</span>
                </div>
              )}

              <div className="flex justify-between border rounded px-4 py-2">
                <span>Weightage</span>
                <span>{weightage}</span>
              </div>

              <div className="flex justify-between border rounded px-4 py-2 bg-emerald-50 border-emerald-500 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Final Score
                </span>
                <span>{behavioralScore}</span>
              </div>
            </div>
          )}

          {questionType === "mcq" && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border rounded px-4 py-2">
                <span>Answer Status</span>
                <span>{isCorrect ? "Correct" : "Incorrect"}</span>
              </div>

              <div className="flex justify-between border rounded px-4 py-2">
                <span>Weightage</span>
                <span>{weightage}</span>
              </div>

              <div className="flex justify-between border rounded px-4 py-2 bg-emerald-50 border-emerald-500 font-medium">
                <span className="flex items-center gap-1">
                  <ListChecks className="w-4 h-4 text-emerald-600" />
                  Final Score
                </span>
                <span>{mcqScore}</span>
              </div>
            </div>
          )}

          <Button className="mt-6 w-full">Apply This Logic</Button>
        </Card>
      </div>
    </AdminLayout>
  );
}
