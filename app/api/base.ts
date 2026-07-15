function getApiBaseUrlFromEnv(): string {
  // Single source of truth for API base URL.
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!base) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Define it in your environment (e.g. https://api.example.com/api/v1).",
    );
  }

  return base;
}

export class ApiError extends Error {
  status: number;
  url: string;
  body: unknown;

  constructor(
    message: string,
    args: { status: number; url: string; body: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = args.status;
    this.url = args.url;
    this.body = args.body;
  }
}

/** True when update failed because the session/token cookie is missing or invalid. */
export function isMissingSessionApiError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 ||
      error.status === 403 ||
      error.status === 404 ||
      error.status === 422)
  );
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred",
): string {
  if (
    error instanceof ApiError &&
    typeof error.body === "object" &&
    error.body !== null &&
    "error" in error.body &&
    typeof (error.body as { error: unknown }).error === "string"
  ) {
    return (error.body as { error: string }).error;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

export async function upsertApiRequest<T>(args: {
  hasExistingRequest: boolean;
  update: () => Promise<T>;
  create: () => Promise<T>;
}): Promise<T> {
  if (!args.hasExistingRequest) {
    return args.create();
  }

  try {
    return await args.update();
  } catch (error) {
    if (isMissingSessionApiError(error)) {
      return args.create();
    }
    throw error;
  }
}

export type PaginationT = {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
};

function buildApiUrl(endpoint: string): string {
  // Allow callers to pass a full URL when needed
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const base = getApiBaseUrlFromEnv().replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

async function doFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const defaultLocale =
    typeof document !== "undefined"
      ? document.documentElement.lang || "ar"
      : "ar";

  const { headers, ...fetchOptions } = options ?? {};
  const providedHeaders = new Headers(headers ?? undefined);
  const isFormDataBody =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  const reqHeaders = new Headers();
  if (!isFormDataBody) {
    reqHeaders.set("Content-Type", "application/json");
  }
  reqHeaders.set("Accept", "application/json");
  reqHeaders.set("Accept-Language", defaultLocale);
  reqHeaders.set("locale", defaultLocale);

  // Let caller override/extend.
  providedHeaders.forEach((value, key) => {
    reqHeaders.set(key, value);
  });

  const res = await fetch(url, {
    ...fetchOptions,
    headers: reqHeaders,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {
      // keep as text
    }

    throw new ApiError(`API Error: ${res.status} ${res.statusText}`, {
      status: res.status,
      url,
      body,
    });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = buildApiUrl(endpoint);

  // Client: include cookies for cross-origin session auth.
  if (typeof window !== "undefined") {
    return doFetch<T>(url, {
      ...(options ?? {}),
      credentials: options?.credentials ?? "include",
    });
  }

  // Server: forward incoming cookies (when present) so the API can read the
  // session cookie even for cross-origin upstream calls.
  const nextHeaders = new Headers(options?.headers ?? undefined);
  try {
    const { headers } = await import("next/headers");
    const incoming = await headers();
    const cookie = incoming.get("cookie");
    if (cookie && !nextHeaders.has("cookie")) {
      nextHeaders.set("cookie", cookie);
    }
  } catch {
    // ignore
  }

  return doFetch<T>(url, {
    ...(options ?? {}),
    headers: nextHeaders,
  });
}

// apiFetchViaProxy: same endpoint as apiFetch, but attaches token automatically.
// Client uses localStorage token; server uses HttpOnly cookie (when available).
export async function apiFetchViaProxy<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  // Deprecated: token/proxy-based auth is no longer used.
  // Keep this function as a compatibility alias.
  return apiFetch<T>(endpoint, options);
}
