import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Ben Hubbard",
  description: "What this site collects, and what happens to it.",
};

/**
 * Placeholder copy. The contact form posts to Supabase and sends mail through
 * Resend, so those two are named below — but retention, analytics and rights
 * are Ben's to state, not mine to assume.
 */
const sections = [
  {
    heading: "What this site collects",
    body: "TODO — write this. The contact form stores name, email, topic and message in Supabase and sends them on by email through Resend. Say whether anything else is collected.",
  },
  {
    heading: "Analytics",
    body: "TODO — write this, or drop the section if you run none.",
  },
  {
    heading: "How long it's kept",
    body: "TODO — write this. How long contact submissions are retained.",
  },
  {
    heading: "Third parties",
    body: "TODO — write this. Supabase and Resend handle form submissions; Netlify hosts the site. Name anything else, and link their policies if you want to.",
  },
  {
    heading: "Getting your data removed",
    body: "TODO — write this. How someone asks for their submission to be deleted.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-16 pb-8">
      <h1 className="font-display text-h1 mb-6">Privacy Policy</h1>

      <p className="text-lg text-gray-600 max-w-[60ch] mb-16">
        TODO — write this. A line or two on what this page covers.
      </p>

      {sections.map((section) => (
        <section key={section.heading} className="mb-12">
          <h3 className="text-h3 mb-3">{section.heading}</h3>
          <p className="text-gray-600 max-w-[60ch]">{section.body}</p>
        </section>
      ))}
    </main>
  );
}
