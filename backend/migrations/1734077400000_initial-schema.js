/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    // Enable UUID extension
    pgm.createExtension('pgcrypto', { ifNotExists: true });

    // Create users table
    pgm.createTable('users', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
            unique: true
        },
        name: {
            type: 'varchar(255)',
            notNull: true
        },
        password_hash: {
            type: 'varchar(255)',
            notNull: true
        },
        role: {
            type: 'varchar(50)',
            default: 'farmer'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        }
    });

    // Create fields table
    pgm.createTable('fields', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE'
        },
        name: {
            type: 'varchar(255)',
            notNull: true
        },
        location: {
            type: 'varchar(255)'
        },
        size_hectares: {
            type: 'decimal(10,2)'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        deleted_at: {
            type: 'timestamp'
        },
        archived_at: {
            type: 'timestamp'
        }
    });

    // Create plant_types table
    pgm.createTable('plant_types', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        name: {
            type: 'varchar(255)',
            notNull: true
        },
        scientific_name: {
            type: 'varchar(255)'
        },
        irrigation_frequency_days: {
            type: 'integer',
            notNull: true
        },
        growth_duration_days: {
            type: 'integer'
        },
        optimal_temperature_min: {
            type: 'decimal(5,2)'
        },
        optimal_temperature_max: {
            type: 'decimal(5,2)'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        }
    });

    // Create plant_batches table
    pgm.createTable('plant_batches', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        field_id: {
            type: 'uuid',
            notNull: true,
            references: 'fields(id)',
            onDelete: 'CASCADE'
        },
        plant_type_id: {
            type: 'uuid',
            notNull: true,
            references: 'plant_types(id)',
            onDelete: 'RESTRICT'
        },
        batch_name: {
            type: 'varchar(255)',
            notNull: true
        },
        planting_date: {
            type: 'date',
            notNull: true
        },
        quantity: {
            type: 'integer'
        },
        current_status: {
            type: 'varchar(50)',
            default: 'healthy'
        },
        last_irrigation_date: {
            type: 'date'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        deleted_at: {
            type: 'timestamp'
        }
    });

    // Create status_history table
    pgm.createTable('status_history', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        plant_batch_id: {
            type: 'uuid',
            notNull: true,
            references: 'plant_batches(id)',
            onDelete: 'CASCADE'
        },
        status: {
            type: 'varchar(50)',
            notNull: true
        },
        previous_status: {
            type: 'varchar(50)'
        },
        changed_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        changed_by: {
            type: 'uuid',
            notNull: true,
            references: 'users(id)',
            onDelete: 'SET NULL'
        },
        reason: {
            type: 'text'
        },
        severity: {
            type: 'varchar(20)'
        }
    });

    // Create irrigation_events table
    pgm.createTable('irrigation_events', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        plant_batch_id: {
            type: 'uuid',
            notNull: true,
            references: 'plant_batches(id)',
            onDelete: 'CASCADE'
        },
        scheduled_date: {
            type: 'date',
            notNull: true
        },
        executed_date: {
            type: 'date'
        },
        status: {
            type: 'varchar(20)',
            default: 'planned'
        },
        water_amount_liters: {
            type: 'decimal(10,2)'
        },
        method: {
            type: 'varchar(50)'
        },
        notes: {
            type: 'text'
        },
        created_by: {
            type: 'uuid',
            notNull: true,
            references: 'users(id)',
            onDelete: 'SET NULL'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        }
    });

    // Create notes table
    pgm.createTable('notes', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        plant_batch_id: {
            type: 'uuid',
            notNull: true,
            references: 'plant_batches(id)',
            onDelete: 'CASCADE'
        },
        note_type: {
            type: 'varchar(50)',
            notNull: true
        },
        content: {
            type: 'text',
            notNull: true
        },
        linked_event_type: {
            type: 'varchar(50)'
        },
        linked_event_id: {
            type: 'uuid'
        },
        created_by: {
            type: 'uuid',
            notNull: true,
            references: 'users(id)',
            onDelete: 'SET NULL'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        edited_at: {
            type: 'timestamp'
        },
        deleted_at: {
            type: 'timestamp'
        }
    });

    // Create import_jobs table
    pgm.createTable('import_jobs', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        filename: {
            type: 'varchar(255)'
        },
        status: {
            type: 'varchar(50)',
            default: 'pending'
        },
        total_records: {
            type: 'integer'
        },
        successful_records: {
            type: 'integer',
            default: 0
        },
        failed_records: {
            type: 'integer',
            default: 0
        },
        error_log: {
            type: 'jsonb'
        },
        created_by: {
            type: 'uuid',
            notNull: true,
            references: 'users(id)',
            onDelete: 'SET NULL'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        completed_at: {
            type: 'timestamp'
        }
    });

    // Create indexes for better query performance
    pgm.createIndex('fields', 'user_id');
    pgm.createIndex('fields', 'deleted_at');
    pgm.createIndex('plant_batches', 'field_id');
    pgm.createIndex('plant_batches', 'plant_type_id');
    pgm.createIndex('plant_batches', 'current_status');
    pgm.createIndex('plant_batches', 'deleted_at');
    pgm.createIndex('plant_batches', 'last_irrigation_date');
    pgm.createIndex('status_history', 'plant_batch_id');
    pgm.createIndex('status_history', 'changed_at');
    pgm.createIndex('irrigation_events', 'plant_batch_id');
    pgm.createIndex('irrigation_events', 'scheduled_date');
    pgm.createIndex('irrigation_events', 'status');
    pgm.createIndex('notes', 'plant_batch_id');
    pgm.createIndex('notes', 'note_type');
    pgm.createIndex('notes', 'deleted_at');
};

exports.down = pgm => {
    pgm.dropTable('import_jobs');
    pgm.dropTable('notes');
    pgm.dropTable('irrigation_events');
    pgm.dropTable('status_history');
    pgm.dropTable('plant_batches');
    pgm.dropTable('plant_types');
    pgm.dropTable('fields');
    pgm.dropTable('users');
    pgm.dropExtension('pgcrypto');
};
