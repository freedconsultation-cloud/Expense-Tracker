import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { DocumentBlockParam } from "@anthropic-ai/sdk/resources";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const docBlock: DocumentBlockParam = {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: base64 },
    };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            docBlock,
            {
              type: "text",
              text: `Extract all transactions from this bank statement and return ONLY a JSON array. No explanation, no markdown, just the raw JSON array.

Each transaction object must have exactly these fields:
- date: string in YYYY-MM-DD format
- description: string (merchant name or transaction description, keep it concise)
- amount: number (positive for credits/deposits/income, negative for debits/purchases/expenses)
- category: string — pick the single best fit from: Food & Dining, Transportation, Shopping, Housing, Utilities, Entertainment, Health, Travel, Education, Income, Transfer, Other
- type: "income" if amount > 0, "expense" if amount < 0

Example output format:
[{"date":"2024-01-15","description":"Starbucks","amount":-5.75,"category":"Food & Dining","type":"expense"},{"date":"2024-01-16","description":"Direct Deposit","amount":2500,"category":"Income","type":"income"}]`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ error: "Could not parse transactions from PDF" }, { status: 422 });

    const transactions = JSON.parse(match[0]);
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
