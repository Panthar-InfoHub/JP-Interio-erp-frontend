/**
 * Tells the other open tabs that this person logged out, so they leave at once
 * instead of on their next API call.
 */
const CHANNEL_NAME = "jp-interio-auth";

type AuthMessage = { type: "signed-out" };

function openChannel(): BroadcastChannel | null {
  return typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL_NAME);
}

export function announceSignedOut(): void {
  const channel = openChannel();
  channel?.postMessage({ type: "signed-out" } satisfies AuthMessage);
  channel?.close();
}

/** Calls `onSignedOut` when another tab logs out. Returns the clean-up function. */
export function listenForSignOut(onSignedOut: () => void): () => void {
  const channel = openChannel();
  if (!channel) return () => {};
  channel.onmessage = (event: MessageEvent<AuthMessage>) => {
    if (event.data?.type === "signed-out") onSignedOut();
  };
  return () => channel.close();
}
