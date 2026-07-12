import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">Contact</h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Enterprise demos, partnerships and support — we typically respond within
        one business day.
      </p>
      <form
        className="mt-8 space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6"
        action="mailto:hello@ratequip.com"
        method="get"
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" className="mt-1" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" className="mt-1" required />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="body" className="mt-1" required />
        </div>
        <Button type="submit">Send message</Button>
      </form>
    </div>
  );
}
