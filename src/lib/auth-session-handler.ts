import { toast } from 'sonner';

let unauthorizedHandler: (() => void) | null = null;
let isHandlingUnauthorized = false;

export function registerUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn;
}

export function handleUnauthorized() {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  unauthorizedHandler?.();

  if (window.location.pathname !== '/login') {
    toast.error('Session expired. Please sign in again.');
  }

  setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 1000);
}
