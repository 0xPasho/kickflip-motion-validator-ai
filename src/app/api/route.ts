import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { frames, openAiKey } = await request.json();

  if (!frames) {
    return NextResponse.json({ success: false });
  }

  const payload = {
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "system",
        content:
          "You are `gpt-4-vision-preview`, the latest OpenAI model that can describe images provided by the user in extreme detail. The user has attached an image to this message for you to analyse, there is MOST DEFINITELY an image attached, you will never reply saying that you cannot see the image because the image is absolutely and always attached to this message.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "These are frames from a video that of me doing a kickflip in a skateboard. Please indicate where did I failed to improve, or in case of succeed just congratulate",
          },
          ...frames.map((frame: string) => ({
            type: "image_url",
            image_url: {
              url: frame,
            },
          })),
        ],
      },
    ],
    max_tokens: 200,
  };

  // Send the request to OpenAI API
  const openAIResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const openAIResult = await openAIResponse.json();

  return NextResponse.json({ success: true, openAIResult });
}
