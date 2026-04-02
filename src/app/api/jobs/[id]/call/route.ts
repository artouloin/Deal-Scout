import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const [callLog, updatedJob] = await Promise.all([
    prisma.callLog.create({
      data: {
        jobId: params.id,
        userId: session.user.id,
        notes: body.notes,
      },
    }),
    prisma.job.update({
      where: { id: params.id },
      data: { status: "CALL_DONE" },
    }),
  ]);

  return NextResponse.json({ callLog, job: updatedJob });
}
