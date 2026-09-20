import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import { handleClientTrpcFallback } from "@/lib/clientFallbackStore";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const getTrpcApiUrl = () => {
  // 1. Check if an external backend URL is specified via Vite env var:
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, "")}/api/trpc`;
  }

  // 2. Check if a custom backend URL was configured in localStorage:
  if (typeof window !== "undefined") {
    const custom = window.localStorage.getItem("gb_api_url");
    if (custom) {
      return `${custom.replace(/\/$/, "")}/api/trpc`;
    }
  }

  // 3. Same-origin fallback:
  return "/api/trpc";
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getTrpcApiUrl(),
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      async fetch(input, init) {
        try {
          const response = await globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
          });

          // Inspect the response to verify it is valid JSON and not static host HTML
          const contentType = (response.headers.get("content-type") || "").toLowerCase();

          // If status is not 200/201 or content-type looks like HTML, inspect safely
          if (!response.ok || contentType.includes("text/html") || contentType.includes("text/plain")) {
            const cloned = response.clone();
            const text = await cloned.text();
            const trimmed = text.trim().toLowerCase();
            if (
              trimmed.startsWith("<!doctype") ||
              trimmed.startsWith("<html") ||
              trimmed.startsWith("<?xml") ||
              (!trimmed.startsWith("[") && !trimmed.startsWith("{"))
            ) {
              console.warn(
                "[Client Fallback] Server returned HTML / non-JSON (typical on Netlify static deploy). Handling via local store fallback."
              );
              return handleClientTrpcFallback(input, init);
            }
          }

          return response;
        } catch (netErr) {
          console.warn(
            "[Client Fallback] API network request failed. Handling via local store fallback.",
            netErr
          );
          return handleClientTrpcFallback(input, init);
        }
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
