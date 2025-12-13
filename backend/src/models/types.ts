export interface User {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}

export interface Field {
    id: string;
    user_id: string;
    name: string;
    location?: string;
    size_hectares?: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
    archived_at?: Date;
}

export interface PlantType {
    id: string;
    name: string;
    scientific_name?: string;
    irrigation_frequency_days: number;
    growth_duration_days?: number;
    optimal_temperature_min?: number;
    optimal_temperature_max?: number;
    created_at: Date;
}

export interface PlantBatch {
    id: string;
    field_id: string;
    plant_type_id: string;
    batch_name: string;
    planting_date: Date;
    quantity?: number;
    current_status: string;
    last_irrigation_date?: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface StatusHistory {
    id: string;
    plant_batch_id: string;
    status: string;
    previous_status?: string;
    changed_at: Date;
    changed_by: string;
    reason?: string;
    severity?: string;
}

export interface IrrigationEvent {
    id: string;
    plant_batch_id: string;
    scheduled_date: Date;
    executed_date?: Date;
    status: 'planned' | 'completed' | 'skipped';
    water_amount_liters?: number;
    method?: string;
    notes?: string;
    created_by: string;
    created_at: Date;
}

export interface Note {
    id: string;
    plant_batch_id: string;
    note_type: string;
    content: string;
    linked_event_type?: string;
    linked_event_id?: string;
    created_by: string;
    created_at: Date;
    edited_at?: Date;
    deleted_at?: Date;
}

export interface ImportJob {
    id: string;
    filename?: string;
    status: string;
    total_records?: number;
    successful_records: number;
    failed_records: number;
    error_log?: any;
    created_by: string;
    created_at: Date;
    completed_at?: Date;
}

export type PlantStatus = 'healthy' | 'at_risk' | 'critical' | 'diseased' | 'harvested';
export type NoteType = 'irrigation' | 'disease' | 'fertilizer' | 'observation' | 'harvest' | 'weather' | 'general';
