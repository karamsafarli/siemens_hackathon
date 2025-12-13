export interface Field {
    id: string;
    user_id: string;
    name: string;
    location?: string;
    size_hectares?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    archived_at?: string;
    plant_count?: number;
}

export interface PlantType {
    id: string;
    name: string;
    scientific_name?: string;
    irrigation_frequency_days: number;
    growth_duration_days?: number;
    optimal_temperature_min?: number;
    optimal_temperature_max?: number;
}

export interface PlantBatch {
    id: string;
    field_id: string;
    plant_type_id: string;
    batch_name: string;
    planting_date: string;
    quantity?: number;
    current_status: string;
    last_irrigation_date?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    fields?: Field;
    plant_types?: PlantType;
    irrigation_status?: {
        next_due_date: string | null;
        days_overdue: number;
        status: 'on_time' | 'overdue' | 'critical';
    };
}

export interface Note {
    id: string;
    plant_batch_id: string;
    note_type: string;
    content: string;
    linked_event_type?: string;
    linked_event_id?: string;
    created_by: string;
    created_at: string;
    edited_at?: string;
    deleted_at?: string;
    plant_batches?: {
        batch_name: string;
        fields?: {
            name: string;
        };
    };
}

export interface DashboardStats {
    total_plants: number;
    plants_by_status: Array<{
        current_status: string;
        _count: number;
    }>;
    plants_by_field: Array<{
        field_id: string;
        field_name: string;
        count: number;
    }>;
    irrigation: {
        overdue: number;
        critical: number;
        total_overdue: number;
    };
    problem_plants: number;
    recent_activity: {
        notes_last_7_days: number;
    };
}

export interface Alert {
    type: 'irrigation' | 'status';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    plant_batch_id: string;
    batch_name: string;
    field_name: string;
    days_overdue?: number;
    status?: string;
}
