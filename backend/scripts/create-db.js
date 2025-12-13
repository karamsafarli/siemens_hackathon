const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
    // Connect to postgres database (default)
    const client = new Client({
        user: 'postgres',
        password: 'karam2004',
        host: 'localhost',
        port: 5432,
        database: 'postgres' // Connect to default postgres database
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Check if database exists
        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'smart_farm'"
        );

        if (result.rows.length === 0) {
            // Create database
            await client.query('CREATE DATABASE smart_farm');
            console.log('✅ Database "smart_farm" created successfully');
        } else {
            console.log('ℹ️  Database "smart_farm" already exists');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createDatabase();
