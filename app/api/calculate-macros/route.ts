import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const profile = await request.json();

    const prompt = `As a professional fitness and nutrition coach, calculate the optimal daily macronutrient targets for the following individual:

Age: ${profile.age}
Weight: ${profile.weight} kg
Height: ${profile.height} cm
Goal: ${profile.goal.replace('_', ' ')}
Activity Level: ${profile.activity_level.replace('_', ' ')}

Please provide:
1. Daily calorie target
2. Daily protein target (in grams)
3. Daily carbohydrate target (in grams)
4. Daily fat target (in grams)

Consider their goal and activity level when calculating. For muscle gain, ensure adequate protein and caloric surplus.
Return ONLY a JSON object with these fields:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional fitness and nutrition coach specializing in muscle gain and strength training.",
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
    console.error("Macro calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate macros" },
      { status: 500 }
    );
  }
}