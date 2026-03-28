import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const MESHY_API_BASE = "https://api.meshy.ai/openapi/v2/text-to-3d";

function getApiKey(): string {
  const key = process.env.MESH_API_KEY;
  if (!key) throw new Error("MESH_API_KEY environment variable is not set");
  return key;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

export interface MeshyTaskResponse {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress: number;
  model_urls?: { glb?: string; fbx?: string; obj?: string };
  task_error?: { message: string };
}

export async function createPreviewTask(prompt: string): Promise<string> {
  console.log("[meshy] Creating preview task with prompt:", prompt);

  const response = await fetch(MESHY_API_BASE, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      mode: "preview",
      prompt,
      negative_prompt: "low quality, low resolution, low poly, ugly",
      should_remesh: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Meshy API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  console.log("[meshy] Preview task created, ID:", data.result);
  return data.result;
}

export async function getTaskStatus(
  taskId: string,
): Promise<MeshyTaskResponse> {
  const response = await fetch(`${MESHY_API_BASE}/${taskId}`, {
    method: "GET",
    headers: headers(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Meshy API poll error (${response.status}): ${body}`);
  }

  const data: MeshyTaskResponse = await response.json();
  console.log("[meshy] Poll status:", {
    taskId,
    status: data.status,
    progress: data.progress,
    hasModelUrls: !!data.model_urls?.glb,
  });
  return data;
}

export async function downloadGlbFile(
  url: string,
  filename: string,
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download GLB: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  const modelsDir = join(process.cwd(), "public", "models");
  await mkdir(modelsDir, { recursive: true });

  const filePath = join(modelsDir, `${filename}.glb`);
  await writeFile(filePath, buffer);

  const publicPath = `/models/${filename}.glb`;
  console.log("[meshy] GLB downloaded:", {
    from: url,
    to: filePath,
    publicPath,
    size: buffer.length,
  });
  return publicPath;
}
