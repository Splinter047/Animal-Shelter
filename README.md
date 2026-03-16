# Stray Animals Shelter Management System

Database course project with PostgreSQL database and REST API backend.

## Setup

### Database
```bash
sudo -u postgres psql
CREATE DATABASE shelter_db;
CREATE USER shelter_admin WITH PASSWORD 'meow';
GRANT ALL PRIVILEGES ON DATABASE shelter_db TO shelter_admin;
\q

cd database
PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db -f schema.sql
PGPASSWORD=meow psql -h localhost -U shelter_admin -d shelter_db -f seed.sql
```

### Backend
```bash
cp .env.example backend/.env
cd backend
npm install
node src/seed-passwords.js
npm start
```

Server: `http://localhost:3000`

## Quick Test

```bash
# Login (default password: password123)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ali.hassan@sas.org.pk","password":"password123"}'

# Use returned token
curl http://localhost:3000/api/v1/animals -H "Authorization: Bearer TOKEN"
```
