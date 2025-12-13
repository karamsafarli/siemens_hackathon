# External Data Import Demo

This folder contains scripts to simulate external data sources for the Smart Farm import API.

## Demo Scenarios

### 1. Manual Import via UI
Use the `/import` page in the web app to paste JSON data.

### 2. Automated Import Script
Run `simulate-external-import.js` to simulate an IoT/external system sending data.

### 3. Scheduled Import
Use a cron job or scheduler to run the import script periodically.

## Sample Data Files

- `sample-daily-data.json` - Normal daily farming data
- `sample-conflict-data.json` - Data with conflicts to show error handling
- `sample-sensor-data.json` - Simulated IoT sensor readings

## Running the Simulation

```bash
# Install dependencies if not already
cd backend

# Run simulation script
node scripts/simulate-external-import.js

# Or run with specific data file
node scripts/simulate-external-import.js sample-sensor-data.json
```
