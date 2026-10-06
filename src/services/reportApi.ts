import api from "./api";
import type { ApiResponse } from "./api";

export type InternReportDto = {
  internId: number;
  internName: string;
  department: string | null;
  mentorId: number | null;
  mentorName: string | null;
  totalTasks: number;
  completedTasks: number;
  taskCompletionPct: number;
  presentDays: number;
  totalAttendanceDays: number;
  attendancePct: number;
  totalTrainings: number;
  completedTrainings: number;
  trainingCompletionPct: number;
  averageEvaluationScore: number | null;
  ppoStatus: string | null;
};

export async function listReports() {
  const { data } = await api.get<ApiResponse<InternReportDto[]>>("/reports");
  return data.data;
}

export async function exportReportsExcel() {
  const response = await api.get<Blob>("/reports/export", {
    responseType: "blob",
  });

  const contentTypeHeader = response.headers["content-type"];
  const contentType = typeof contentTypeHeader === "string"
    ? contentTypeHeader
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const blob = new Blob([response.data], {
    type: contentType,
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "intern-reports.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
