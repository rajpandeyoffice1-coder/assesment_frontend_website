import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Papa, { ParseResult } from "papaparse";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/Modal";
import api from "@/lib/axios";

type Group = {
  _id: string;
  name: string;
};

type Candidate = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: "active" | "inactive";
  examsCompleted: number;
  createdAt: string;
  group?: Group;
};

type CandidateForm = {
  name: string;
  email: string;
  phone?: string;
  group?: string;
  status: "active" | "inactive";
};

type PreviewCandidate = {
  name: string;
  email: string;
  phone?: string;
};

const PAGE_SIZE = 8;

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewCandidate[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<CandidateForm>({
    name: "",
    email: "",
    phone: "",
    group: "",
    status: "active",
  });

  const loadData = async () => {
    const [cRes, gRes] = await Promise.all([
      api.get<Candidate[]>("/admin/candidates"),
      api.get<Group[]>("/admin/groups"),
    ]);
    setCandidates(cRes.data);
    setGroups(gRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = candidates.filter((c) => {
    const text =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search);

    const groupOk = groupFilter ? c.group?._id === groupFilter : true;
    const statusOk = statusFilter ? c.status === statusFilter : true;

    return text && groupOk && statusOk;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const submit = async () => {
    if (editId) {
      await api.put(`/admin/candidates/${editId}`, form);
    } else {
      await api.post("/admin/candidates", form);
    }
    setOpen(false);
    setEditId(null);
    setForm({ name: "", email: "", phone: "", group: "", status: "active" });
    loadData();
  };

  const remove = async (id: string) => {
    await api.delete(`/admin/candidates/${id}`);
    loadData();
  };

  const handleCsvSelect = (file: File) => {
    Papa.parse<PreviewCandidate>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: ParseResult<PreviewCandidate>) => {
        setPreviewData(result.data);
        setCsvFile(file);
        setPreviewOpen(true);
      },
    });
  };

  const saveBulkImport = async () => {
    if (!csvFile || !selectedGroup) return;

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("groupId", selectedGroup);

    await api.post("/admin/candidates/bulk-import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setPreviewOpen(false);
    setPreviewData([]);
    setCsvFile(null);
    setSelectedGroup("");
    loadData();
  };

  const downloadTemplate = async () => {
    const response = await api.get<Blob>(
      "/admin/candidates/template",
      { responseType: "blob" }
    );
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "candidate_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Candidates" subtitle="Manage candidates">
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, email, phone"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="border rounded px-3 py-2"
          style={{ borderRadius: "16px" }}
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          style={{ borderRadius: "16px" }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Template
        </Button>

        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => e.target.files && handleCsvSelect(e.target.files[0])}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Candidate ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Group</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c, index) => {
              const serial = (page - 1) * PAGE_SIZE + index + 1;
              const shortId = `EXCD-${c._id.slice(-4).toUpperCase()}`;

              return (
                <tr key={c._id} className="border-t hover:bg-muted/50">
                  <td className="p-3 font-medium">{serial}. </td>
                  <td className="p-3 font-small text-indigo-600">
                    {shortId}
                  </td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{c.group?.name}</td>
                  <td className="p-3">
                    <Badge
                      className={
                        c.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : ""
                      }
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditId(c._id);
                            setForm({
                              name: c.name,
                              email: c.email,
                              phone: c.phone ?? "",
                              group: c.group?._id ?? "",
                              status: c.status,
                            });
                            setOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => remove(c._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {page}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit Candidate" : "Add Candidate"}>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <Input className="mt-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <Input className="mt-3" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
        <select className="mt-3 w-full border rounded p-2" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>
        <Button className="mt-4 w-full" onClick={submit}>Save</Button>
      </Modal>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Import Candidates Preview">
        <select className="w-full border rounded p-2 mb-3" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>

        <div className="max-h-[50vh] overflow-auto border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((c, i) => (
                <tr key={i}>
                  <td className="p-2 border">{c.name}</td>
                  <td className="p-2 border">{c.email}</td>
                  <td className="p-2 border">{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button className="mt-4 w-full" disabled={!selectedGroup} onClick={saveBulkImport}>
          Save Candidates
        </Button>
      </Modal>
    </AdminLayout>
  );
}
