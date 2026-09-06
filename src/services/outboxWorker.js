import { outboxService } from "./outboxService";

/**
 * Outbox Worker
 * Background job that processes the Tally integration outbox.
 * Simulates sending to Tally; in production, replace with actual Tally API call.
 */

const PROCESSING_INTERVAL_MS = 5000; // 5 seconds
let workerInterval = null;

async function processItem(item) {
  // item shape from claimTallyItem: array with fields
  // We'll assume item is an object with properties: outbox_id, event_id, event_type, external_reference, payload, attempts
  console.log("[OutboxWorker] Processing item", item.outbox_id);
  // Simulate Tally API call
  const success = Math.random() > 0.1; // 90% success rate for simulation
  let errorText = null;
  let requiresReview = false;
  if (!success) {
    errorText = "Simulated Tally connection failure";
    // after a few failures, maybe require review
    if (item.attempts >= 3) {
      requiresReview = true;
    }
  }
  try {
    await outboxService.completeTallyItem(
      item.outbox_id,
      success,
      item.external_reference,
      errorText,
      requiresReview
    );
    console.log("[OutboxWorker] Completed item", item.outbox_id, success ? "success" : "failure");
  } catch (err) {
    console.error("[OutboxWorker] Error completing item", item.outbox_id, err);
  }
}

async function workerTick() {
  try {
    const claimed = await outboxService.claimTallyItem();
    if (claimed && Array.isArray(claimed) && claimed.length > 0) {
      // claimTallyItem returns array of rows; we expect one row per call due to locking
      for (const item of claimed) {
        await processItem(item);
      }
    }
    // else no items to process
  } catch (err) {
    console.error("[OutboxWorker] Error in worker tick", err);
  }
}

export function startOutboxWorker() {
  if (workerInterval !== null) {
    console.warn("[OutboxWorker] Worker already started");
    return;
  }
  console.log("[OutboxWorker] Starting outbox worker");
  workerInterval = setInterval(workerTick, PROCESSING_INTERVAL_MS);
  // Run immediately on start
  workerTick();
}

export function stopOutboxWorker() {
  if (workerInterval !== null) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log("[OutboxWorker] Stopped outbox worker");
  }
}

// Auto-start when module is loaded (in browser)
if (typeof window !== "undefined") {
  startOutboxWorker();
}
