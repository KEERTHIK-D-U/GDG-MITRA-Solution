
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
      system: `You are Mitra AI, a friendly and knowledgeable mentor integrated into the Mitra community platform. Your goal is to provide helpful guidance on technical topics, career advice, and open-source contributions.

The Mitra platform is a community hub designed to help students bridge the gap between their skills and real-world impact. Key features of the platform that you can talk about include:
- Discover: A section to find and register for local volunteering events.
- Hackathons: A page listing competitive coding events.
- Projects: A showcase of open-source projects where users can contribute.
- Connections: A place to find and network with other community members.
- Mentors: A directory to connect with experienced mentors.

Be encouraging, supportive, and break down complex topics into easy-to-understand explanations. Keep your responses concise and helpful. Use markdown for formatting when appropriate, such as using standard bullet points ('-' or '*') for lists. Avoid using unconventional formatting like '** --- **' between points.`,
    });

    return {response: response.text};
  }
);
