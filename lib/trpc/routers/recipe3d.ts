import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { db, eq } from "@/db";
import { recipe3dTasksTable } from "@/db/schema/recipe3dTasks";
import {
  createPreviewTask,
  downloadGlbFile,
  getTaskStatus,
} from "@/features/recipe-3d/server/meshy-client";
import { generateRecipe3dPrompt } from "@/features/recipe-3d/server/prompt-generator";

import { createTRPCRouter, publicProcedure } from "../server";

export const recipe3dRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        recipeName: z.string().min(1),
        summary: z.string(),
        ingredients: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("[recipe3d.generate] Input:", input);

      if (!process.env.MESH_API_KEY) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "MESH_API_KEY is missing on the server.",
        });
      }

      // Check if a task already exists for this recipe
      const existing = await db
        .select()
        .from(recipe3dTasksTable)
        .where(eq(recipe3dTasksTable.recipeName, input.recipeName))
        .limit(1);

      if (existing.length > 0) {
        const task = existing[0];
        if (
          task.status === "PENDING" ||
          task.status === "GENERATING" ||
          task.status === "SUCCEEDED"
        ) {
          console.log("[recipe3d.generate] Reusing existing task:", {
            taskId: task.id,
            status: task.status,
          });
          return { taskId: task.id, prompt: task.prompt };
        }
      }

      // Generate prompt with Gemini
      const prompt = await generateRecipe3dPrompt({
        name: input.recipeName,
        summary: input.summary,
        ingredients: input.ingredients,
      });

      // Create Meshy preview task
      const meshyTaskId = await createPreviewTask(prompt);

      // Insert DB record
      const [row] = await db
        .insert(recipe3dTasksTable)
        .values({
          recipeName: input.recipeName,
          prompt,
          meshyTaskId,
          status: "PENDING",
          progress: 0,
        })
        .returning({ id: recipe3dTasksTable.id });

      console.log("[recipe3d.generate] Task created:", {
        taskId: row.id,
        meshyTaskId,
        prompt,
      });
      return { taskId: row.id, prompt };
    }),

  getStatus: publicProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(recipe3dTasksTable)
        .where(eq(recipe3dTasksTable.id, input.taskId))
        .limit(1);

      if (rows.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      const task = rows[0];

      // If already terminal, return as-is
      if (task.status === "SUCCEEDED" || task.status === "FAILED") {
        return task;
      }

      // Poll Meshy for latest status
      if (!task.meshyTaskId) {
        return task;
      }

      console.log("[recipe3d.getStatus] Polling Meshy for task:", {
        taskId: task.id,
        meshyTaskId: task.meshyTaskId,
      });
      const meshyStatus = await getTaskStatus(task.meshyTaskId);

      let newStatus = task.status;
      let modelUrl = task.modelUrl;
      let meshyModelUrl = task.meshyModelUrl;
      let errorMessage = task.errorMessage;

      if (meshyStatus.status === "SUCCEEDED" && meshyStatus.model_urls?.glb) {
        // Download the GLB file
        const filename = `recipe-${task.id}`;
        modelUrl = await downloadGlbFile(meshyStatus.model_urls.glb, filename);
        meshyModelUrl = meshyStatus.model_urls.glb;
        newStatus = "SUCCEEDED";
      } else if (meshyStatus.status === "FAILED") {
        newStatus = "FAILED";
        errorMessage =
          meshyStatus.task_error?.message ?? "Unknown error from Meshy";
      } else if (meshyStatus.status === "IN_PROGRESS") {
        newStatus = "GENERATING";
      }

      console.log("[recipe3d.getStatus] Updated status:", {
        taskId: task.id,
        newStatus,
        progress: meshyStatus.progress,
        modelUrl,
      });

      // Update DB
      await db
        .update(recipe3dTasksTable)
        .set({
          status: newStatus,
          progress: meshyStatus.progress,
          modelUrl,
          meshyModelUrl,
          errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(recipe3dTasksTable.id, task.id));

      return {
        ...task,
        status: newStatus,
        progress: meshyStatus.progress,
        modelUrl,
        meshyModelUrl,
        errorMessage,
      };
    }),

  getByRecipeName: publicProcedure
    .input(z.object({ recipeName: z.string() }))
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(recipe3dTasksTable)
        .where(eq(recipe3dTasksTable.recipeName, input.recipeName))
        .limit(1);

      return rows[0] ?? null;
    }),
});
