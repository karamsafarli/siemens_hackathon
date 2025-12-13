import { Request, Response } from 'express';
import OpenAI from 'openai';
import pool from '../config/database';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Load database schema from file
const getDbSchema = (): string => {
    try {
        const schemaPath = path.join(__dirname, '../../database_schema.txt');
        return fs.readFileSync(schemaPath, 'utf-8');
    } catch (error) {
        console.error('Error loading schema:', error);
        return 'Schema not available';
    }
};

// System prompt for route classification
const ROUTE_CLASSIFICATION_PROMPT = `You are an intelligent assistant for a Smart Farm Management System. Your job is to analyze user queries and route them appropriately.

The Smart Farm system manages:
- Users/Farmers who own the farm
- Fields (farm areas with location and size)
- Plant Types (crops like Tomato, Wheat, Cucumber with irrigation schedules)
- Plant Batches (groups of plants in fields with planting dates, quantities, health status)
- Irrigation Events (scheduled and completed watering events)
- Notes (observations about plants - diseases, harvest, fertilizer, etc.)
- Status History (tracking plant health changes over time)
- Import Jobs (data import tracking)

CURRENT USER ID: 897e80d3-cd9e-41e7-ae71-f681164cc427

DATABASE SCHEMA:
{SCHEMA}

ROUTING RULES:
1. Route 0 - OFF-TOPIC: If the question is NOT related to farming, agriculture, plants, irrigation, fields, or this farm management system. Return route 0.

2. Route 1 - TEXT QUERY: If the user wants textual information that can be answered with a database query (counts, lists, statuses, details, history, etc.). Return route 1 with an SQL query.

3. Route 2 - VISUALIZATION: If the user explicitly asks for a chart, graph, plot, visualization, or if the data is best represented visually (trends over time, comparisons, distributions). Return route 2 with an SQL query.

IMPORTANT SQL RULES:
- Always filter by deleted_at IS NULL for soft-deleted tables (fields, plant_batches, notes)
- When filtering by user, use the CURRENT USER ID provided above: '897e80d3-cd9e-41e7-ae71-f681164cc427'
- Do NOT use placeholders like 'current_user_id' - use the actual UUID
- Use meaningful JOINs to get related data
- Use aggregations (COUNT, SUM, AVG) where appropriate
- For dates, use proper PostgreSQL date functions
- Return readable column names with AS aliases

LANGUAGE RULES:
- Detect the language of the user's question
- If the user writes in Azerbaijani, set the "language" field to "az"
- If the user writes in English, set the "language" field to "en"
- Support other languages as needed

Respond ONLY with a valid JSON object in this exact format:
{
    "route": 0 | 1 | 2,
    "data": "SQL query here or rejection message",
    "type": "text" | "sql",
    "reasoning": "Brief explanation of why this route was chosen",
    "language": "az" | "en" | "other"
}`;

// System prompt for generating human-friendly response
const TEXT_RESPONSE_PROMPT = `You are a helpful Smart Farm assistant. Convert the SQL query results into a friendly, informative response for the farmer.

GUIDELINES:
- Be concise but informative
- Use bullet points for lists
- Include relevant numbers and statistics
- Format dates in a readable way (e.g., "December 13, 2024")
- If the result is empty, provide helpful context
- Use farming terminology naturally
- Add helpful insights when relevant

LANGUAGE: Respond in {LANGUAGE}. If the language is "az", respond entirely in Azerbaijani. If "en", respond in English.

SQL Query executed:
{QUERY}

Query Results:
{RESULTS}

Provide a natural, helpful response to the user's question: "{USER_QUESTION}"`;

// System prompt for generating HTML visualizations
const CHART_GENERATION_PROMPT = `You are a data visualization expert. Generate a complete, self-contained HTML snippet that displays the data as an attractive chart/visualization.

REQUIREMENTS:
- Use Chart.js CDN (already loaded on the page): https://cdn.jsdelivr.net/npm/chart.js
- Create a canvas element with a unique ID
- Use modern, attractive colors: emerald (#10b981), blue (#3b82f6), amber (#f59e0b), rose (#f43f5e), violet (#8b5cf6)
- Include proper labels and legends
- Make it responsive
- Maximum height: 400px
- Use dark text colors for readability

SQL Query:
{QUERY}

Query Results:
{RESULTS}

User's Question: "{USER_QUESTION}"

Return ONLY a valid JSON object with this format:
{
    "html": "<div>Complete HTML with Chart.js code</div>",
    "title": "Chart title"
}`;

interface RouteResult {
    route: number;
    data: string;
    type: 'text' | 'sql';
    reasoning?: string;
    language?: string;
}

interface ChartResult {
    html: string;
    title: string;
}

