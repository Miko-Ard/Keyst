/**
 * Retrieves or creates a unique anonymous device ID for the current browser session.
 * Stored persistently in localStorage under 'keyst_device_id'.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "default";

  try {
    let id = localStorage.getItem("keyst_device_id");
    if (!id) {
      const randomUuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

      id = `dev_${randomUuid}`;
      localStorage.setItem("keyst_device_id", id);
    }
    return id;
  } catch {
    return "default";
  }
}
