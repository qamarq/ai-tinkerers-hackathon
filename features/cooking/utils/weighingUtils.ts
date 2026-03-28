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
 * Creates a new weighing request and polls until no pending records remain,
 * then fetches the most recent completed measurement.
 * @param maxAttempts Maximum number of polling attempts (default: 10)
 * @param pollingInterval Polling interval in milliseconds (default: 5000 = 5 seconds)
 * @returns Promise with the weight measurement or error
 */
export async function requestWeighing(
  maxAttempts: number = 10,
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

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));

      const checkResponse = await fetch("/api/scale/should-weigh");
      if (!checkResponse.ok) continue;

      const { shouldWeigh } = (await checkResponse.json()) as {
        shouldWeigh: boolean;
      };

      if (!shouldWeigh) {
        const weightResponse = await fetch("/api/scale/weight");
        if (!weightResponse.ok) {
          return { success: false, error: "Failed to fetch weight result" };
        }

        const { measurement } = (await weightResponse.json()) as {
          measurement: ScaleMeasurement | null;
        };

        if (measurement?.weight) {
          return {
            success: true,
            weight: parseFloat(measurement.weight),
          };
        }

        return { success: false, error: "No completed measurement found" };
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
