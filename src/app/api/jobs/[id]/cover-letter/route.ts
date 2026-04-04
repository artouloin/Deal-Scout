import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/ai/analyzer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  try {
    const matchDetails = (job.matchDetails as any) ?? {};
    const matchResult = {
      score: job.matchScore ?? 0,
      breakdown: matchDetails,
      contractType: job.contractType,
      isTemporary: job.isTemporary,
      hasPermanentPotential: job.hasPermanentPotential,
      industry: job.industry,
      extractedPhone: job.phone,
      summary: "",
    };

    const content = await generateCoverLetter(job, matchResult as any);

    const coverLetter = await prisma.coverLetter.create({
      data: {
        jobId: job.id,
        userId: session.user.id,
        content,
      },
    });

    await prisma.auditLog.create({
      data: {
        coverletterId: coverLetter.id,
        action: "GENERATED",
        performedBy: session.user.email ?? session.user.id,
      },
    });

    return NextResponse.json(coverLetter);
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
