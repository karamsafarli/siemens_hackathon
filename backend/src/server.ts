import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';

// Import routes
import fieldsRouter from './routes/fields';
import plantBatchesRouter from './routes/plantBatches';
import irrigationRouter from './routes/irrigation';
import notesRouter from './routes/notes';
import dashboardRouter from './routes/dashboard';
import authRouter from './routes/auth';
import importRoutes from './routes/import';
import chatRouter from './routes/chat';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'healthy',
            timestamp: result.rows[0].now,
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/import', importRoutes);
app.use('/api/fields', fieldsRouter);
app.use('/api/plant-batches', plantBatchesRouter);
app.use('/api/irrigation', irrigationRouter);
app.use('/api/notes', notesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/chat', chatRouter);

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Smart Farm API',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me',
            },
            fields: {
                list: 'GET /api/fields?userId=...',
                get: 'GET /api/fields/:id',
                create: 'POST /api/fields',
                update: 'PUT /api/fields/:id',
                delete: 'DELETE /api/fields/:id',
            },
            plantBatches: {
                list: 'GET /api/plant-batches?userId=...',
                get: 'GET /api/plant-batches/:id',
                create: 'POST /api/plant-batches',
                update: 'PUT /api/plant-batches/:id',
                updateStatus: 'PUT /api/plant-batches/:id/status',
                delete: 'DELETE /api/plant-batches/:id',
            },
            irrigation: {
                list: 'GET /api/irrigation?plantBatchId=...',
                overdue: 'GET /api/irrigation/overdue?userId=...',
                create: 'POST /api/irrigation',
                complete: 'PUT /api/irrigation/:id/complete',
            },
            notes: {
                list: 'GET /api/notes?plantBatchId=...',
                create: 'POST /api/notes',
                update: 'PUT /api/notes/:id',
                delete: 'DELETE /api/notes/:id',
            },
            dashboard: {
                stats: 'GET /api/dashboard/stats?userId=...',
                alerts: 'GET /api/dashboard/alerts?userId=...',
            },
        },
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API documentation: http://localhost:${PORT}/api`);
});

export default app;
