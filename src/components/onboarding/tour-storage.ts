export const TOUR_STORAGE_KEY = "rq_product_tour_v1";

export function hasCompletedTour(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === "done";
  } catch {
    return false;
  }
}

export function markTourComplete(): void {
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, "done");
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function resetTour(): void {
  try {
    window.localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
