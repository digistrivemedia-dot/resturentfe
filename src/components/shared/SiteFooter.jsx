import Link from "next/link";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Customers",
    links: [
      { label: "How It Works", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Track Order", href: "#" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
  {
    title: "Restaurants",
    links: [
      { label: "Partner With Us", href: "/restaurant/login" },
      { label: "Restaurant Login", href: "/restaurant/login" },
      { label: "Partner Support", href: "/contact" },
      { label: "Terms for Partners", href: "/terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <Image
                  src="/logo.png"
                  alt="Sri Isha Cafe logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-white">
                Sri Isha <span className="text-primary">Cafe</span>
              </span>
            </div>
            <p className="text-sm text-white/45 leading-relaxed max-w-xs">
              Connecting hungry customers with the best local restaurants. Fast, fresh, and reliable.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <a href="mailto:support@sriishacafe.com" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                <Mail size={13} /> support@sriishacafe.com
              </a>
              <a href="tel:+918000000000" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                <Phone size={13} /> +91 80000 00000
              </a>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <span>© 2026 Sri Isha Cafe. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
            <Link href="/privacy#cookies" className="hover:text-white/50 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
