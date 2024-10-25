import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { mealName, description } = await request.json();

    const prompt = `Analyze the following meal and provide nutritional information in JSON format:

Meal: ${mealName}
Description: ${description}

Please provide:
1. Total calories
2. Protein (g)
3. Carbohydrates (g)
4. Fats (g)
5. A brief analysis for muscle gain

Return ONLY a JSON object with these fields:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "analysis": string
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert specializing in muscle gain. Analyze meals and provide accurate nutritional information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(response || "{}"));
  } catch (error) {
    console.error("Meal analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze meal" },
      { status: 500 }
    );
  }
}