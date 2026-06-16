import Header from "@/components/customer/Header";
import BottomNav from "@/components/customer/BottomNav";

export default function CustomerLayout({ children }) {
  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{ paddingBottom: "var(--bottom-nav-height)" }}
      >
        <div
          className="mx-auto px-4 md:px-6"
          style={{ maxWidth: "var(--max-content-width)" }}
        >
          {children}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
