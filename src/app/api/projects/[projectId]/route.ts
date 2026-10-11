import { ZodError, z } from "zod";

import {
  deleteDeskProject,
  getDeskProject,
  updateDeskProjectChecklist,
} from "@/db/projects";
import { getProjectOwnerId } from "@/lib/project-owner";
import { savedProjectSchema } from "@/lib/project-schema";

const projectIdSchema = z.string().uuid();
const checklistUpdateSchema = z.object({
  completedTasks: z.array(z.boolean()).max(7),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "Project history requires a Neon database. Configure DATABASE_URL and apply the migrations." },
      { status: 503 },
    );
  }

  try {
    const { projectId } = await params;
    if (!projectIdSchema.safeParse(projectId).success) {
      return Response.json({ error: "That project ID is invalid." }, { status: 400 });
    }

    const browserId = await getProjectOwnerId();
    const project = await getDeskProject(browserId, projectId);
    if (!project) {
      return Response.json({ error: "That saved project could not be found." }, { status: 404 });
    }

    const savedProject = savedProjectSchema.parse({
      ...project,
      completedTasks:
        project.completedTasks.length === project.result.data.tasks.length
          ? project.completedTasks
          : project.result.data.tasks.map(() => false),
      createdAt: project.createdAt.toISOString(),
    });
    return Response.json({ project: savedProject });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("A saved desk project has invalid data", error);
      return Response.json(
        { error: "This saved project could not be opened because its data is invalid." },
        { status: 500 },
      );
    }
    console.error("Could not load saved desk project", error);
    return Response.json(
      { error: "We could not open this project. Please try again." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "Project history requires a Neon database. Configure DATABASE_URL and apply the migrations." },
      { status: 503 },
    );
  }

  try {
    const { projectId } = await params;
    if (!projectIdSchema.safeParse(projectId).success) {
      return Response.json({ error: "That project ID is invalid." }, { status: 400 });
    }

    const payload = checklistUpdateSchema.parse(await request.json());
    const browserId = await getProjectOwnerId();
    const outcome = await updateDeskProjectChecklist(
      browserId,
      projectId,
      payload.completedTasks,
    );
    if (outcome === "not-found") {
      return Response.json({ error: "That saved project could not be found." }, { status: 404 });
    }
    if (outcome === "invalid-length") {
      return Response.json({ error: "The checklist does not match this project." }, { status: 400 });
    }
    return Response.json({ saved: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "The checklist data is invalid." },
        { status: 400 },
      );
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "The request body is invalid." }, { status: 400 });
    }

    console.error("Could not save desk project checklist", error);
    return Response.json(
      { error: "We could not save checklist progress. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "Project history requires a Neon database. Configure DATABASE_URL and apply the migrations." },
      { status: 503 },
    );
  }

  try {
    const { projectId } = await params;
    if (!projectIdSchema.safeParse(projectId).success) {
      return Response.json({ error: "That project ID is invalid." }, { status: 400 });
    }

    const browserId = await getProjectOwnerId();
    const deleted = await deleteDeskProject(browserId, projectId);
    if (!deleted) {
      return Response.json({ error: "That saved project could not be found." }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch (error) {
    console.error("Could not delete saved desk project", error);
    return Response.json(
      { error: "We could not delete this project. Please try again." },
      { status: 500 },
    );
  }
}
