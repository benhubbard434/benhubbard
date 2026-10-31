/**
 * The questions on the website project brief (/website-brief). The page
 * renders from this list and the API route rebuilds the email from it, so
 * a question added here shows up in both without touching either.
 */

export type BriefField = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
} & (
  | { type: "text" | "email" | "url" | "date"; placeholder?: string }
  | { type: "textarea"; placeholder?: string; rows?: number }
  | { type: "choice" | "multi"; options: string[] }
);

export type BriefSection = {
  id: string;
  title: string;
  intro: string;
  fields: BriefField[];
};

export const briefSections: BriefSection[] = [
  {
    id: "you",
    title: "About you",
    intro: "Who I'll be working with, and how to reach you.",
    fields: [
      { id: "name", type: "text", label: "Your name", required: true, placeholder: "Full name" },
      { id: "email", type: "email", label: "Email", required: true, placeholder: "you@company.com" },
      { id: "phone", type: "text", label: "Phone", placeholder: "07…" },
      {
        id: "organisation",
        type: "text",
        label: "Business or organisation name",
        required: true,
        placeholder: "Company name",
      },
      { id: "role", type: "text", label: "Your role", placeholder: "e.g. Founder, Marketing lead" },
      { id: "currentSite", type: "url", label: "Current website, if you have one", placeholder: "https://" },
      { id: "referral", type: "text", label: "How did you hear about me?" },
    ],
  },
  {
    id: "business",
    title: "Your business",
    intro: "The more I understand what you do, the better the site can say it.",
    fields: [
      {
        id: "summary",
        type: "textarea",
        label: "What does your business do, in a sentence or two?",
        required: true,
        rows: 3,
      },
      { id: "offer", type: "textarea", label: "What are your main products or services?", rows: 3 },
      {
        id: "difference",
        type: "textarea",
        label: "What makes you different from others who do the same thing?",
        rows: 3,
      },
      {
        id: "competitors",
        type: "textarea",
        label: "Who are your main competitors?",
        hint: "Links to their websites are really useful.",
        rows: 3,
      },
      {
        id: "personality",
        type: "text",
        label: "Three words that describe your brand's personality",
        placeholder: "e.g. friendly, expert, calm",
      },
    ],
  },
  {
    id: "goals",
    title: "Project goals",
    intro: "What the site is for, and how we'll know it's working.",
    fields: [
      {
        id: "projectType",
        type: "choice",
        label: "What kind of project is this?",
        required: true,
        options: [
          "Brand new website",
          "Redesign of an existing site",
          "Single landing page",
          "Online shop",
          "Portfolio",
          "Not sure yet",
        ],
      },
      { id: "whyNow", type: "textarea", label: "What's prompted this project now?", rows: 3 },
      {
        id: "goals",
        type: "multi",
        label: "What should the website achieve?",
        hint: "Pick as many as apply.",
        options: [
          "Generate leads or enquiries",
          "Sell products online",
          "Take bookings",
          "Build credibility and trust",
          "Share information",
          "Showcase work",
          "Grow a mailing list",
          "Recruit people",
          "Build a community",
        ],
      },
      {
        id: "primaryAction",
        type: "textarea",
        label: "What's the one thing you most want a visitor to do?",
        hint: "e.g. book a call, buy, sign up, get in touch.",
        required: true,
        rows: 2,
      },
      {
        id: "success",
        type: "textarea",
        label: "How will you measure success six months after launch?",
        rows: 2,
      },
      {
        id: "currentProblems",
        type: "textarea",
        label: "If you have a site already: what works, and what doesn't?",
        rows: 3,
      },
    ],
  },
  {
    id: "audience",
    title: "Your audience",
    intro: "Who the site is really for.",
    fields: [
      {
        id: "idealVisitor",
        type: "textarea",
        label: "Describe your ideal customer or visitor",
        hint: "Age, job, location, what they care about — whatever matters.",
        required: true,
        rows: 3,
      },
      {
        id: "visitorNeeds",
        type: "textarea",
        label: "What are they looking for when they land on your site?",
        hint: "The questions they need answered before they act.",
        rows: 3,
      },
      {
        id: "discovery",
        type: "multi",
        label: "How do people usually find you?",
        options: ["Google search", "Social media", "Word of mouth", "Ads", "Events", "Email", "Other"],
      },
      {
        id: "regions",
        type: "text",
        label: "Which countries or languages do you need to serve?",
        placeholder: "e.g. UK only, English",
      },
    ],
  },
  {
    id: "content",
    title: "Content & pages",
    intro: "What goes on the site, and who's creating it.",
    fields: [
      {
        id: "pages",
        type: "multi",
        label: "Which pages do you think you'll need?",
        options: [
          "Home",
          "About",
          "Services",
          "Portfolio / case studies",
          "Shop",
          "Pricing",
          "Blog / news",
          "Testimonials",
          "FAQ",
          "Team",
          "Careers",
          "Contact",
        ],
      },
      { id: "otherPages", type: "text", label: "Any other pages?" },
      {
        id: "copy",
        type: "choice",
        label: "Who will write the words?",
        options: ["I'll provide it", "I'd like help writing it", "A mix of both", "Not sure yet"],
      },
      {
        id: "imagery",
        type: "choice",
        label: "Do you have photos or video to use?",
        options: [
          "Yes, professional photography",
          "Some, but it needs work",
          "No — we'll need stock or a shoot",
          "Not sure",
        ],
      },
      {
        id: "migration",
        type: "textarea",
        label: "Is there existing content that needs moving across?",
        hint: "Blog posts, products, documents, roughly how many.",
        rows: 2,
      },
      {
        id: "updates",
        type: "textarea",
        label: "After launch, how often will content change, and who'll update it?",
        rows: 2,
      },
    ],
  },
  {
    id: "design",
    title: "Look & feel",
    intro: "Your taste and your brand.",
    fields: [
      {
        id: "brandAssets",
        type: "choice",
        label: "Do you have an existing brand?",
        options: [
          "Yes — full brand guidelines",
          "Logo and colours only",
          "Logo only",
          "No, I need help with this too",
        ],
      },
      {
        id: "likes",
        type: "textarea",
        label: "Websites you love, and what you like about them",
        hint: "They don't need to be in your industry.",
        rows: 4,
      },
      { id: "dislikes", type: "textarea", label: "Websites or styles you don't like", rows: 3 },
      {
        id: "feel",
        type: "text",
        label: "How should people feel when they visit?",
        placeholder: "e.g. reassured, excited, impressed",
      },
      { id: "avoid", type: "textarea", label: "Anything to avoid?", hint: "Colours, imagery, tone.", rows: 2 },
    ],
  },
  {
    id: "features",
    title: "Features",
    intro: "What the site needs to do, beyond showing pages.",
    fields: [
      {
        id: "features",
        type: "multi",
        label: "Which of these do you need?",
        options: [
          "Contact form",
          "Bookings / appointments",
          "Online payments",
          "Product catalogue / shop",
          "Newsletter sign-up",
          "Blog you can edit yourself",
          "Member logins",
          "Search",
          "Events calendar",
          "Maps / locations",
          "Social media feeds",
          "Live chat",
          "Multiple languages",
        ],
      },
      {
        id: "tools",
        type: "textarea",
        label: "Which tools does the site need to work with?",
        hint: "e.g. Mailchimp, HubSpot, Calendly, Stripe, Shopify, Xero.",
        rows: 2,
      },
      {
        id: "seo",
        type: "choice",
        label: "How important is ranking on Google?",
        options: ["Critical", "Important", "Nice to have", "Not a priority"],
      },
      {
        id: "compliance",
        type: "textarea",
        label: "Any legal, accessibility or industry requirements?",
        hint: "e.g. GDPR, cookie consent, WCAG accessibility, regulated sector.",
        rows: 2,
      },
    ],
  },
  {
    id: "technical",
    title: "Technical",
    intro: "Domains, hosting and looking after the site.",
    fields: [
      {
        id: "domain",
        type: "choice",
        label: "Do you own a domain name?",
        options: ["Yes", "No, I need one", "Not sure"],
      },
      {
        id: "hosting",
        type: "text",
        label: "Where is your current site and email hosted, if you know?",
        placeholder: "e.g. Wix, Squarespace, GoDaddy, Google Workspace",
      },
      {
        id: "logins",
        type: "choice",
        label: "Do you have access to your domain and hosting accounts?",
        options: ["Yes", "Someone else manages them", "No / not sure", "Not applicable"],
      },
      {
        id: "maintenance",
        type: "choice",
        label: "After launch, who'll look after the site?",
        options: [
          "We'll manage it ourselves",
          "I'd like ongoing support from you",
          "Not sure yet",
        ],
      },
    ],
  },
  {
    id: "budget",
    title: "Budget & timeline",
    intro: "So I can suggest the right shape of project.",
    fields: [
      {
        id: "budget",
        type: "choice",
        label: "What budget do you have in mind?",
        required: true,
        options: ["Under £500", "£500 – £1,000", "£1,000 – £3,000", "£3,000 – £5,000", "£5,000+", "Not sure yet"],
      },
      { id: "launchDate", type: "date", label: "Ideal launch date" },
      {
        id: "deadline",
        type: "textarea",
        label: "Is there a hard deadline? What's driving it?",
        hint: "e.g. a product launch, event or campaign.",
        rows: 2,
      },
      {
        id: "decisionMakers",
        type: "text",
        label: "Who else is involved in decisions and sign-off?",
      },
      { id: "anythingElse", type: "textarea", label: "Anything else I should know?", rows: 4 },
    ],
  },
];

export type BriefAnswers = Record<string, string | string[]>;

export function isAnswered(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.length > 0 : !!value?.trim();
}
