import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
  console.log("API endpoint called");

  try {
    const { type, data, content, videoFrame } = await req.json();
    console.log(`Request type: ${type}, data size: ${data?.length || 0} bytes`);

    // Handle text with vision - user asking about what they see
    if (type === "text_with_vision" && content && videoFrame) {
      console.log("Processing text with vision...");
      const result = await genAI.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [
          {
            parts: [
              { inlineData: { data: videoFrame, mimeType: "image/jpeg" } },
              {
                text: `Użytkownik mówi: "${content}". Odpowiedz na jego pytanie/komentarz, biorąc pod uwagę to co widzisz na obrazie z kamery. Odpowiadaj naturalnie po polsku, jak w rozmowie z przyjacielem.`,
              },
            ],
          },
        ],
      });

      const text = result.text;
      console.log("Text with vision processed successfully");

      return Response.json({
        type: "message",
        content: text,
      });
    }

    // Handle different types of input
    if (type === "video_frame" && data) {
      console.log("Processing video frame...");
      // Process video frame
      const result = await genAI.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [
          {
            parts: [
              { inlineData: { data: data, mimeType: "image/jpeg" } },
              {
                text: "Opisz co widzisz na tym obrazie. Odpowiedz krótko i naturalnie po polsku.",
              },
            ],
          },
        ],
      });

      const text = result.text;
      console.log("Video frame processed successfully");

      return Response.json({
        type: "message",
        content: text,
      });
    }

    if (type === "text" && content) {
      console.log("Processing text message...");
      // Process text message
      const result = await genAI.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: content,
      });

      const text = result.text;
      console.log("Text message processed successfully");

      return Response.json({
        type: "message",
        content: text,
      });
    }

    if (type === "audio" && data) {
      // For now, we'll skip audio processing and focus on video + text
      // Audio can be added later with speech-to-text
      return Response.json({
        type: "ack",
      });
    }

    return Response.json({ error: "Unknown request type" }, { status: 400 });
  } catch (error) {
    console.error("Gemini Live API error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
