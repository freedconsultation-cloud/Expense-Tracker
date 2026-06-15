import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(body.date),
        description: body.description,
        amount: parseFloat(body.amount),
        category: body.category,
        type: body.type,
        source: body.source ?? "manual",
      },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
