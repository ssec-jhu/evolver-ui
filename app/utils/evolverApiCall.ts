import type { RequestResult } from "@hey-api/client-fetch";
export async function evolverApiCall<T>(
  apiCall: () => RequestResult<T, unknown>,
  intent: string,
) {
  const { response, error, data } = await apiCall();

  if (response.status !== 200) {
    const detail = (error as { detail?: string })?.detail;
    let errorMessage = `Failed to ${intent}`;

    if (detail) {
      errorMessage += `. Device responded with: ${detail}`;
    }

    throw new Error(errorMessage);
  }

  return data as T;
}
