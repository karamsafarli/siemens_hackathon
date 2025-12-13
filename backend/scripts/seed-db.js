const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function seedDatabase() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        console.log('🌱 Starting database seeding...\n');

        // Create a demo user
        const passwordHash = await bcrypt.hash('demo123', 10);
        const userResult = await client.query(
            `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
            ['demo@smartfarm.com', 'Demo Farmer', passwordHash, 'farmer']
        );
        const userId = userResult.rows[0].id;
        console.log('✅ Created demo user:', userId);

        // Create plant types
        const plantTypes = [
            { name: 'Tomato', scientific: 'Solanum lycopersicum', freq: 3, duration: 90, tempMin: 15, tempMax: 30 },
            { name: 'Wheat', scientific: 'Triticum aestivum', freq: 7, duration: 120, tempMin: 10, tempMax: 25 },
            { name: 'Cucumber', scientific: 'Cucumis sativus', freq: 2, duration: 60, tempMin: 18, tempMax: 28 },
            { name: 'Carrot', scientific: 'Daucus carota', freq: 5, duration: 75, tempMin: 12, tempMax: 24 }
        ];

        const plantTypeIds = {};
        for (const pt of plantTypes) {
            const result = await client.query(
                `INSERT INTO plant_types (name, scientific_name, irrigation_frequency_days, growth_duration_days, optimal_temperature_min, optimal_temperature_max)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
                [pt.name, pt.scientific, pt.freq, pt.duration, pt.tempMin, pt.tempMax]
            );
            plantTypeIds[pt.name] = result.rows[0].id;
        }
        console.log('✅ Created plant types:', Object.keys(plantTypeIds).join(', '));

        // Create fields
        const fields = [
            { name: 'North Field', location: 'North Section', size: 2.5 },
            { name: 'South Field', location: 'South Section', size: 3.0 },
            { name: 'East Field', location: 'East Section', size: 1.8 }
        ];

        const fieldIds = {};
        for (const field of fields) {
            const result = await client.query(
                `INSERT INTO fields (user_id, name, location, size_hectares)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
                [userId, field.name, field.location, field.size]
            );
            fieldIds[field.name] = result.rows[0].id;
        }
        console.log('✅ Created fields:', Object.keys(fieldIds).join(', '));

        // Create plant batches
        const batches = [
            { field: 'North Field', type: 'Tomato', name: 'Tomato Batch A', date: '2025-10-15', qty: 150, status: 'healthy', lastIrr: '2025-12-10' },
            { field: 'North Field', type: 'Cucumber', name: 'Cucumber Batch B', date: '2025-11-01', qty: 100, status: 'healthy', lastIrr: '2025-12-11' },
            { field: 'South Field', type: 'Wheat', name: 'Wheat Batch A', date: '2025-09-20', qty: 500, status: 'at_risk', lastIrr: '2025-12-05' },
            { field: 'East Field', type: 'Carrot', name: 'Carrot Batch A', date: '2025-10-25', qty: 200, status: 'healthy', lastIrr: '2025-12-09' }
        ];

        const batchIds = [];
        for (const batch of batches) {
            const result = await client.query(
                `INSERT INTO plant_batches (field_id, plant_type_id, batch_name, planting_date, quantity, current_status, last_irrigation_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
                [fieldIds[batch.field], plantTypeIds[batch.type], batch.name, batch.date, batch.qty, batch.status, batch.lastIrr]
            );
            batchIds.push({ id: result.rows[0].id, name: batch.name });
        }
        console.log('✅ Created plant batches:', batchIds.length);

        // Create some status history
        for (const batch of batchIds) {
            await client.query(
                `INSERT INTO status_history (plant_batch_id, status, previous_status, changed_by, reason)
         VALUES ($1, $2, $3, $4, $5)`,
                [batch.id, 'healthy', null, userId, 'Initial planting']
            );
        }
        console.log('✅ Created status history entries');

        // Create some notes
        await client.query(
            `INSERT INTO notes (plant_batch_id, note_type, content, created_by)
       VALUES ($1, $2, $3, $4)`,
            [batchIds[0].id, 'observation', 'Plants are growing well, good color.', userId]
        );
        console.log('✅ Created sample notes');

        await client.query('COMMIT');
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log('   - 1 demo user (email: demo@smartfarm.com, password: demo123)');
        console.log('   - 4 plant types');
        console.log('   - 3 fields');
        console.log('   - 4 plant batches');
        console.log('   - Status history and notes');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seedDatabase().catch(console.error);
