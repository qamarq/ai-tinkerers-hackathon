/**
 * Utilities for handling ingredient weighing with the scale app
 */

interface ScaleMeasurement {
  id: number;
  status: string;
  weight: string | null;
  createdAt: string;
}

interface WeighingResult {
  success: boolean;
  weight?: number;
  error?: string;
}

/**
 * Creates a new weighing request and polls until weight is received
 * @param maxAttempts Maximum number of polling attempts (default: 60 = 5 minutes)
 * @param pollingInterval Polling interval in milliseconds (default: 5000 = 5 seconds)
 * @returns Promise with the weight measurement or error
 */
export async function requestWeighing(
  maxAttempts: number = 60,
  pollingInterval: number = 5000,
): Promise<WeighingResult> {
  try {
    // Step 1: Create a new pending measurement request
    const createResponse = await fetch("/api/scale/should-weigh", {
      method: "POST",
    });

    if (!createResponse.ok) {
      return {
        success: false,
        error: "Failed to create weighing request",
      };
    }

    const { measurement } = (await createResponse.json()) as {
      measurement: ScaleMeasurement;
    };

    // Step 2: Poll for the weight
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));

      const checkResponse = await fetch("/api/scale/should-weigh");
      if (!checkResponse.ok) continue;

      const { measurement: currentMeasurement } =
        (await checkResponse.json()) as {
          shouldWeigh: boolean;
          measurement: ScaleMeasurement | null;
        };

      // Check if our specific measurement has been completed
      if (
        currentMeasurement &&
        currentMeasurement.id === measurement.id &&
        currentMeasurement.status === "done" &&
        currentMeasurement.weight
      ) {
        return {
          success: true,
          weight: parseFloat(currentMeasurement.weight),
        };
      }
    }

    return {
      success: false,
      error: "Weighing timeout - no weight received",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Checks if there's currently a pending weighing request
 */
export async function hasPendingWeighing(): Promise<boolean> {
  try {
    const response = await fetch("/api/scale/should-weigh");
    if (!response.ok) return false;

    const { shouldWeigh } = (await response.json()) as { shouldWeigh: boolean };
    return shouldWeigh;
  } catch {
    return false;
  }
}
