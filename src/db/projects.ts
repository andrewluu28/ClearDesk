import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { deskProjects } from "@/db/schema";
import type { AnalyzeResponse } from "@/lib/analysis";
import { findStyleDefinition } from "@/lib/styles";

export async function saveDeskProject(
  browserId: string,
  styleId: string,
  result: AnalyzeResponse,
) {
  const style = findStyleDefinition(styleId);
  if (!style) {
    throw new Error("The selected organization style is unavailable.");
  }

  const client = postgres(process.env.DATABASE_URL!, {
    max: 1,
    prepare: false,
  });
  try {
    const db = drizzle(client);
    const [project] = await db
      .insert(deskProjects)
      .values({
        browserId,
        styleId,
        styleName: style.name,
        summary: result.data.summary,
        score: result.data.score,
        result,
        completedTasks: result.data.tasks.map(() => false),
      })
      .returning({
        id: deskProjects.id,
        createdAt: deskProjects.createdAt,
        styleName: deskProjects.styleName,
        summary: deskProjects.summary,
        score: deskProjects.score,
      });
    return project;
  } finally {
    await client.end();
  }
}

export async function listDeskProjects(browserId: string) {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 1,
    prepare: false,
  });
  try {
    const db = drizzle(client);
    return await db
      .select({
        id: deskProjects.id,
        createdAt: deskProjects.createdAt,
        styleName: deskProjects.styleName,
        summary: deskProjects.summary,
        score: deskProjects.score,
      })
      .from(deskProjects)
      .where(eq(deskProjects.browserId, browserId))
      .orderBy(desc(deskProjects.createdAt));
  } finally {
    await client.end();
  }
}

export async function getDeskProject(browserId: string, projectId: string) {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 1,
    prepare: false,
  });
  try {
    const db = drizzle(client);
    const [project] = await db
      .select({
        id: deskProjects.id,
        createdAt: deskProjects.createdAt,
        styleId: deskProjects.styleId,
        styleName: deskProjects.styleName,
        summary: deskProjects.summary,
        score: deskProjects.score,
        result: deskProjects.result,
        completedTasks: deskProjects.completedTasks,
      })
      .from(deskProjects)
      .where(
        and(
          eq(deskProjects.id, projectId),
          eq(deskProjects.browserId, browserId),
        ),
      )
      .limit(1);
    return project ?? null;
  } finally {
    await client.end();
  }
}

export async function updateDeskProjectChecklist(
  browserId: string,
  projectId: string,
  completedTasks: boolean[],
) {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 1,
    prepare: false,
  });
  try {
    const db = drizzle(client);
    const [project] = await db
      .select({
        taskCount: deskProjects.result,
      })
      .from(deskProjects)
      .where(
        and(
          eq(deskProjects.id, projectId),
          eq(deskProjects.browserId, browserId),
        ),
      )
      .limit(1);

    if (!project) return "not-found" as const;
    if (project.taskCount.data.tasks.length !== completedTasks.length) {
      return "invalid-length" as const;
    }

    await db
      .update(deskProjects)
      .set({ completedTasks })
      .where(
        and(
          eq(deskProjects.id, projectId),
          eq(deskProjects.browserId, browserId),
        ),
      );
    return "updated" as const;
  } finally {
    await client.end();
  }
}

export async function deleteDeskProject(browserId: string, projectId: string) {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 1,
    prepare: false,
  });
  try {
    const db = drizzle(client);
    const [deletedProject] = await db
      .delete(deskProjects)
      .where(
        and(
          eq(deskProjects.id, projectId),
          eq(deskProjects.browserId, browserId),
        ),
      )
      .returning({ id: deskProjects.id });
    return deletedProject !== undefined;
  } finally {
    await client.end();
  }
}
