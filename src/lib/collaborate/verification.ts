import { randomUUID } from "crypto";
import type {
  VerificationRecord,
  VerificationTier,
} from "@/lib/collaborate/types";

export interface VerificationProvider {
  readonly name: string;
  verify(subject: {
    partyId: string;
    kind: string;
    payload: Record<string, unknown>;
  }): Promise<VerificationRecord>;
}

/** Manual admin verification queue for pilot (§3.2 OPEN-2). */
export class ManualVerificationQueue implements VerificationProvider {
  readonly name = "manual_admin";
  private queue: VerificationRecord[] = [];

  async verify(subject: {
    partyId: string;
    kind: string;
    payload: Record<string, unknown>;
  }): Promise<VerificationRecord> {
    const record: VerificationRecord = {
      verificationId: `vrf_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
      partyId: subject.partyId,
      provider: this.name,
      subject: subject.kind,
      status: "PENDING",
      evidence: subject.payload,
      createdAt: new Date().toISOString(),
    };
    this.queue.push(record);
    return record;
  }

  listPending(): VerificationRecord[] {
    return this.queue.filter((r) => r.status === "PENDING");
  }

  resolve(
    verificationId: string,
    status: "PASSED" | "FAILED",
    reviewedBy: string,
    tierUnlocked?: VerificationTier,
  ): VerificationRecord {
    const rec = this.queue.find((r) => r.verificationId === verificationId);
    if (!rec) throw new Error("Verification not found");
    rec.status = status;
    rec.reviewedBy = reviewedBy;
    if (status === "PASSED" && tierUnlocked) {
      rec.tierUnlocked = tierUnlocked;
    }
    return rec;
  }
}

export class IdentityProviderStub implements VerificationProvider {
  readonly name = "identity_stub";
  constructor(private queue: ManualVerificationQueue) {}
  verify(subject: {
    partyId: string;
    kind: string;
    payload: Record<string, unknown>;
  }) {
    return this.queue.verify({ ...subject, kind: "identity" });
  }
}

export class CompanyRegistryProviderStub implements VerificationProvider {
  readonly name = "company_registry_stub";
  constructor(private queue: ManualVerificationQueue) {}
  verify(subject: {
    partyId: string;
    kind: string;
    payload: Record<string, unknown>;
  }) {
    return this.queue.verify({ ...subject, kind: "company_registry" });
  }
}

export class CredentialProviderStub implements VerificationProvider {
  readonly name = "credential_stub";
  constructor(private queue: ManualVerificationQueue) {}
  verify(subject: {
    partyId: string;
    kind: string;
    payload: Record<string, unknown>;
  }) {
    return this.queue.verify({ ...subject, kind: "credential" });
  }
}

export class SanctionsProviderStub implements VerificationProvider {
  readonly name = "sanctions_stub";
  async verify(subject: {
    partyId: string;
    kind: string;
    payload: Record<string, unknown>;
  }): Promise<VerificationRecord> {
    return {
      verificationId: `vrf_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
      partyId: subject.partyId,
      provider: this.name,
      subject: "sanctions",
      status: "PASSED",
      evidence: { screened: true, ...subject.payload },
      createdAt: new Date().toISOString(),
    };
  }
}
