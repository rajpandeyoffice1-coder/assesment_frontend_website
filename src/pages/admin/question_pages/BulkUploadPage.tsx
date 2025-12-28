import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  Info,
  CheckCircle2,
  Download,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";

/* ================= TYPES ================= */

type QuestionType = "mcq" | "behavioral";

type MCQExcelRow = {
  question_text: string;
  option_A: string;
  option_B: string;
  option_C: string;
  option_D: string;
  correct_option: string;
  weightage?: number;
};

type BehavioralExcelRow = {
  question_text: string;
  isReverse?: boolean | string;
  maxScale?: number;
  weightage?: number;
};

type ExcelRow = MCQExcelRow | BehavioralExcelRow;

type Bank = { _id: string; name: string };
type Section = { _id: string; name: string };
type Trait = { _id: string; name: string };
type Scale = { _id: string; name: string };

/* ================= PAGE ================= */

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExcelRow[]>([]);
  const [type, setType] = useState<QuestionType>("mcq");

  const [banks, setBanks] = useState<Bank[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);

  const [bankId, setBankId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [traitId, setTraitId] = useState("");
  const [scaleId, setScaleId] = useState("");

  /* ================= LOAD MASTER DATA ================= */

  useEffect(() => {
    api.get<Bank[]>("/question-banks").then(r => setBanks(r.data));
    api.get<Section[]>("/sections").then(r => setSections(r.data));
    api.get<Trait[]>("/traits").then(r => setTraits(r.data));
    api.get<Scale[]>("/scales").then(r => setScales(r.data));
  }, []);

  /* ================= TEMPLATE DOWNLOAD ================= */

  const downloadTemplate = () => {
    const data =
      type === "mcq"
        ? [
            {
              question_text: "",
              option_A: "",
              option_B: "",
              option_C: "",
              option_D: "",
              correct_option: "",
              weightage: 1,
            },
          ]
        : [
            {
              question_text: "",
              isReverse: false,
              maxScale: 5,
              weightage: 1,
            },
          ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${type}_questions_template.xlsx`);
  };

  /* ================= FILE HANDLING ================= */

  const handleFile = async (f: File) => {
    const buffer = await f.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet);
    setPreview(rows);
  };

  /* ================= BUILD PAYLOAD ================= */

  const buildPayload = () =>
    preview.map((row) =>
      type === "mcq"
        ? {
            question_text: row.question_text,
            question_type: "mcq",
            question_bank_id: bankId,
            section_id: sectionId,
            options: [
              { key: "A", text: (row as MCQExcelRow).option_A },
              { key: "B", text: (row as MCQExcelRow).option_B },
              { key: "C", text: (row as MCQExcelRow).option_C },
              { key: "D", text: (row as MCQExcelRow).option_D },
            ],
            correct_option: (row as MCQExcelRow).correct_option,
            weightage: Number((row as MCQExcelRow).weightage || 1),
          }
        : {
            question_text: row.question_text,
            question_type: "behavioral",
            question_bank_id: bankId,
            trait_id: traitId,
            scale_id: scaleId,
            isReverse:
              (row as BehavioralExcelRow).isReverse === true ||
              (row as BehavioralExcelRow).isReverse === "true",
            maxScale: Number((row as BehavioralExcelRow).maxScale || 5),
            weightage: Number((row as BehavioralExcelRow).weightage || 1),
          }
    );

  const submit = async () => {
    const payload = buildPayload();
    await api.post("/questions/bulk", payload);
    setPreview([]);
    setFile(null);
  };

  /* ================= UI ================= */

  return (
    <AdminLayout
      title="Bulk Upload Questions"
      subtitle="Upload multiple questions using Excel"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload File
            </h3>

            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="mcq">MCQ</option>
              <option value="behavioral">Behavioral</option>
            </select>
          </div>

          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download {type.toUpperCase()} Template
          </Button>

          <div className="border-2 border-dashed rounded-xl p-6 text-center mt-4">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <Input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  handleFile(f);
                }
              }}
            />
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {file.name} loaded
            </div>
          )}
        </Card>

        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Instructions</h3>
          </div>

          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>• Use downloaded template</li>
            <li>• One question per row</li>
            <li>• Select mappings below</li>
            <li>• Preview before upload</li>
          </ul>
        </Card>
      </div>

      {preview.length > 0 && (
        <Card variant="glass" className="p-6 mt-6 space-y-4">
          <h3 className="font-semibold">Preview ({preview.length} rows)</h3>

          <div className="overflow-auto border rounded-lg max-h-64">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {Object.keys(preview[0]).map((k) => (
                    <th key={k} className="px-3 py-2 text-left">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((v, idx) => (
                      <td key={idx} className="px-3 py-2">
                        {String(v ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <select value={bankId} onChange={e => setBankId(e.target.value)} className="border rounded px-3 py-2 w-full">
            <option value="">Select Question Bank</option>
            {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>

          {type === "mcq" && (
            <select value={sectionId} onChange={e => setSectionId(e.target.value)} className="border rounded px-3 py-2 w-full">
              <option value="">Select Section</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          )}

          {type === "behavioral" && (
            <>
              <select value={traitId} onChange={e => setTraitId(e.target.value)} className="border rounded px-3 py-2 w-full">
                <option value="">Select Trait</option>
                {traits.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>

              <select value={scaleId} onChange={e => setScaleId(e.target.value)} className="border rounded px-3 py-2 w-full">
                <option value="">Select Scale</option>
                {scales.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </>
          )}

          <Button className="w-full" onClick={submit}>
            Upload Questions
          </Button>
        </Card>
      )}
    </AdminLayout>
  );
}
