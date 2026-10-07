import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { type ReportKind, ReportForm } from "@/components/ReportForm";

export const metadata: Metadata = pageMeta("/contact");

/** Ready-made starts for links elsewhere on the site (`/contact?topic=…`). */
const TOPICS: Record<string, { kind: ReportKind; message: string }> = {
  "site-license": {
    kind: "question",
    message:
      "Site license inquiry\n\nOrganization:\nNumber of people:\nOnline, or an air-gapped network:\n\nAnything else:\n",
  },
  bug: { kind: "bug", message: "" },
  question: { kind: "question", message: "" },
};

export default async function Contact({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const start = (topic && Object.hasOwn(TOPICS, topic) ? TOPICS[topic] : undefined) ?? TOPICS.bug;
  return (
    <div className="page prose">
      <header className="center">
        <p className="eyebrow">Contact</p>
        <h1>Report a problem or ask a question</h1>
        <p className="lead">
          Tell us what went wrong, or what you&apos;d like to know. Site license inquiries are welcome here too.
        </p>
      </header>
      <ReportForm key={topic ?? ""} kind={start.kind} message={start.message} />
    </div>
  );
}
