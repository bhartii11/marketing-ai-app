export async function POST(req) {
  try {
    console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);

    const body = await req.json();

    const prompt = `
You are a marketing expert.

Create:
1. Email campaign
2. WhatsApp message (short & engaging)
3. LinkedIn post (professional)

Company: ${body.company}
Campaign: ${body.campaign}
Description: ${body.description}

STRICT RULES:
- Return ONLY valid JSON
- No explanation
- No markdown
- No headings

FORMAT:
{
  "email": "string",
  "whatsapp": "string",
  "linkedin": "string"
}
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" }, // 🔥 important
          messages: [
            { role: "system", content: "You are a marketing expert." },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    const result = await response.json();

    // 🔍 Debug
    console.log("OpenAI response:", result);

    // ❌ If API failed
    if (!result.choices) {
      return Response.json({
        error: result.error?.message || "OpenAI API failed",
      });
    }

    const text = result.choices[0]?.message?.content || "";

    try {
      // Since we forced JSON, this should work directly
      return Response.json(JSON.parse(text));
    } catch {
      // fallback (rare case)
      return Response.json({
        email: text,
        whatsapp: text,
        linkedin: text,
      });
    }
  } catch (error) {
    return Response.json({ error: error.message });
  }
}


// export async function POST(req) {
//   try {
//     console.log("API KEY:", process.env.GEMINI_API_KEY);
//     const body = await req.json();

//     const prompt = `
// You are a marketing expert. Return ONLY valid JSON.
// Keys: "email", "whatsapp", "linkedin".

// Company: ${body.company}
// Campaign: ${body.campaign}
// Description: ${body.description}
// `;

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [{ parts: [{ text: prompt }] }],
//         }),
//       }
//     );

//     const result = await response.json();

//     // 🔍 Debug (optional but useful)
//     console.log("Gemini response:", result);

//     // ❌ If API failed
//     if (!result.candidates) {
//       return Response.json({
//         error: result.error?.message || "Gemini API failed",
//       });
//     }

//     const text =
//       result.candidates[0]?.content?.parts?.[0]?.text || "";

//     const clean = text.replace(/```json|```/g, "").trim();

//     try {
//       return Response.json(JSON.parse(clean));
//     } catch {
//       // fallback if JSON not proper
//       return Response.json({
//         email: text,
//         whatsapp: text,
//         linkedin: text,
//       });
//     }
//   } catch (error) {
//     return Response.json({ error: error.message });
//   }
// }