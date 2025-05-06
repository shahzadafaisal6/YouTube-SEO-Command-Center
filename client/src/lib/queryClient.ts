import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonError = await res.json();
        console.error("API Error:", jsonError);
        throw new Error(jsonError.message || jsonError.error || `${res.status}: ${res.statusText}`);
      } else {
        // If not JSON, get as text
        const text = await res.text();
        console.error(`API Error (${res.status}):`, text || res.statusText);
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (e) {
      if (e instanceof Error) throw e;
      console.error("Unknown API Error:", res.statusText);
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export type ApiRequestOptions = {
  url: string;
  method: string;
  data?: unknown;
};

export async function apiRequest(options: ApiRequestOptions): Promise<any> {
  const { url, method, data } = options;
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Check if the response is JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
