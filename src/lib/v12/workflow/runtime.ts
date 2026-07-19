/**
 * Thin V12 Domain 37 workflow runtime (Release 3A).
 * Configuration-driven tasks with no self-approval.
 */
import templatesJson from "@/data/v12/workflow_templates_part3.json";

export type WorkflowTemplate = {
  id: string;
  name: string;
  version: number;
  nodes: string[];
  policy: string;
};

export type WorkflowTask = {
  id: string;
  instanceId: string;
  node: string;
  status: "open" | "claimed" | "completed" | "cancelled";
  assignee?: string;
  claimedBy?: string;
  completedBy?: string;
  createdAt: string;
  completedAt?: string;
};

export type WorkflowInstance = {
  id: string;
  templateId: string;
  templateName: string;
  subjectType: string;
  subjectId: string;
  status: "running" | "completed" | "cancelled" | "failed";
  currentNode: string;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  history: Array<{ at: string; node: string; action: string; actor: string }>;
};

export function listWorkflowTemplates(): WorkflowTemplate[] {
  return templatesJson as WorkflowTemplate[];
}

export function getWorkflowTemplate(id: string): WorkflowTemplate | undefined {
  return listWorkflowTemplates().find((t) => t.id === id);
}

export function nextApprovalNode(template: WorkflowTemplate, current: string) {
  const idx = template.nodes.indexOf(current);
  if (idx < 0 || idx >= template.nodes.length - 1) return null;
  return template.nodes[idx + 1] ?? null;
}

export function isTerminalNode(template: WorkflowTemplate, node: string) {
  return template.nodes[template.nodes.length - 1] === node;
}
