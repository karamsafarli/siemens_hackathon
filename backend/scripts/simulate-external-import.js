/**
 * External Data Source Simulator
 * 
 * This script simulates an external IoT gateway or data system sending farm data
 * to our Smart Farm API. Run this to demonstrate the import functionality.
 * 
 * Usage:
 *   node scripts/simulate-external-import.js                    # Uses default sample data
 *   node scripts/simulate-external-import.js sensor-data        # Uses sensor data
 *   node scripts/simulate-external-import.js conflict-data      # Uses conflict demo data
 *   node scripts/simulate-external-import.js --generate         # Generates random daily data
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const USER_ID = '897e80d3-cd9e-41e7-ae71-f681164cc427'; // Demo user

// Field and plant configurations for random data generation
const FIELDS = ['North Field', 'South Field', 'East Greenhouse', 'West Field'];
const PLANTS = [
    { name: 'Spring Tomatoes', type: 'Tomato' },
    { name: 'Winter Wheat', type: 'Wheat' },
    { name: 'Cucumber Batch A', type: 'Cucumber' },
    { name: 'Carrot Patch', type: 'Carrot' },
];
const EVENT_TYPES = ['irrigation', 'observation', 'observation', 'observation']; // More observations
const OBSERVATIONS = [
    'Soil moisture at optimal levels',
    'New growth observed on all plants',
    'Healthy leaf coloration',
    'Pest check completed - no issues found',
    'Temperature within ideal range',
    'Humidity levels stable',
];

// Generate today's date in local timezone (YYYY-MM-DD format)
function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generate random farm data for today
function generateDailyData() {
    const today = getToday();
    const records = [];

    // Generate 5-10 random events for today
    const eventCount = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < eventCount; i++) {
        const plant = PLANTS[Math.floor(Math.random() * PLANTS.length)];
        const field = FIELDS[Math.floor(Math.random() * FIELDS.length)];
        const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];

        let note = '';
        if (eventType === 'irrigation') {
            const liters = Math.floor(Math.random() * 15) + 5;
            note = `Automated irrigation - ${liters} liters dispensed`;
        } else {
            note = OBSERVATIONS[Math.floor(Math.random() * OBSERVATIONS.length)];
        }

        records.push({
            date: today,
            field_name: field,
            plant_name: plant.name,
            plant_type: plant.type,
            event_type: eventType,
            note: note,
        });
    }

    return records;
}

// Load sample data from file
function loadSampleData(filename) {
    const dataDir = path.join(__dirname, '..', 'demo-data');
    const filePath = path.join(dataDir, `sample-${filename}.json`);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        console.log('\nAvailable sample files:');
        console.log('  - daily-data');
        console.log('  - conflict-data');
        console.log('  - sensor-data');
        process.exit(1);
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Send data to import API
async function sendToApi(records) {
    console.log('\n📡 Sending data to Smart Farm API...');
    console.log(`   URL: ${API_URL}/import`);
    console.log(`   Records: ${records.length}`);

    try {
        const response = await fetch(`${API_URL}/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: USER_ID,
                records: records,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Import failed');
        }

        console.log('\n✅ Import completed successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Import Job ID: ${result.import_job_id}`);
        console.log(`   Total Records: ${result.total_records}`);
        console.log(`   ✓ Successful:  ${result.successful_records}`);
        console.log(`   ✗ Failed:      ${result.failed_records}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (result.errors && result.errors.length > 0) {
            console.log('\n⚠️  Errors:');
            result.errors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err.error}`);
            });
        }

        return result;
    } catch (error) {
        console.error('\n❌ Import failed:', error.message);
        throw error;
    }
}

// Main execution
async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║     🌱 Smart Farm - External Data Simulator 🌱      ║');
    console.log('╚════════════════════════════════════════════════════╝');

    const args = process.argv.slice(2);
    let records;

    if (args.includes('--generate')) {
        console.log('\n🎲 Generating random daily farm data...');
        records = generateDailyData();
    } else if (args.length > 0) {
        const filename = args[0].replace('sample-', '').replace('.json', '');
        console.log(`\n📂 Loading sample data: ${filename}`);
        records = loadSampleData(filename);
    } else {
        console.log('\n📂 Loading default sample data: daily-data');
        records = loadSampleData('daily-data');
    }

    console.log('\n📋 Data preview:');
    records.slice(0, 3).forEach((r, i) => {
        console.log(`   ${i + 1}. [${r.event_type}] ${r.plant_name} @ ${r.field_name}`);
    });
    if (records.length > 3) {
        console.log(`   ... and ${records.length - 3} more records`);
    }

    await sendToApi(records);
}

main().catch(console.error);
