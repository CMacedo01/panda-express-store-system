import { OpenAI } from 'openai';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Initialize the OpenAI API client
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
    const { prompt } = await request.json();

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                // { role: 'system', content: 'You are a helpful assistant.' }, // Optional system message
                { role: 'user', content: prompt } // The user's prompt
            ],
            max_tokens: 100,
        });
    
    
        // Return the assistant's response from the choices array
        return json({ result: response.choices[0].message.content });
    
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        return json({ error: 'Failed to fetch data from OpenAI API' }, { status: 500 });
    }    
}