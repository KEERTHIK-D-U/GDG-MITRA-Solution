'use server';
/**
 * @fileOverview An AI mentor chatbot flow.
 *
 * - askMentor - A function that handles a user's message to the AI mentor.
 * - MentorChatInput - The input type for the askMentor function.
 * - MentorChatOutput - The return type for the askMentor function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const MentorChatInputSchema = z.object({
  history: z
    .array(MessageSchema)
    .describe('The conversation history so far.'),
  message: z.string().describe("The user's latest message."),
});
export type MentorChatInput = z.infer<typeof MentorChatInputSchema>;

const MentorChatOutputSchema = z.object({
  response: z.string().describe('The AI mentor response.'),
});
export type MentorChatOutput = z.infer<typeof MentorChatOutputSchema>;

export async function askMentor(
  input: MentorChatInput
): Promise<MentorChatOutput> {
  return mentorChatFlow(input);
}

const mentorChatFlow = ai.defineFlow(
  {
    name: 'mentorChatFlow',
    inputSchema: MentorChatInputSchema,
    outputSchema: MentorChatOutputSchema,
  },
  async ({history, message}) => {
    // Map the simplified history to the format expected by ai.generate
    const fullHistory = history.map(h => ({
      role: h.role,
      content: [{text: h.text}],
    }));

    const response = await ai.generate({
      prompt: message,
      history: fullHistory,
      system: `You are Mitra AI, a friendly and knowledgeable mentor for students and early-career tech professionals. Your goal is to provide helpful guidance on technical topics, career advice, open-source contributions, and project collaboration. Be encouraging, supportive, and break down complex topics into easy-to-understand explanations. Keep your responses concise and helpful. Use markdown for formatting when appropriate.`,
    });

    return {response: response.text};
  }
);
