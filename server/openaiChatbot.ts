import OpenAI from "openai";
import { Request, Response } from "express";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FARMING_SYSTEM_PROMPT = `You are JalSetu AI, an expert agricultural assistant specializing in water management and farming practices. You help farmers with:

- Water quality management and irrigation optimization
- Soil moisture monitoring and analysis
- Crop selection and farming techniques
- Weather-based agricultural planning
- Pest and disease management
- Sustainable farming practices

Always provide practical, actionable advice. Keep responses concise but comprehensive. When discussing water management, consider factors like pH levels, TDS (Total Dissolved Solids), temperature, and soil moisture content.

If asked about non-agricultural topics, politely redirect the conversation back to farming and water management.`;

export async function handleOpenAIChat(req: Request, res: Response) {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "Message is required and must be a string" 
      });
    }

    // Build conversation history for context
    const messages = [
      { role: "system", content: FARMING_SYSTEM_PROMPT },
      ...history.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    if (!response) {
      throw new Error("No response generated from OpenAI");
    }

    res.json({
      response,
      provider: "openai"
    });

  } catch (error: any) {
    console.error("OpenAI Chat Error:", error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(500).json({ 
        error: "Invalid OpenAI API key. Please check your configuration." 
      });
    }
    
    if (error.status === 429) {
      return res.status(500).json({ 
        error: "OpenAI rate limit exceeded. Please try again later." 
      });
    }
    
    if (error.status === 400) {
      return res.status(500).json({ 
        error: "Invalid request to OpenAI. Please check your input." 
      });
    }

    res.status(500).json({ 
      error: error.message || "Failed to generate response from OpenAI"
    });
  }
}