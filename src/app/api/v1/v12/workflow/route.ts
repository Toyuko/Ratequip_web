import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  claimWorkflowTask,
  completeWorkflowTask,
  listWorkflowOverview,
  startWorkflow,
} from "@/lib/v12/services";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  return apiResponse(req, ok(listWorkflowOverview()));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    templateId?: string;
    subjectType?: string;
    subjectId?: string;
    startedBy?: string;
    taskId?: string;
    actor?: string;
  };

  if (body.action === "start") {
    const res = startWorkflow({
      templateId: body.templateId ?? "wf-procurement-approval-v1",
      subjectType: body.subjectType ?? "manual",
      subjectId: body.subjectId ?? "manual",
      startedBy: body.startedBy ?? "system",
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (body.action === "claim" && body.taskId && body.actor) {
    const res = claimWorkflowTask({ taskId: body.taskId, actor: body.actor });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (body.action === "complete" && body.taskId && body.actor) {
    const res = completeWorkflowTask({
      taskId: body.taskId,
      actor: body.actor,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  return apiResponse(req, err("Unknown workflow action"));
}
