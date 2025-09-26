import { GoogleGenAI, Type } from "@google/genai";
import { AgentResponse, Task, JournalEntry } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function summarizeText(text: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please provide a concise summary of the following notes:\n\n---\n${text}\n---`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 150,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
}

export async function getJournalPrompt(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me a single, short, and insightful journal prompt for self-reflection. It should be a question.",
      config: {
        temperature: 0.8,
        maxOutputTokens: 50,
      }
    });
    return response.text.replace(/"/g, ''); // Clean up quotes
  } catch (error) {
    console.error("Error getting journal prompt:", error);
    throw new Error("Failed to get a journal prompt.");
  }
}

export async function getChatResponse(prompt: string): Promise<string> {
  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.7,
            maxOutputTokens: 500,
            thinkingConfig: { thinkingBudget: 200 },
            systemInstruction: "You are a helpful and friendly productivity assistant. Keep your answers concise and actionable. You can use markdown for formatting like **bold** and * lists.",
        }
     });
    return response.text;
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
}

export async function getSubTasks(goal: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Break down the following complex goal into a list of simple, actionable tasks.
      Goal: "${goal}"
      
      Respond ONLY with a JSON array of strings, where each string is a task.`,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    }
    
    const tasks = JSON.parse(jsonStr) as string[];
    return tasks.filter(t => t && t.trim() !== '');
  } catch (error) {
    console.error("Error breaking down task:", error);
    throw new Error("Failed to break down goal into sub-tasks.");
  }
}

interface AgentContext {
  tasks: Task[];
  notes: string;
  focus: string;
  journalEntries: JournalEntry[];
}

export async function getAgentResponse(prompt: string, context: AgentContext): Promise<AgentResponse> {
    const systemInstruction = `You are "feel_good", an AI agent integrated into the "it's_done." productivity dashboard.
    Your primary goal is to be a supportive and empathetic companion. Your personality is warm, encouraging, and helpful.
    Acknowledge the user's feelings (e.g., if they mention feeling stressed or overwhelmed) and offer encouragement.
    You can use markdown for formatting like **bold** and * lists.

    You can interact with the app by calling tools. You MUST respond in the following JSON format. The 'actions' array can be empty.
    
    Available Tools:
    - addTask: Adds a new task. Args: { text: string, priority?: 'Low'|'Medium'|'High', category?: string, dueDate?: string (ISO format) }
    - toggleTask: Marks a task as complete/incomplete. Args: { text: string }
    - deleteTask: Removes a task. Args: { text: string }
    - addJournalEntry: Adds or updates a journal entry for today. Args: { content: string }
    - setFocus: Sets the user's main goal for the day. Args: { text: string }
    - startTimer, pauseTimer, resetTimer: Controls the Pomodoro timer. Args: {}
    - setReminder: Sets a reminder for a task. Args: { text: string, reminderTime: string (ISO format) }
    - cancelReminder: Removes a reminder from a task. Args: { text: string }
    - breakdownTask: Breaks a large goal into smaller, actionable sub-tasks. Args: { goal: string }

    Analyze the user's prompt and the provided context to decide which actions to take.
    - When modifying tasks (toggle, delete, remind), you must find them by their 'text' content. If multiple tasks match, ask for clarification.
    - If a user asks to summarize their journal, do not call a tool. Instead, read the journal context and provide the summary in your 'responseText'.
    - If a user wants to add a journal entry but does not provide content, ask them what they'd like to write in your 'responseText' and do not call a tool.
    - Always provide a friendly, conversational 'responseText' that confirms your actions or asks clarifying questions.

    Context:
    - Tasks: ${JSON.stringify(context.tasks)}
    - Notes: "${context.notes.substring(0, 150)}..."
    - Focus: "${context.focus}"
    - Recent Journal Entries: ${JSON.stringify(context.journalEntries.slice(-3))}
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        actions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              toolName: { type: Type.STRING, enum: ['addTask', 'toggleTask', 'deleteTask', 'setFocus', 'startTimer', 'pauseTimer', 'resetTimer', 'setReminder', 'cancelReminder', 'breakdownTask', 'addJournalEntry'] },
              args: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                  category: { type: Type.STRING },
                  dueDate: { type: Type.STRING },
                  reminderTime: { type: Type.STRING },
                  goal: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
              },
            },
          },
        },
        responseText: { type: Type.STRING },
      },
    };

  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            systemInstruction: systemInstruction,
        }
     });
    
    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    }
    
    const parsedResponse = JSON.parse(jsonStr) as AgentResponse;

    if (parsedResponse.actions) {
        // Pre-processing to check for duplicate addTask actions
        const addTaskAction = parsedResponse.actions.find(a => a.toolName === 'addTask' && a.args?.text);
        if (addTaskAction && addTaskAction.args.text) {
            const existingTask = context.tasks.find(t => t.text.toLowerCase() === (addTaskAction.args.text as string).toLowerCase());
            if (existingTask) {
                parsedResponse.actions = parsedResponse.actions.filter(a => a !== addTaskAction);
                parsedResponse.responseText = "You already have a task with that exact name. Would you like to add it anyway, or perhaps edit the existing one?";
            }
        }

        // Post-processing to find task IDs for other actions
        parsedResponse.actions.forEach(action => {
            if (!action || !action.args) return;

            const toolsRequiringId = ['toggleTask', 'deleteTask', 'setReminder', 'cancelReminder'];
            if (toolsRequiringId.includes(action.toolName) && action.args.text && !action.args.id) {
                const matchingTasks = context.tasks.filter(t => t.text.toLowerCase().includes((action.args.text as string).toLowerCase()));
                if (matchingTasks.length === 1) {
                    action.args.id = matchingTasks[0].id;
                } else if (matchingTasks.length > 1) {
                    console.warn(`Ambiguous task reference for text: "${action.args.text}"`);
                }
            }
        });
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error getting agent response:", error);
    return {
      actions: [],
      responseText: "Sorry, I'm having a little trouble connecting right now. Please try again in a moment.",
    };
  }
}


export async function getResearchResponse(prompt: string): Promise<{ text: string, sources: any[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        systemInstruction: "You are a research assistant. Provide factual answers and use markdown for formatting like **bold**, * lists, and tables for comparisons."
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };

  } catch (error) {
    console.error("Error getting research response:", error);
    return {
      text: "Sorry, I couldn't complete that search. Please check your API key and network connection.",
      sources: []
    }
  }
}