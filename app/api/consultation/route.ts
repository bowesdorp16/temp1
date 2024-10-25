import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { meals, profile, remarks } = await request.json();

    const prompt = generatePrompt(meals, profile, remarks);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional fitness and nutrition coach specializing in muscle gain and bulking. Provide detailed dietary analysis and recommendations focused on muscle growth, protein intake, and caloric surplus.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      analysis: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Consultation error:", error);
    return NextResponse.json(
      { error: "Failed to generate consultation" },
      { status: 500 }
    );
  }
}

function generatePrompt(meals: any[], profile: any, remarks: string) {
  const mealsList = meals
    .map((meal) => (
      `- Date: ${meal.date}\n  Meal: ${meal.name}\n  Description: ${meal.description}`
    ))
    .join("\n");

  return `Please provide a comprehensive muscle gain focused dietary analysis and recommendations based on the following information:

User Profile:
- Age: ${profile.age}
- Weight: ${profile.weight} kg
- Height: ${profile.height} cm

Meals from the past week:
${mealsList}

${remarks ? `Additional remarks/concerns: ${remarks}` : ""}

Please include:
1. Overall assessment of caloric intake for muscle gain
2. Protein intake analysis and recommendations
3. Timing of meals for optimal muscle growth
4. Pre and post-workout nutrition suggestions
5. Specific recommendations for increasing quality mass
6. If any concerns were mentioned, address them specifically
7. Suggestions for muscle-building friendly meals and supplements`;
}