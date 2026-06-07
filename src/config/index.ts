export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1",
  },
} as const;