// Execute SQL query safely
const executeSqlQuery = async (query: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
        // Basic SQL injection prevention - only allow SELECT queries
        const sanitizedQuery = query.trim().toUpperCase();
        if (!sanitizedQuery.startsWith('SELECT')) {
            return { success: false, error: 'Only SELECT queries are allowed' };
        }

        // Disallow dangerous operations - use word boundary detection to avoid false positives
        // (e.g., "deleted_at" should not trigger "DELETE" detection)
        const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE'];
        for (const keyword of dangerousKeywords) {
            // Use word boundary regex to match standalone keywords only
            const regex = new RegExp(`\\b${keyword}\\b(?!_)`, 'i');
            if (regex.test(sanitizedQuery) && !sanitizedQuery.includes(`${keyword}_`) && !sanitizedQuery.includes(`_${keyword}`)) {
                return { success: false, error: `${keyword} operations are not allowed` };
            }
        }

        const result = await pool.query(query);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('SQL execution error:', error);
        return { success: false, error: error.message };
    }
};

// Main chat endpoint
export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        const dbSchema = getDbSchema();

        // Step 1: Classify the route
        const classificationPrompt = ROUTE_CLASSIFICATION_PROMPT.replace('{SCHEMA}', dbSchema);

        const classificationResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: classificationPrompt },
                ...conversationHistory.slice(-5), // Include last 5 messages for context
                { role: 'user', content: message }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const routeResult: RouteResult = JSON.parse(
            classificationResponse.choices[0].message.content || '{}'
        );

        console.log('Route classification:', routeResult);

        // Handle Route 0 - Off-topic
        if (routeResult.route === 0) {
            return res.json({
                success: true,
                route: 0,
                response: {
                    type: 'text',
                    content: routeResult.data || "I'm sorry, but I can only help with questions related to your Smart Farm - plants, fields, irrigation, and farm management. Please ask me something about your farm!",
                }
            });
        }

        // Handle Route 1 & 2 - SQL Queries
        if (routeResult.route === 1 || routeResult.route === 2) {
            if (!routeResult.data || routeResult.type !== 'sql') {
                return res.json({
                    success: true,
                    route: routeResult.route,
                    response: {
                        type: 'text',
                        content: "I couldn't formulate a proper query for your request. Could you please rephrase your question?",
                    }
                });
            }

            // Execute the SQL query
            const sqlResult = await executeSqlQuery(routeResult.data);

            if (!sqlResult.success) {
                return res.json({
                    success: true,
                    route: routeResult.route,
                    response: {
                        type: 'text',
                        content: `I encountered an issue retrieving that information. ${sqlResult.error}`,
                    }
                });
            }

            // Route 1 - Generate text response
            if (routeResult.route === 1) {
                const detectedLang = routeResult.language || 'en';
                const langName = detectedLang === 'az' ? 'Azerbaijani' : detectedLang === 'en' ? 'English' : detectedLang;

                const textPrompt = TEXT_RESPONSE_PROMPT
                    .replace('{QUERY}', routeResult.data)
                    .replace('{RESULTS}', JSON.stringify(sqlResult.data, null, 2))
                    .replace('{USER_QUESTION}', message)
                    .replace('{LANGUAGE}', langName);

                const textResponse = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: textPrompt }
                    ],
                    temperature: 0.7,
                });

                return res.json({
                    success: true,
                    route: 1,
                    response: {
                        type: 'text',
                        content: textResponse.choices[0].message.content,
                        sqlQuery: routeResult.data,
                        rawData: sqlResult.data,
                    }
                });
            }

            // Route 2 - Generate chart/visualization
            if (routeResult.route === 2) {
                const chartPrompt = CHART_GENERATION_PROMPT
                    .replace('{QUERY}', routeResult.data)
                    .replace('{RESULTS}', JSON.stringify(sqlResult.data, null, 2))
                    .replace('{USER_QUESTION}', message);

                const chartResponse = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: chartPrompt }
                    ],
                    temperature: 0.5,
                    response_format: { type: 'json_object' }
                });

                const chartResult: ChartResult = JSON.parse(
                    chartResponse.choices[0].message.content || '{}'
                );

                return res.json({
                    success: true,
                    route: 2,
                    response: {
                        type: 'chart',
                        html: chartResult.html,
                        title: chartResult.title,
                        sqlQuery: routeResult.data,
                        rawData: sqlResult.data,
                    }
                });
            }
        }

        // Fallback
        return res.json({
            success: true,
            route: 0,
            response: {
                type: 'text',
                content: "I'm not sure how to help with that. Please try asking about your plants, fields, irrigation schedule, or farm statistics.",
            }
        });

    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to process your request',
            details: error.message
        });
    }
};

// Get conversation suggestions
export const getChatSuggestions = async (req: Request, res: Response) => {
    const suggestions = [
        "How many plants do I have in total?",
        "Show me plants that need watering",
        "What's the health status of my crops?",
        "Show me a chart of plants by field",
        "Which plants are at risk or critical?",
        "How many irrigation events happened this week?",
        "Show me the distribution of plant types",
        "What notes have been added recently?",
        "Compare plant quantities across fields",
        "Show irrigation history trends"
    ];

    res.json({ suggestions });
};
