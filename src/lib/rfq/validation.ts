const MAX_RFQ_BUDGET = 1_000_000_000;
const PLACEHOLDER_TITLES = new Set([
  "test",
  "asdf",
  "xxx",
  "foo",
  "bar",
  "demo",
  "sample",
  "a",
  "x",
]);

export function validateRfqContent(input: {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
}): string | null {
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < 8) {
    return "Title must be at least 8 characters.";
  }
  if (PLACEHOLDER_TITLES.has(title.toLowerCase())) {
    return "Enter a meaningful RFQ title (not a placeholder).";
  }
  if (description.length < 40) {
    return "Description must be at least 40 characters so suppliers can respond.";
  }
  if (
    !Number.isFinite(input.budgetMin) ||
    !Number.isFinite(input.budgetMax) ||
    input.budgetMin < 0 ||
    input.budgetMax < 0
  ) {
    return "Budget values must be valid non-negative numbers.";
  }
  if (input.budgetMin > input.budgetMax) {
    return "Minimum budget cannot exceed maximum budget.";
  }
  if (input.budgetMax > MAX_RFQ_BUDGET) {
    return "Maximum budget is unrealistically large. Enter a realistic range.";
  }
  if (input.budgetMax === 0 && input.budgetMin === 0) {
    return "Enter a budget range greater than zero.";
  }
  return null;
}
