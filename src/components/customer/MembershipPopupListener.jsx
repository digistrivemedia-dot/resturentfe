"use client";

import { useEffect, useRef, useState } from "react";
import useAuthStore from "@/stores/authStore";
import api from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import MembershipModal from "@/components/customer/MembershipModal";

// Shows the membership popup when a super admin or restaurant owner has sent
// it to this customer — either because they're online right now (socket) or
// because it was sent while they were away (checked once on login/app open).
export default function MembershipPopupListener() {
  const { isAuthenticated, isInitialized, fetchMe } = useAuthStore();
  const [open, setOpen] = useState(false);
  const checkedRef = useRef(false);

  // Was it sent while the customer was away? Check once per app open, against
  // a freshly-fetched user — the cached "userInfo" cookie AuthInitializer
  // seeds the store with is a snapshot from login time and never gets updated
  // client-side, so it won't reflect a popup sent since then. Waiting for
  // isInitialized also means this runs after AuthInitializer's token refresh
  // has settled, so fetchMe() has a real access token to use.
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;
    if (checkedRef.current) return;
    checkedRef.current = true;
    fetchMe().then((freshUser) => {
      if (freshUser?.membershipPopupRequestedAt) setOpen(true);
    });
  }, [isAuthenticated, isInitialized, fetchMe]);

  // Live delivery if they're already using the app when it's sent. Waiting
  // for isInitialized (not just isAuthenticated) matters here: isAuthenticated
  // flips true immediately from the cached cookie, before AuthInitializer's
  // async token refresh finishes — connecting the socket that early sends no
  // access token, so the server lets the connection through unauthenticated
  // and it never joins this customer's room. Nothing re-connects it later.
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;
    const socket = connectSocket();
    if (!socket) return;

    const handler = () => setOpen(true);
    socket.on("membership_popup_requested", handler);
    return () => socket.off("membership_popup_requested", handler);
  }, [isAuthenticated, isInitialized]);

  function handleClose() {
    setOpen(false);
    api.put("/customer/membership-popup/seen").catch(() => {});
  }

  return <MembershipModal isOpen={open} onClose={handleClose} onPurchased={handleClose} />;
}
