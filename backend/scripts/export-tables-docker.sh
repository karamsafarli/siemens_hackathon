#!/bin/bash

# Export all tables from smart_farm database to CSV files (Docker version)
# Usage: ./export-tables-docker.sh [container_name]

# Configuration
CONTAINER_NAME="${1:-postgres}"  # Default to 'postgres' if not provided
DB_NAME="smart_farm"
DB_USER="postgres"
OUTPUT_DIR="./csv_exports"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "🐳 Starting CSV export from Docker container: $CONTAINER_NAME"
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
    
    # Execute psql inside Docker container and save output to local file
    docker exec -t "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "\COPY $table TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/${table}.csv"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ $table exported successfully ($(wc -l < "$OUTPUT_DIR/${table}.csv") rows)"
    else
        echo "   ❌ Failed to export $table"
    fi
done

echo ""
echo "🎉 Export complete! Files saved to: $OUTPUT_DIR"
echo ""
echo "📋 Exported files:"
ls -lh "$OUTPUT_DIR"/*.csv
