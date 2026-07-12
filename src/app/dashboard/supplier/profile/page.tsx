import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCompanyBySlug } from "@/lib/db/queries";

export const metadata = { title: "Supplier profile editor" };

export default function SupplierProfilePage() {
  const company = getCompanyBySlug("nordicfill-systems")!;

  return (
    <DashboardShell role="supplier" title="Company profile">
      <form className="max-w-xl space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
        <div>
          <Label htmlFor="name">Company name</Label>
          <Input id="name" defaultValue={company.name} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" defaultValue={company.headline} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            defaultValue={company.description}
            className="mt-1"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" defaultValue={company.city} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" defaultValue={company.country} className="mt-1" />
          </div>
        </div>
        <Button type="button">Save profile</Button>
      </form>
    </DashboardShell>
  );
}
