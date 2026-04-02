import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

const querySchema = z.object({
  industry: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  contractType: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = querySchema.parse(Object.fromEntries(searchParams));

  const where: any = {};
  if (params.industry) where.industry = params.industry;
  if (params.source) where.source = params.source;
  if (params.status) where.status = params.status;
  if (params.contractType) where.contractType = params.contractType;
  if (params.minScore) where.matchScore = { gte: params.minScore };
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { company: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ matchScore: "desc" }, { createdAt: "desc" }],
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    jobs,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  });
}
