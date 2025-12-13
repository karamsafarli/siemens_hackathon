/**
 * Continuous External Data Source Simulator
 * 
 * This script simulates an IoT gateway that continuously sends farm sensor data
 * to the Smart Farm API at regular intervals. Perfect for live demos!
 * 
 * Usage:
 *   node scripts/scheduled-import.js           # Sends data every 30 seconds
 *   node scripts/scheduled-import.js --fast    # Sends data every 10 seconds
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const USER_ID = '897e80d3-cd9e-41e7-ae71-f681164cc427';

// Configuration
const FIELDS = ['North Field', 'South Field', 'East Greenhouse', 'West Field'];
const PLANTS = [
    { name: 'Spring Tomatoes', type: 'Tomato', field: 'North Field' },
    { name: 'Winter Wheat', type: 'Wheat', field: 'South Field' },
    { name: 'Cucumber Batch A', type: 'Cucumber', field: 'East Greenhouse' },
    { name: 'Carrot Patch', type: 'Carrot', field: 'West Field' },
];

let sendCount = 0;

// Get today's date in local timezone (YYYY-MM-DD format)
function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generate a single realistic sensor reading
function generateSensorReading() {
    const plant = PLANTS[Math.floor(Math.random() * PLANTS.length)];
    const today = getLocalDate();

    // Simulate different types of readings
    const readingTypes = [
        () => ({
            event_type: 'observation',
            note: `🌡️ Sensor: Temp ${(20 + Math.random() * 10).toFixed(1)}°C, Humidity ${(50 + Math.random() * 30).toFixed(0)}%`,
        }),
        () => ({
            event_type: 'observation',
            note: `💧 Soil Moisture: ${(40 + Math.random() * 40).toFixed(0)}%`,
        }),
        () => ({
            event_type: 'observation',
            note: `☀️ Light Level: ${(500 + Math.random() * 700).toFixed(0)} lux`,
        }),
    ];

    const reading = readingTypes[Math.floor(Math.random() * readingTypes.length)]();

    return {
        date: today,
        field_name: plant.field,
        plant_name: plant.name,
        plant_type: plant.type,
        ...reading,
    };
}

// Send single reading to API
async function sendReading() {
    const record = generateSensorReading();
    sendCount++;

    console.log(`\n[${new Date().toLocaleTimeString()}] 📡 Sending reading #${sendCount} (Date: ${record.date})...`);
    console.log(`   ${record.note}`);
    console.log(`   → ${record.plant_name} @ ${record.field_name}`);

    try {
        const response = await fetch(`${API_URL}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: USER_ID,
                records: [record],
            }),
        });

        const result = await response.json();

        if (result.successful_records > 0) {
            console.log('   ✅ Recorded successfully');
        } else {
            console.log('   ⚠️ Recording failed:', result.errors?.[0]?.error || 'Unknown error');
        }
    } catch (error) {
        console.log('   ❌ API Error:', error.message);
    }
}

// Main loop
async function main() {
    const isFast = process.argv.includes('--fast');
    const interval = isFast ? 10000 : 30000; // 10s or 30s

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   🌱 Smart Farm - Continuous IoT Sensor Simulator 🌱      ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`\n⏱️  Sending data every ${interval / 1000} seconds...`);
    console.log('   Press Ctrl+C to stop\n');

    // Send first reading immediately
    await sendReading();

    // Then continue at interval
    setInterval(sendReading, interval);
}

main();
