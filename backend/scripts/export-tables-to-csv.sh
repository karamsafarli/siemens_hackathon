#!/bin/bash

# Export all tables from smart_farm database to CSV files
# Usage: ./export-tables-to-csv.sh

# Configuration
DB_NAME="smart_farm"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
OUTPUT_DIR="./csv_exports"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "🚀 Starting CSV export from $DB_NAME database..."
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# List of tables to export
TABLES=(
    "users"
    "fields"
    "plant_types"
    "plant_batches"
    "irrigation_events"
    "notes"
    "status_history"
    "import_jobs"
)

# Export each table
for table in "${TABLES[@]}"; do
    echo "📊 Exporting $table..."
    
    # Using psql COPY command
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\COPY $table TO '$OUTPUT_DIR/${table}.csv' WITH CSV HEADER"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ $table exported successfully"
    else
        echo "   ❌ Failed to export $table"
    fi
done

echo ""
echo "🎉 Export complete! Files saved to: $OUTPUT_DIR"
echo ""
echo "📋 Exported files:"
ls -lh "$OUTPUT_DIR"/*.csv
