import { ZodError, z } from "zod";

import {
  listDeskProjects,
  saveDeskProject,
} from "@/db/projects";
import { analyzeResponseSchema } from "@/lib/analysis";
import { getProjectOwnerId } from "@/lib/project-owner";
import { findStyleDefinition } from "@/lib/project-schema";

const createProjectSchema = z.object({
  styleId: z
    .string()
    .uuid()
    .refine((styleId) => findStyleDefinition(styleId) !== null),
  result: analyzeResponseSchema,
});
const MAX_PROJECT_REQUEST_BYTES = 12 * 1024 * 1024;

function databaseRequired() {
  return Response.json(
    { error: "Project history requires a Neon database. Configure DATABASE_URL and apply the migrations." },
    { status: 503 },
  );
}

export async function GET() {
  if (!process.env.DATABASE_URL) return databaseRequired();

  try {
    const browserId = await getProjectOwnerId();
    const projects = await listDeskProjects(browserId);
    return Response.json({
      projects: projects.map((project) => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Could not load desk project history", error);
    return Response.json(
      { error: "We could not load project history. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return databaseRequired();

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PROJECT_REQUEST_BYTES) {
    return Response.json(
      { error: "This project is too large to save." },
      { status: 413 },
    );
  }

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_PROJECT_REQUEST_BYTES) {
      return Response.json(
        { error: "This project is too large to save." },
        { status: 413 },
      );
    }

    const payload = createProjectSchema.parse(JSON.parse(body));
    const browserId = await getProjectOwnerId();
    const project = await saveDeskProject(
      browserId,
      payload.styleId,
      payload.result,
    );
    return Response.json(
      {
        project: {
          ...project,
          createdAt: project.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "The project data is invalid." },
        { status: 400 },
      );
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "The request body is invalid." }, { status: 400 });
    }

    console.error("Could not save desk project", error);
    return Response.json(
      { error: "We could not save this project. Please try again." },
      { status: 500 },
    );
  }
}
