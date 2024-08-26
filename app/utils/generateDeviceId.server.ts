export async function generateDeviceId(url: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);

  // Hash the URL using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert the hash to a base64 string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64String = btoa(String.fromCharCode(...hashArray));

  // Convert to a URL-safe string
  const urlSafeHash = base64String
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // truncate to a desired length
  const deviceId = urlSafeHash.substring(0, 5);

  return deviceId;
}
