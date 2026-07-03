import { Construction } from "lucide-react";

/**
 * ComingSoon — shown in place of placeholder pages.
 * Code for each page is preserved; flip FEATURE_LIVE = true to re-enable.
 */
export default function ComingSoon({ title = "This Feature", description }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm mx-auto px-6">
        <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-border-light flex items-center justify-center mx-auto mb-5">
          <Construction size={28} className="text-text-tertiary" strokeWidth={1.5} />
        </div>
        <span className="inline-block text-xs font-semibold text-warning-dark bg-warning-light px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
          Coming Soon
        </span>
        <h2 className="text-lg font-bold text-text-primary mb-2">{title}</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {description || "This section is under development and will be available in a future update."}
        </p>
      </div>
    </div>
  );
}
