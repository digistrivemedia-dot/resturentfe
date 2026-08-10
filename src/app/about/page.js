import Link from "next/link";
import {
  Heart,
  Target,
  Users,
  ShieldCheck,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";

export const metadata = {
  title: "About Us — Sri Isha Cafe",
  description:
    "Learn about Sri Isha Cafe's mission to connect hungry customers with the best local restaurants.",
};

const STATS = [
  { value: "500+", label: "Partner Restaurants" },
  { value: "50K+", label: "Happy Customers" },
  { value: "30 min", label: "Avg. Delivery Time" },
  { value: "4.8", label: "Average Rating" },
];

const VALUES = [
  {
    Icon: Heart,
    title: "Customer First",
    desc: "Every decision we make starts with what's best for the people ordering their next meal.",
  },
  {
    Icon: ShieldCheck,
    title: "Trust & Quality",
    desc: "We vet every partner restaurant so you can order with confidence, every single time.",
  },
  {
    Icon: Users,
    title: "Community",
    desc: "We grow by helping local restaurants thrive and reach more of their neighbours.",
  },
  {
    Icon: Target,
    title: "Reliability",
    desc: "Real-time tracking and dependable delivery partners keep every promise we make.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "var(--font-family)" }}>
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#FFF8F5] hidden lg:block" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full border border-primary/20 mb-6">
            <UtensilsCrossed size={13} />
            About Sri Isha Cafe
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary leading-[1.15] tracking-tight mb-5">
            Bringing great food<br />
            <span className="text-primary">closer to you.</span>
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Sri Isha Cafe is a food delivery and dine-in platform connecting hungry customers with
            the best local restaurants — fast delivery, transparent pricing, and a seamless
            ordering experience from browse to doorstep.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-6 md:px-10 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 text-center">Our Story</p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 text-center">Why we started Sri Isha Cafe</h2>
          <div className="space-y-4 text-sm md:text-base text-text-secondary leading-relaxed">
            <p>
              We noticed a gap between great local restaurants and the customers who wanted to
              discover them. Restaurants struggled to reach new diners, and customers struggled to
              find reliable, fast delivery from places they could trust.
            </p>
            <p>
              Sri Isha Cafe was built to close that gap — a platform where restaurants get the
              tools to manage orders, menus, and growth, and customers get a simple, dependable way
              to order food they&apos;ll love, every time.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs font-medium text-white/65 mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">What We Stand For</p>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Our values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-bg-secondary border border-border-light hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon size={20} className="text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-text-primary mb-2 text-sm">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 md:px-10 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-8 md:px-14 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 opacity-[0.07]" style={{
              backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "28px 28px"
            }} />
            <div className="relative text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">Get In Touch</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Have a question for us?</h2>
              <p className="text-white/75 max-w-md text-sm leading-relaxed">
                We&apos;d love to hear from you — reach out and our team will get back to you shortly.
              </p>
            </div>
            <Link
              href="/contact"
              className="relative shrink-0 h-12 px-8 bg-white text-primary font-bold rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2 text-sm whitespace-nowrap shadow-sm"
            >
              Contact Us <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
