import { evaluateRule, type Json, type RuleContext } from "./rule-engine";

export interface QuestionDefinition {
  id: string;
  version: number;
  display_order: number;
  visibility_rule?: unknown;
  required_rule?: unknown;
  dependency_ids?: string[];
  prompt?: string;
  input_type?: string;
  answer_type?: string;
  pack_id?: string;
  options?: Array<string | { value: string; label: string }>;
}

export interface ResolvedQuestion extends QuestionDefinition {
  required: boolean;
  trace: string[];
}

export function resolveQuestions(
  questions: QuestionDefinition[],
  ctx: RuleContext,
): ResolvedQuestion[] {
  const visible = questions.filter((q) =>
    evaluateRule(q.visibility_rule ?? {}, ctx),
  );
  const ids = new Set(visible.map((q) => q.id));
  for (const q of visible) {
    for (const d of q.dependency_ids ?? []) {
      if (!ids.has(d)) {
        // Soft-fail for incomplete seed packs
        console.warn(`Visible question ${q.id} missing dependency ${d}`);
      }
    }
  }
  return visible
    .map((q) => ({
      ...q,
      required: evaluateRule(q.required_rule ?? {}, ctx),
      trace: ["visibility:true"],
    }))
    .sort(
      (a, b) =>
        a.display_order - b.display_order || a.id.localeCompare(b.id),
    );
}

export type { Json, RuleContext };
