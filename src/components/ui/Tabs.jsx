"use client";

import { useState } from "react";

export default function Tabs({
  tabs = [],
  defaultTab,
  onChange,
  variant = "underline",
  className = "",
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);

  const handleTabClick = (value) => {
    setActiveTab(value);
    onChange?.(value);
  };

  const activeContent = tabs.find((t) => t.value === activeTab)?.content;

  const variants = {
    underline: {
      container: "border-b border-border-light",
      tab: "px-4 py-2.5 text-sm font-medium transition-colors relative",
      active:
        "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary",
      inactive: "text-text-secondary hover:text-text-primary",
    },
    pills: {
      container: "bg-bg-secondary rounded-[var(--radius-lg)] p-1 gap-1",
      tab: "px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all",
      active: "bg-bg-primary text-text-primary shadow-[var(--shadow-sm)]",
      inactive: "text-text-secondary hover:text-text-primary",
    },
  };

  const style = variants[variant] || variants.underline;

  return (
    <div className={className}>
      <div className={`flex ${style.container}`}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`
              ${style.tab}
              ${activeTab === tab.value ? style.active : style.inactive}
              cursor-pointer select-none
            `}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs bg-bg-tertiary px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {activeContent && <div className="mt-4">{activeContent}</div>}
    </div>
  );
}
