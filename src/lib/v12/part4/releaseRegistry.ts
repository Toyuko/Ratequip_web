import type { Result } from "@/lib/v12/part4/types";

export type ReleaseContract = {
  key: string;
  predecessor: string;
  minMigration: number;
  maxMigration: number;
  checksum: string;
  status?: "draft" | "registered" | "applied";
  registeredAt?: string;
};

export class ReleaseRegistry {
  private releases = new Map<string, ReleaseContract>();

  register(c: ReleaseContract): Result<ReleaseContract> {
    if (this.releases.has(c.key)) {
      return { ok: false, code: "RELEASE_EXISTS", message: c.key };
    }
    const value: ReleaseContract = {
      ...c,
      status: c.status ?? "registered",
      registeredAt: new Date().toISOString(),
    };
    this.releases.set(c.key, value);
    return { ok: true, value };
  }

  validate(
    c: ReleaseContract,
    baseline: { release: string; migration: number },
  ): Result<true> {
    if (baseline.release !== c.predecessor) {
      return {
        ok: false,
        code: "PREDECESSOR_MISMATCH",
        message: baseline.release,
      };
    }
    if (baseline.migration !== c.minMigration - 1) {
      return {
        ok: false,
        code: "MIGRATION_FLOOR_MISMATCH",
        message: String(baseline.migration),
      };
    }
    if (!/^[a-f0-9]{64}$/i.test(c.checksum)) {
      return { ok: false, code: "INVALID_CHECKSUM", message: c.checksum };
    }
    return { ok: true, value: true };
  }

  list(): ReleaseContract[] {
    return [...this.releases.values()];
  }

  get(key: string) {
    return this.releases.get(key);
  }

  markApplied(key: string) {
    const existing = this.releases.get(key);
    if (!existing) return { ok: false as const, message: "Unknown release" };
    existing.status = "applied";
    return { ok: true as const, value: existing };
  }
}
