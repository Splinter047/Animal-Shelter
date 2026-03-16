#!/bin/bash

OUTPUT_DIR="media"
BASE_URL="http://localhost:3000/api/v1"

mkdir -p $OUTPUT_DIR

TOKEN=$(curl -s -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ali.hassan@sas.org.pk","password":"password123"}' | jq -r '.token')

run_scenario1() {
  ANIMAL_ID=$(PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db -t -c \
    "SELECT animal_id FROM animal WHERE status = 'In Shelter' LIMIT 1;" | tr -d ' ')

  echo "Selected Animal ID: $ANIMAL_ID"
  curl -s -X GET "${BASE_URL}/animals" \
    -H "Authorization: Bearer ${TOKEN}" | jq ".[] | select(.animal_id == ${ANIMAL_ID}) | {animal_id, name, status}"
  echo ""

  echo "--- COMMIT: Successful Adoption ---"
  curl -s -X POST ${BASE_URL}/adoptions \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"animal_id\": ${ANIMAL_ID},
      \"adopter_name\": \"John Smith\",
      \"adopter_cnic\": \"12345-1234567-1\",
      \"adopter_contact\": \"+92-300-1234567\",
      \"adopter_address\": \"123 Main St, Karachi\",
      \"adoption_fee\": 5000.00,
      \"status\": \"Completed\"
    }" | jq .
  echo ""

  echo "--- DB: Animal status after adoption ---"
  PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db \
    -c "SELECT a.animal_id, a.name, a.status, ad.adopter_name
        FROM animal a JOIN adoption ad ON a.animal_id = ad.animal_id
        WHERE a.animal_id = ${ANIMAL_ID};"
  echo ""

  echo "--- ROLLBACK: Adopt same animal again ---"
  curl -s -X POST ${BASE_URL}/adoptions \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"animal_id\": ${ANIMAL_ID},
      \"adopter_name\": \"Jane Doe\",
      \"adopter_cnic\": \"54321-7654321-1\",
      \"adopter_contact\": \"+92-301-7654321\",
      \"adopter_address\": \"456 Other St, Lahore\",
      \"adoption_fee\": 5000.00,
      \"status\": \"Completed\"
    }" | jq .
  echo ""

  echo "--- DB: Adoption count (should be 1) ---"
  PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db \
    -c "SELECT COUNT(*) as adoption_count FROM adoption WHERE animal_id = ${ANIMAL_ID};"
}

run_scenario2() {
  REPORT_ID=$(curl -s -X POST ${BASE_URL}/rescues/reports \
    -H "Content-Type: application/json" \
    -d '{
      "reporter_name": "Ali Ahmed",
      "reporter_contact": "+92-300-9999999",
      "city_id": 1,
      "location": "Near City Park",
      "description": "Injured dog needs rescue"
    }' | jq -r '.report_id')

  echo "Created Report ID: $REPORT_ID"
  echo ""

  echo "--- COMMIT: Dispatch mission ---"
  curl -s -X POST ${BASE_URL}/rescues/missions \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"team_id\": 1, \"report_id\": ${REPORT_ID}}" | jq .
  echo ""

  echo "--- DB: Report and mission after dispatch ---"
  PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db \
    -c "SELECT r.report_id, r.status, r.assigned_team_id, rm.mission_id, rm.outcome
        FROM report r LEFT JOIN rescue_mission rm ON r.report_id = rm.report_id
        WHERE r.report_id = ${REPORT_ID};"
  echo ""

  echo "--- ROLLBACK: Dispatch with invalid team ---"
  curl -s -X POST ${BASE_URL}/rescues/missions \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"team_id\": 99999, \"report_id\": ${REPORT_ID}}" | jq .
  echo ""

  echo "--- DB: Mission count (should be 1) ---"
  PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db \
    -c "SELECT COUNT(*) as mission_count FROM rescue_mission WHERE report_id = ${REPORT_ID};"
}

run_scenario3() {
  echo "--- COMMIT: Surrender animal ---"
  ANIMAL_ID=$(curl -s -X POST ${BASE_URL}/animals/surrender \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Buddy",
      "species_id": 1,
      "breed": "Labrador Mix",
      "gender": "M",
      "weight_kg": 20.5,
      "colour": "Brown",
      "health_status": "Healthy",
      "branch_id": 1,
      "counterparty_name": "Sara Khan",
      "counterparty_contact": "+92-300-8888888",
      "notes": "Owner relocating abroad"
    }' | jq -r '.animal_id')

  echo "Surrendered Animal ID: $ANIMAL_ID"
  echo ""

  echo "--- DB: Animal, sale, and care log records ---"
  PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db \
    -c "SELECT a.animal_id, a.name, a.intake_method,
               s.sale_type, s.counterparty_name,
               c.care_type, c.notes
        FROM animal a
        JOIN animal_sale s ON a.animal_id = s.animal_id
        JOIN animal_care_log c ON a.animal_id = c.animal_id
        WHERE a.animal_id = ${ANIMAL_ID};"
  echo ""

  echo "--- ROLLBACK: Surrender with missing fields ---"
  curl -s -X POST ${BASE_URL}/animals/surrender \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "Ghost", "species_id": 1}' | jq .
  echo ""

  echo "--- DB: Ghost animal count (should be 0) ---"
  PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db \
    -c "SELECT COUNT(*) as ghost_count FROM animal WHERE name = 'Ghost';"
}

echo "=========================================="
echo "SCENARIO 1: ADOPTION TRANSACTION"
echo "=========================================="
run_scenario1 2>&1 | tee ${OUTPUT_DIR}/adoption-transaction.log
echo ""

echo "=========================================="
echo "SCENARIO 2: RESCUE MISSION TRANSACTION"
echo "=========================================="
run_scenario2 2>&1 | tee ${OUTPUT_DIR}/rescue-mission-transaction.log
echo ""

echo "=========================================="
echo "SCENARIO 3: ANIMAL SURRENDER TRANSACTION"
echo "=========================================="
run_scenario3 2>&1 | tee ${OUTPUT_DIR}/animal-surrender-transaction.log
echo ""

echo "Logs saved to ${OUTPUT_DIR}/"
ls -lh ${OUTPUT_DIR}/*.log
