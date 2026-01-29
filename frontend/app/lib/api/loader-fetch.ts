/**
 * Wrapper for API calls in loaders that converts Axios errors to Response throws.
 * This allows React Router's ErrorBoundary to handle API errors properly.
 */
export async function loaderFetch<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const axiosError = error as {
      response?: {
        status?: number;
        statusText?: string;
        data?: { message?: string };
      };
    };
    if (axiosError.response?.status) {
      throw new Response(
        axiosError.response.data?.message || axiosError.response.statusText || "Error",
        { status: axiosError.response.status }
      );
    }
    throw error;
  }
}
