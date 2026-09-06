import { startOutboxWorker } from "./outboxWorker";

/**
 * Worker Bootstrap
 * Starts the outbox worker when the application initializes.
 * Call this once during app startup (e.g., in App.jsx or main.jsx).
 */

export function initializeWorkers() {
  // Start the outbox worker for Tally integration
  startOutboxWorker();
  // Additional workers can be started here
}

// Auto-initialize if this module is imported in the browser context
if (typeof window !== "undefined") {
  initializeWorkers();
}
