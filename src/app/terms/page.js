import Link from "next/link";
import Image from "next/image";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Sri Isha Cafe",
  description:
    "Read the Terms of Service governing your use of the Sri Isha Cafe platform.",
};

const LAST_UPDATED = "June 29, 2026";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      {
        text: "By accessing or using the Sri Isha Cafe platform — including our website, mobile application, and related services — you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.",
      },
      {
        text: "We may update these terms from time to time. Continued use of the platform after updates constitutes acceptance. We will notify you of material changes via email or a prominent notice on our platform.",
      },
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: [
      {
        text: "You must be at least 18 years old to use our platform. By using our services, you represent that you are 18 or older and that you have the legal capacity to enter into a binding agreement. If you are using the platform on behalf of a business, you represent that you have the authority to bind that business to these terms.",
      },
    ],
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    content: [
      {
        subtitle: "Account registration",
        text: "To place orders, you must create an account using a valid email address or phone number. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
      },
      {
        subtitle: "Account accuracy",
        text: "You agree to provide accurate, current, and complete information and to keep your account information up to date. Providing false information may result in suspension or termination of your account.",
      },
      {
        subtitle: "Account security",
        text: "Notify us immediately at support@sriishacafe.com if you suspect unauthorised access to your account. We are not liable for any loss resulting from unauthorised use of your account.",
      },
    ],
  },
  {
    id: "orders",
    title: "4. Orders and Payments",
    content: [
      {
        subtitle: "Placing orders",
        text: "When you place an order through our platform, you are making an offer to purchase food from the restaurant. The order is confirmed once you receive an order confirmation from us. We reserve the right to cancel any order if the restaurant is unable to fulfil it.",
      },
      {
        subtitle: "Pricing",
        text: "Menu prices are set by the individual restaurants and may change without notice. Delivery fees, platform fees, and applicable taxes are displayed before you confirm your order. The total amount charged will be as shown at checkout.",
      },
      {
        subtitle: "Payments",
        text: "We accept major credit/debit cards, UPI, net banking, and select digital wallets. All payments are processed securely by our payment partners. By providing payment details, you authorise us to charge the total order amount.",
      },
      {
        subtitle: "Refunds and cancellations",
        text: "Once an order is confirmed and the restaurant has begun preparation, cancellation may not be possible. Refunds are processed in accordance with our Refund Policy, which is available on our platform. Refunds are credited to the original payment method within 5–7 business days.",
      },
    ],
  },
  {
    id: "delivery",
    title: "5. Delivery",
    content: [
      {
        text: "Delivery times are estimates and may vary due to factors beyond our control, including traffic, weather, and restaurant preparation time. We are not responsible for delays caused by these factors. You are responsible for providing an accurate and accessible delivery address. If delivery is not possible due to an incorrect address, you may not be eligible for a refund.",
      },
    ],
  },
  {
    id: "prohibited",
    title: "6. Prohibited Conduct",
    content: [
      {
        text: "You agree not to:",
      },
      {
        text: "• Use the platform for any unlawful purpose or in violation of any applicable laws.\n• Place fraudulent orders or provide false payment information.\n• Harass, abuse, or threaten restaurant staff, delivery partners, or our employees.\n• Attempt to gain unauthorised access to any part of the platform or other users' accounts.\n• Use automated tools (bots, scrapers) to access or extract data from our platform.\n• Post or share any content that is defamatory, obscene, or infringes third-party rights.",
      },
      {
        text: "Violation of these prohibitions may result in immediate suspension or termination of your account and, where appropriate, legal action.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property",
    content: [
      {
        text: "All content on the Sri Isha Cafe platform — including logos, text, graphics, images, and software — is the property of Sri Isha Cafe or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without prior written permission.",
      },
    ],
  },
  {
    id: "disclaimers",
    title: "8. Disclaimers",
    content: [
      {
        text: "Our platform is provided on an \"as is\" and \"as available\" basis. We do not warrant that the platform will be uninterrupted, error-free, or free of viruses. Restaurant menus, prices, and availability are managed by the restaurants themselves — we do not guarantee their accuracy.",
      },
      {
        text: "We are a marketplace platform and are not the manufacturer or preparer of food items. We are not responsible for the quality, safety, or content of food prepared by restaurants.",
      },
    ],
  },
  {
    id: "limitation",
    title: "9. Limitation of Liability",
    content: [
      {
        text: "To the maximum extent permitted by applicable law, Sri Isha Cafe shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the platform. Our total liability to you for any claim arising under these terms shall not exceed the amount paid by you for the order giving rise to the claim.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "10. Governing Law",
    content: [
      {
        text: "These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts located in Tamil Nadu, India.",
      },
    ],
  },
  {
    id: "contact",
    title: "11. Contact Us",
    content: [
      {
        text: "If you have questions about these Terms of Service, please contact us at support@sriishacafe.com or write to: Sri Isha Cafe, Customer Support, Tamil Nadu, India.",
      },
    ],
  },
];

export default function TermsOfServicePage() {
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
            <FileText size={20} className="text-primary" strokeWidth={1.8} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3">Terms of Service</h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
            These terms govern your use of the Sri Isha Cafe platform. Please read them carefully before placing an order or using our services.
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
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{block.text}</p>
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
            <Link href="/terms" className="text-primary font-semibold">Terms of Service</Link>
            <span className="text-border-light">|</span>
            <Link href="/privacy" className="text-text-tertiary hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
