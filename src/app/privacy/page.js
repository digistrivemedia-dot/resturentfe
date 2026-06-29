import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Sri Isha Cafe",
  description:
    "Learn how Sri Isha Cafe collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "June 29, 2026";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Information you provide",
        text: "When you create an account or place an order, we collect your name, email address, phone number, delivery address, and payment details. Payment card data is handled securely by our payment processor and is never stored on our servers.",
      },
      {
        subtitle: "Information collected automatically",
        text: "We collect device information (browser type, operating system, IP address), usage data (pages visited, links clicked, time spent), and location data when you grant permission — used solely to show nearby restaurants and estimate delivery times.",
      },
      {
        subtitle: "Information from third parties",
        text: "If you choose to sign in with Google, we receive your name, email address, and profile picture as permitted by your Google account settings.",
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Your Information",
    content: [
      {
        text: "We use your information to: process and deliver your orders; send order confirmations, receipts, and delivery updates; improve our platform and personalise your experience; respond to your support requests; send promotional offers (you can opt out any time); detect and prevent fraud; and comply with applicable legal obligations.",
      },
    ],
  },
  {
    id: "sharing-information",
    title: "3. Sharing Your Information",
    content: [
      {
        text: "We share your information only as necessary to operate the platform:",
      },
      {
        subtitle: "Restaurants",
        text: "Your name, delivery address, and order details are shared with the restaurant preparing your order.",
      },
      {
        subtitle: "Delivery partners",
        text: "Your name, delivery address, and phone number (masked where possible) are shared with the delivery partner assigned to your order.",
      },
      {
        subtitle: "Service providers",
        text: "We work with third-party service providers for payments, analytics, and customer support. These providers are contractually obligated to protect your data and may not use it for their own purposes.",
      },
      {
        subtitle: "Legal requirements",
        text: "We may disclose your information if required by law, court order, or government authority.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "4. Data Retention",
    content: [
      {
        text: "We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us. We may retain certain information for up to 7 years for legal, tax, or fraud-prevention purposes.",
      },
    ],
  },
  {
    id: "security",
    title: "5. Security",
    content: [
      {
        text: "We use industry-standard encryption (TLS) for data in transit and encrypt sensitive data at rest. Access to personal data is limited to authorised personnel. While we take security seriously, no method of transmission over the Internet is 100% secure — we cannot guarantee absolute security.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: [
      {
        text: "You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data; opt out of marketing communications; and lodge a complaint with the relevant data protection authority. To exercise any of these rights, contact us at privacy@sriishacafe.com.",
      },
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies",
    content: [
      {
        text: "We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how our platform is used. You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of our platform.",
      },
    ],
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    content: [
      {
        text: "We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a prominent notice on our platform at least 7 days before the change takes effect. Continued use of our services after the effective date constitutes acceptance of the updated policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: [
      {
        text: "If you have questions or concerns about this Privacy Policy, please contact our Data Protection Officer at privacy@sriishacafe.com or write to us at: Sri Isha Cafe, Customer Support, Tamil Nadu, India.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-family)" }}>

      {/* Header */}
      <header className="border-b border-border-light bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image src="/logo.png" alt="Sri Isha Cafe" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-sm text-text-primary hidden sm:inline">
              Sri Isha <span className="text-primary">Cafe</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors">
            <ArrowLeft size={13} /> Back to home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-16">

        {/* Hero */}
        <div className="mb-12">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
            <Shield size={20} className="text-primary" strokeWidth={1.8} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3">Privacy Policy</h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
            Your privacy matters to us. This policy explains how Sri Isha Cafe collects, uses, and protects your personal information when you use our platform.
          </p>
          <p className="text-xs text-text-tertiary mt-4">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Table of contents */}
        <div className="bg-bg-secondary rounded-2xl p-5 mb-10 border border-border-light">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest mb-3">Contents</p>
          <ol className="space-y-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-text-secondary hover:text-primary transition-colors hover:underline underline-offset-2">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border-light">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.content.map((block, i) => (
                  <div key={i}>
                    {block.subtitle && (
                      <p className="text-sm font-semibold text-text-primary mb-1">{block.subtitle}</p>
                    )}
                    <p className="text-sm text-text-secondary leading-relaxed">{block.text}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="mt-14 pt-8 border-t border-border-light flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">© 2026 Sri Isha Cafe. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/terms" className="text-text-tertiary hover:text-primary transition-colors">Terms of Service</Link>
            <span className="text-border-light">|</span>
            <Link href="/privacy" className="text-primary font-semibold">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
