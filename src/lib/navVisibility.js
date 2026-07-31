// Paths where the mobile bottom nav bar is hidden — shared by BottomNav (to decide
// whether to render) and the customer layout (to decide whether to reserve space for it).
const HIDE_BOTTOM_NAV_PATHS = ["/login", "/verify-otp", "/complete-profile", "/checkout", "/payment", "/quick-order/location"];

export function isBottomNavHidden(pathname) {
  if (HIDE_BOTTOM_NAV_PATHS.some((path) => pathname.startsWith(path))) return true;
  if (/\/order\/.*\/track/.test(pathname)) return true;
  return false;
}
