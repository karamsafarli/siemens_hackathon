/**
 * Demo Data Seeder - Generates realistic farm data for hackathon pitch
 * 
 * This script creates realistic fabricated data including:
 * - Multiple fields with different locations
 * - Various plant batches with realistic planting dates
 * - Irrigation events over the past 3 weeks
 * - Status history showing plant health changes
 * - Notes and observations
 * - Import job audit trail
 * 
 * Usage: npx ts-node scripts/seed-demo-data.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/config/prisma';

// Demo admin user ID
const ADMIN_USER_ID = '897e80d3-cd9e-41e7-ae71-f681164cc427';

// Helper to get random date within range
function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to get random item from array
function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to get date N days ago
function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

// Field configurations
const FIELDS_DATA = [
    { name: 'North Field', location: 'Northern sector, near water reservoir', size: 5.5 },
    { name: 'South Field', location: 'Southern sector, hillside area', size: 8.2 },
    { name: 'East Greenhouse', location: 'Eastern greenhouse complex A', size: 1.2 },
    { name: 'West Orchard', location: 'Western orchard, apple section', size: 12.0 },
    { name: 'Central Plot', location: 'Main farm center, experimental area', size: 3.5 },
];

// Plant batch configurations with realistic planting dates
const PLANT_BATCHES_DATA = [
    { name: 'Tomato Batch Alpha', type: 'Tomato', field: 'East Greenhouse', daysAgePlanted: 45, quantity: 500 },
    { name: 'Tomato Batch Beta', type: 'Tomato', field: 'East Greenhouse', daysAgePlanted: 30, quantity: 350 },
    { name: 'Winter Wheat 2024', type: 'Wheat', field: 'South Field', daysAgePlanted: 120, quantity: 8000 },
    { name: 'Spring Wheat', type: 'Wheat', field: 'North Field', daysAgePlanted: 60, quantity: 5500 },
    { name: 'Cucumber Row A', type: 'Cucumber', field: 'East Greenhouse', daysAgePlanted: 25, quantity: 200 },
    { name: 'Cucumber Row B', type: 'Cucumber', field: 'East Greenhouse', daysAgePlanted: 20, quantity: 180 },
    { name: 'Carrot Field Section 1', type: 'Carrot', field: 'Central Plot', daysAgePlanted: 75, quantity: 3000 },
    { name: 'Carrot Field Section 2', type: 'Carrot', field: 'Central Plot', daysAgePlanted: 55, quantity: 2500 },
    { name: 'Early Tomatoes', type: 'Tomato', field: 'North Field', daysAgePlanted: 90, quantity: 800 },
    { name: 'Organic Wheat Trial', type: 'Wheat', field: 'Central Plot', daysAgePlanted: 100, quantity: 1500 },
];

// Status configurations
const STATUSES = ['healthy', 'at_risk', 'critical', 'healthy', 'healthy']; // weighted towards healthy

// Note types and sample content
const OBSERVATION_NOTES = [
    'Soil moisture levels optimal. Plants showing vigorous growth.',
    'Performed routine health check - all plants in excellent condition.',
    'New leaf growth observed across the batch. No signs of pest damage.',
    'Checked root systems - healthy development noted.',
    'Weather conditions favorable. Good sunlight exposure today.',
    'Soil pH tested at 6.5 - within optimal range for this crop.',
    'Beneficial insects observed - natural pest control active.',
    'Morning inspection complete. No abnormalities detected.',
    'Growth rate exceeding expectations for this season.',
    'Canopy development progressing well. Good air circulation.',
];

const PROBLEM_NOTES = [
    'Yellow spots detected on some leaves - monitoring closely.',
    'Minor aphid presence observed. Will apply organic treatment.',
    'Some wilting noted in corner section - possible drainage issue.',
    'Early signs of fungal infection detected. Treatment scheduled.',
    'Nutrient deficiency symptoms visible - adjusting fertilizer mix.',
    'Wind damage to some plants after last night\'s storm.',
    'Temperature stress signs visible after heat wave.',
];

const IRRIGATION_NOTES = [
    'Scheduled morning irrigation completed successfully.',
    'Drip irrigation system activated - 15L per plant.',
    'Evening watering session - soil moisture restored.',
    'Automated irrigation triggered by sensor readings.',
    'Manual irrigation due to dry conditions.',
    'Supplemental watering after fertilizer application.',
    'Deep watering session for root development.',
];

const STATUS_CHANGE_REASONS = {
    'healthy_to_at_risk': [
        'Minor pest damage detected, monitoring situation',
        'Slight nutrient deficiency observed, adjusting treatment',
        'Weather stress symptoms appearing',
    ],
    'at_risk_to_critical': [
        'Condition worsening despite treatment',
        'Disease spreading to adjacent plants',
        'Severe water stress detected',
    ],
    'at_risk_to_healthy': [
        'Treatment successful, plants recovering well',
        'Natural recovery observed after weather improvement',
        'Pest problem resolved with organic treatment',
    ],
    'critical_to_at_risk': [
        'Emergency treatment showing positive results',
        'Affected plants isolated, remaining stabilizing',
    ],
};

async function clearOldData() {
    console.log('🗑️  Clearing old demo data...');

    // Delete in order respecting foreign keys
    await prisma.notes.deleteMany({});
    await prisma.status_history.deleteMany({});
    await prisma.irrigation_events.deleteMany({});
    await prisma.import_jobs.deleteMany({});
    await prisma.plant_batches.deleteMany({});
    await prisma.fields.deleteMany({});

    console.log('   ✓ Old data cleared');
}

async function createFields() {
    console.log('\n🌾 Creating fields...');
    const fields: any[] = [];

    for (const fieldData of FIELDS_DATA) {
        const field = await prisma.fields.create({
            data: {
                user_id: ADMIN_USER_ID,
                name: fieldData.name,
                location: fieldData.location,
                size_hectares: fieldData.size,
            },
        });
        fields.push(field);
        console.log(`   ✓ Created: ${field.name} (${fieldData.size} ha)`);
    }

    return fields;
}

async function getPlantTypes() {
    return await prisma.plant_types.findMany();
}

async function createPlantBatches(fields: any[], plantTypes: any[]) {
    console.log('\n🌱 Creating plant batches...');
    const batches: any[] = [];

    for (const batchData of PLANT_BATCHES_DATA) {
        const field = fields.find(f => f.name === batchData.field);
        const plantType = plantTypes.find(pt => pt.name === batchData.type);

        if (!field || !plantType) {
            console.log(`   ⚠ Skipping ${batchData.name} - field or type not found`);
            continue;
        }

        const plantingDate = daysAgo(batchData.daysAgePlanted);
        const status = randomItem(STATUSES);

        const batch = await prisma.plant_batches.create({
            data: {
                field_id: field.id,
                plant_type_id: plantType.id,
                batch_name: batchData.name,
                planting_date: plantingDate,
                quantity: batchData.quantity,
                current_status: status,
                last_irrigation_date: daysAgo(Math.floor(Math.random() * 3) + 1), // 1-3 days ago
            },
        });
        batches.push(batch);
        console.log(`   ✓ Created: ${batch.batch_name} (${status})`);
    }

    return batches;
}

async function createIrrigationEvents(batches: any[]) {
    console.log('\n💧 Creating irrigation events...');
    let count = 0;

    for (const batch of batches) {
        // Get plant type for irrigation frequency
        const plantType = await prisma.plant_types.findUnique({
            where: { id: batch.plant_type_id },
        });

        const frequency = plantType?.irrigation_frequency_days || 7;
        const daysToGenerate = 21; // 3 weeks of history

        // Generate irrigation events based on frequency
        for (let day = daysToGenerate; day >= 0; day -= frequency) {
            // Add some randomness (±1 day)
            const actualDay = day + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
            if (actualDay < 0) continue;

            const irrigationDate = daysAgo(actualDay);
            irrigationDate.setHours(6 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60));

            await prisma.irrigation_events.create({
                data: {
                    plant_batch_id: batch.id,
                    created_by: ADMIN_USER_ID,
                    scheduled_date: irrigationDate,
                    executed_date: irrigationDate,
                    water_amount_liters: 10 + Math.floor(Math.random() * 20),
                    method: randomItem(['drip', 'sprinkler', 'manual', 'automated']),
                    status: 'completed',
                    notes: randomItem(IRRIGATION_NOTES),
                },
            });
            count++;
        }
    }

    console.log(`   ✓ Created ${count} irrigation events`);
}

async function createStatusHistory(batches: any[]) {
    console.log('\n📊 Creating status history...');
    let count = 0;

    for (const batch of batches) {
        // Generate 2-5 status changes per batch over the past month
        const numChanges = 2 + Math.floor(Math.random() * 4);
        let currentStatus = 'healthy';

        for (let i = 0; i < numChanges; i++) {
            const nextStatus = randomItem(STATUSES);
            if (nextStatus === currentStatus) continue;

            const changeDate = daysAgo(30 - (i * 7) + Math.floor(Math.random() * 5));
            changeDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

            // Get appropriate reason
            let reason = 'Status updated during routine inspection';
            const transitionKey = `${currentStatus}_to_${nextStatus}`;
            const reasons = (STATUS_CHANGE_REASONS as any)[transitionKey];
            if (reasons) {
                reason = randomItem(reasons);
            }

            await prisma.status_history.create({
                data: {
                    plant_batch_id: batch.id,
                    changed_by: ADMIN_USER_ID,
                    status: nextStatus,
                    previous_status: currentStatus,
                    reason: reason,
                    changed_at: changeDate,
                },
            });

            currentStatus = nextStatus;
            count++;
        }

        // Update batch with final status
        await prisma.plant_batches.update({
            where: { id: batch.id },
            data: { current_status: currentStatus },
        });
    }

    console.log(`   ✓ Created ${count} status history entries`);
}

async function createNotes(batches: any[]) {
    console.log('\n📝 Creating notes and observations...');
    let count = 0;

    for (const batch of batches) {
        // Generate 5-10 notes per batch over the past 3 weeks
        const numNotes = 5 + Math.floor(Math.random() * 6);

        for (let i = 0; i < numNotes; i++) {
            const noteDate = daysAgo(Math.floor(Math.random() * 21));
            noteDate.setHours(7 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

            // 80% observations, 20% problems
            const isProblem = Math.random() < 0.2;

            await prisma.notes.create({
                data: {
                    plant_batch_id: batch.id,
                    created_by: ADMIN_USER_ID,
                    note_type: isProblem ? 'disease' : 'observation',
                    content: isProblem ? randomItem(PROBLEM_NOTES) : randomItem(OBSERVATION_NOTES),
                    created_at: noteDate,
                },
            });
            count++;
        }
    }

    console.log(`   ✓ Created ${count} notes`);
}

async function createImportJobs() {
    console.log('\n📥 Creating import job history...');

    // Create several import jobs to show audit trail
    const importDates = [daysAgo(14), daysAgo(10), daysAgo(7), daysAgo(3), daysAgo(1)];

    for (const date of importDates) {
        const total = 5 + Math.floor(Math.random() * 15);
        const failed = Math.random() < 0.2 ? Math.floor(Math.random() * 3) : 0;

        await prisma.import_jobs.create({
            data: {
                created_by: ADMIN_USER_ID,
                status: failed > 0 ? 'completed_with_errors' : 'completed',
                total_records: total,
                successful_records: total - failed,
                failed_records: failed,
                error_log: failed > 0 ? [{ error: 'Duplicate irrigation event detected' }] : [],
                created_at: date,
                completed_at: new Date(date.getTime() + 5000), // 5 seconds later
            },
        });
    }

    console.log(`   ✓ Created ${importDates.length} import job records`);
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     🌱 Smart Farm - Demo Data Seeder 🌱                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\nUsing Admin User ID: ${ADMIN_USER_ID}`);

    try {
        // Clear old data
        await clearOldData();

        // Get plant types (should already exist from initial seed)
        const plantTypes = await getPlantTypes();
        if (plantTypes.length === 0) {
            console.error('\n❌ No plant types found. Please run initial seed first.');
            process.exit(1);
        }
        console.log(`\n✓ Found ${plantTypes.length} plant types`);

        // Create all data
        const fields = await createFields();
        const batches = await createPlantBatches(fields, plantTypes);
        await createIrrigationEvents(batches);
        await createStatusHistory(batches);
        await createNotes(batches);
        await createImportJobs();

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║     ✅ Demo data seeding completed successfully! ✅         ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('\nSummary:');
        console.log(`   • ${fields.length} fields`);
        console.log(`   • ${batches.length} plant batches`);
        console.log(`   • Irrigation events across 3 weeks`);
        console.log(`   • Status history with realistic transitions`);
        console.log(`   • Notes and observations`);
        console.log(`   • Import audit trail`);

    } catch (error) {
        console.error('\n❌ Error seeding data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
