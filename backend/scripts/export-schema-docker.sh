#!/bin/bash

# Export detailed schema of all tables from smart_farm database to a single text file
# Usage: ./export-schema-docker.sh [container_name]

# Configuration
CONTAINER_NAME="${1:-postgres}"  # Default to 'postgres' if not provided
DB_NAME="smart_farm"
DB_USER="postgres"
OUTPUT_FILE="./database_schema.txt"

echo "🐳 Exporting database schema from Docker container: $CONTAINER_NAME"
echo "📄 Output file: $OUTPUT_FILE"
echo ""

# Create header
cat > "$OUTPUT_FILE" << 'EOF'
================================================================================
SMART FARM DATABASE SCHEMA
================================================================================
Database: smart_farm
Generated: $(date)
================================================================================

EOF

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

# Export schema for each table
for table in "${TABLES[@]}"; do
    echo "📊 Exporting schema for $table..."
    
    # Add table header
    echo "" >> "$OUTPUT_FILE"
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "TABLE: $table" >> "$OUTPUT_FILE"
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    # Execute \d+ command inside Docker container (without -t to avoid TTY issues)
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" --no-psqlrc -c "\d+ $table" >> "$OUTPUT_FILE" 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ $table schema exported"
    else
        echo "   ❌ Failed to export $table schema"
    fi
    
    # Add separator
    echo "" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

# Add database summary at the end
echo "================================================================================" >> "$OUTPUT_FILE"
echo "DATABASE SUMMARY" >> "$OUTPUT_FILE"
echo "================================================================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" --no-psqlrc -c "\dt" >> "$OUTPUT_FILE" 2>&1

echo ""
echo "🎉 Schema export complete!"
echo "📄 File saved to: $OUTPUT_FILE"
echo "📏 File size: $(wc -l < "$OUTPUT_FILE") lines"
echo ""
echo "You can now use this file for your AI prompt!"
