const SERVER_ORIGIN = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

// Fire-and-forget — a failed/blocked playback (e.g. browser autoplay policy)
// should never interrupt the checkout flow.
export function playOrderPlacedSound() {
  try {
    const audio = new Audio(`${SERVER_ORIGIN}/uploads/sounds/order_placed_sound.mp3`);
    audio.play().catch(() => {});
  } catch {}
}
