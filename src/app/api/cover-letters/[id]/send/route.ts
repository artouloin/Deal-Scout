import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCoverLetter } from "@/lib/email/sender";
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

  const formData = await request.formData();
  const recipientEmail = formData.get("email") as string;
  const profileFile = formData.get("profile") as File | null;

  if (!recipientEmail) {
    return NextResponse.json(
      { error: "Recipient email is required" },
      { status: 400 }
    );
  }

  const coverLetter = await prisma.coverLetter.findUnique({
    where: { id: params.id },
    include: { job: true },
  });

  if (!coverLetter) {
    return NextResponse.json({ error: "Cover letter not found" }, { status: 404 });
  }

  try {
    let profileBuffer: Buffer | undefined;
    if (profileFile) {
      const arrayBuffer = await profileFile.arrayBuffer();
      profileBuffer = Buffer.from(arrayBuffer);
    }

    await sendCoverLetter({
      to: recipientEmail,
      subject: `Beratungsanfrage: ${coverLetter.job.title} bei ${coverLetter.job.company}`,
      content: coverLetter.content,
      profileBuffer,
      profileFileName: profileFile?.name,
    });

    await Promise.all([
      prisma.coverLetter.update({
        where: { id: params.id },
        data: { isSent: true, sentAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          coverletterId: coverLetter.id,
          action: `SENT_TO:${recipientEmail}`,
          performedBy: session.user.email ?? session.user.id,
        },
      }),
      prisma.job.update({
        where: { id: coverLetter.jobId },
        data: { status: "LETTER_SENT" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
