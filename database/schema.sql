-- Stray Animals Shelter Management System

DROP VIEW IF EXISTS vw_available_animals;
DROP VIEW IF EXISTS vw_branch_summary;
DROP VIEW IF EXISTS vw_employee_hours_summary;

DROP TRIGGER IF EXISTS trg_adoption_status ON adoption;
DROP TRIGGER IF EXISTS trg_audit_animal_status ON animal;
DROP TRIGGER IF EXISTS trg_check_adoption_eligibility ON adoption;

DROP TABLE IF EXISTS training_session    CASCADE;
DROP TABLE IF EXISTS donation            CASCADE;
DROP TABLE IF EXISTS volunteer           CASCADE;
DROP TABLE IF EXISTS medical_record      CASCADE;
DROP TABLE IF EXISTS adoption            CASCADE;
DROP TABLE IF EXISTS animal_sale         CASCADE;
DROP TABLE IF EXISTS rescue_mission      CASCADE;
DROP TABLE IF EXISTS report              CASCADE;
DROP TABLE IF EXISTS animal_care_log     CASCADE;
DROP TABLE IF EXISTS animal              CASCADE;
DROP TABLE IF EXISTS employee_shift      CASCADE;
DROP TABLE IF EXISTS employee            CASCADE;
DROP TABLE IF EXISTS rescue_team         CASCADE;
DROP TABLE IF EXISTS branch              CASCADE;
DROP TABLE IF EXISTS city                CASCADE;
DROP TABLE IF EXISTS species             CASCADE;
DROP TABLE IF EXISTS role                CASCADE;
DROP TABLE IF EXISTS audit_log           CASCADE;

CREATE TABLE city (
    city_id     SERIAL PRIMARY KEY,
    city_name   VARCHAR(100) NOT NULL,
    province    VARCHAR(100) NOT NULL,
    country     VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
    UNIQUE (city_name, province, country)
);

CREATE TABLE species (
    species_id   SERIAL PRIMARY KEY,
    species_name VARCHAR(50)  NOT NULL UNIQUE,
    avg_lifespan_years INT CHECK (avg_lifespan_years > 0)
);

CREATE TABLE role (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50)  NOT NULL UNIQUE,
    base_salary NUMERIC(10,2) NOT NULL CHECK (base_salary >= 0),
    permissions TEXT
);

CREATE TABLE branch (
    branch_id       SERIAL PRIMARY KEY,
    branch_name     VARCHAR(150) NOT NULL,
    city_id         INT          NOT NULL REFERENCES city(city_id),
    address         VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(150) UNIQUE,
    capacity        INT          NOT NULL CHECK (capacity > 0),
    opened_date     DATE         NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE employee (
    employee_id   SERIAL PRIMARY KEY,
    first_name    VARCHAR(80)  NOT NULL,
    last_name     VARCHAR(80)  NOT NULL,
    cnic          CHAR(15)     UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    hire_date     DATE         NOT NULL,
    branch_id     INT          NOT NULL REFERENCES branch(branch_id),
    role_id       INT          NOT NULL REFERENCES role(role_id),
    salary        NUMERIC(10,2) NOT NULL CHECK (salary >= 0),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE employee_shift (
    shift_id      SERIAL PRIMARY KEY,
    employee_id   INT          NOT NULL REFERENCES employee(employee_id),
    shift_date    DATE         NOT NULL,
    start_time    TIME         NOT NULL,
    end_time      TIME         NOT NULL,
    hours_worked  NUMERIC(4,2) GENERATED ALWAYS AS
                    (EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) STORED,
    CHECK (end_time > start_time)
);

CREATE TABLE rescue_team (
    team_id       SERIAL PRIMARY KEY,
    team_name     VARCHAR(100) NOT NULL,
    branch_id     INT          NOT NULL REFERENCES branch(branch_id),
    leader_id     INT          REFERENCES employee(employee_id),
    vehicle_plate VARCHAR(20),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE animal (
    animal_id     SERIAL PRIMARY KEY,
    name          VARCHAR(80),
    species_id    INT          NOT NULL REFERENCES species(species_id),
    breed         VARCHAR(80),
    gender        CHAR(1)      CHECK (gender IN ('M','F','U')),
    date_of_birth DATE,
    colour        VARCHAR(50),
    weight_kg     NUMERIC(5,2) CHECK (weight_kg > 0),
    microchip_no  VARCHAR(50)  UNIQUE,
    health_status VARCHAR(20)  NOT NULL DEFAULT 'Unknown'
                  CHECK (health_status IN ('Healthy','Injured','Sick','Recovering','Unknown')),
    status        VARCHAR(20)  NOT NULL DEFAULT 'In Shelter'
                  CHECK (status IN ('In Shelter','Adopted','Sold','Deceased','Released')),
    branch_id     INT          NOT NULL REFERENCES branch(branch_id),
    intake_date   DATE         NOT NULL DEFAULT CURRENT_DATE,
    intake_method VARCHAR(20)  NOT NULL
                  CHECK (intake_method IN ('Rescue','Donation','Owner Surrender','Other'))
);

CREATE TABLE report (
    report_id       SERIAL PRIMARY KEY,
    channel         VARCHAR(20) NOT NULL
                    CHECK (channel IN ('Email','Phone','Walk-in','Other')),
    reporter_name   VARCHAR(150),
    reporter_contact VARCHAR(150),
    description     TEXT        NOT NULL,
    location_text   VARCHAR(255) NOT NULL,
    city_id         INT         NOT NULL REFERENCES city(city_id),
    reported_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(20) NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Assigned','Resolved','Closed')),
    assigned_team_id INT        REFERENCES rescue_team(team_id)
);

CREATE TABLE rescue_mission (
    mission_id    SERIAL PRIMARY KEY,
    report_id     INT          REFERENCES report(report_id),
    team_id       INT          NOT NULL REFERENCES rescue_team(team_id),
    animal_id     INT          REFERENCES animal(animal_id),
    dispatched_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed_at  TIMESTAMPTZ,
    outcome       VARCHAR(20)  NOT NULL DEFAULT 'Ongoing'
                  CHECK (outcome IN ('Rescued','Not Found','Ongoing','Cancelled')),
    notes         TEXT
);

CREATE TABLE animal_care_log (
    log_id        SERIAL PRIMARY KEY,
    animal_id     INT          NOT NULL REFERENCES animal(animal_id),
    employee_id   INT          NOT NULL REFERENCES employee(employee_id),
    log_date      DATE         NOT NULL DEFAULT CURRENT_DATE,
    care_type     VARCHAR(30)  NOT NULL
                  CHECK (care_type IN ('Vaccination','Treatment','Feeding','Check-up','Other')),
    notes         TEXT,
    cost          NUMERIC(8,2) CHECK (cost >= 0)
);

CREATE TABLE adoption (
    adoption_id     SERIAL PRIMARY KEY,
    animal_id       INT          NOT NULL REFERENCES animal(animal_id),
    adopter_name    VARCHAR(150) NOT NULL,
    adopter_cnic    CHAR(15),
    adopter_contact VARCHAR(150) NOT NULL,
    adopter_address TEXT,
    employee_id     INT          NOT NULL REFERENCES employee(employee_id),
    adoption_date   DATE         NOT NULL DEFAULT CURRENT_DATE,
    adoption_fee    NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (adoption_fee >= 0),
    status          VARCHAR(20)  NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Approved','Rejected','Completed'))
);

CREATE TABLE animal_sale (
    sale_id         SERIAL PRIMARY KEY,
    animal_id       INT          NOT NULL REFERENCES animal(animal_id),
    sale_type       VARCHAR(20)  NOT NULL
                    CHECK (sale_type IN ('Sale','Donation Received')),
    counterparty_name    VARCHAR(150),
    counterparty_contact VARCHAR(150),
    employee_id     INT          NOT NULL REFERENCES employee(employee_id),
    transaction_date DATE        NOT NULL DEFAULT CURRENT_DATE,
    amount          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    notes           TEXT
);

CREATE TABLE audit_log (
    audit_id      SERIAL PRIMARY KEY,
    table_name    VARCHAR(50)  NOT NULL,
    record_id     INT          NOT NULL,
    action        VARCHAR(10)  NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    old_value     TEXT,
    new_value     TEXT,
    changed_by    VARCHAR(100),
    changed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE medical_record (
    record_id            SERIAL PRIMARY KEY,
    animal_id            INT          NOT NULL REFERENCES animal(animal_id),
    employee_id          INT          NOT NULL REFERENCES employee(employee_id),
    visit_date           DATE         NOT NULL DEFAULT CURRENT_DATE,
    diagnosis            VARCHAR(200),
    treatment_plan       TEXT,
    medication_prescribed TEXT,
    cost                 NUMERIC(8,2) CHECK (cost >= 0),
    next_visit_date      DATE
);

CREATE TABLE volunteer (
    volunteer_id      SERIAL PRIMARY KEY,
    first_name        VARCHAR(80)  NOT NULL,
    last_name         VARCHAR(80)  NOT NULL,
    cnic              CHAR(15)     UNIQUE,
    email             VARCHAR(150) NOT NULL UNIQUE,
    phone             VARCHAR(20),
    registration_date DATE         NOT NULL DEFAULT CURRENT_DATE,
    branch_id         INT          NOT NULL REFERENCES branch(branch_id),
    skills            TEXT,
    hours_contributed INT          DEFAULT 0 CHECK (hours_contributed >= 0),
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE donation (
    donation_id    SERIAL PRIMARY KEY,
    donor_name     VARCHAR(150) NOT NULL,
    donor_contact  VARCHAR(150),
    donor_email    VARCHAR(150),
    branch_id      INT          NOT NULL REFERENCES branch(branch_id),
    donation_date  DATE         NOT NULL DEFAULT CURRENT_DATE,
    donation_type  VARCHAR(20)  NOT NULL
                   CHECK (donation_type IN ('Cash','Items','Both')),
    amount         NUMERIC(10,2) DEFAULT 0 CHECK (amount >= 0),
    items_donated  TEXT,
    notes          TEXT
);

CREATE TABLE training_session (
    session_id       SERIAL PRIMARY KEY,
    session_name     VARCHAR(150) NOT NULL,
    branch_id        INT          NOT NULL REFERENCES branch(branch_id),
    session_date     DATE         NOT NULL,
    start_time       TIME         NOT NULL,
    end_time         TIME         NOT NULL,
    trainer_id       INT          NOT NULL REFERENCES employee(employee_id),
    topic            VARCHAR(200) NOT NULL,
    max_participants INT          CHECK (max_participants > 0),
    description      TEXT,
    CHECK (end_time > start_time)
);

CREATE INDEX idx_branch_city ON branch(city_id);
CREATE INDEX idx_employee_branch  ON employee(branch_id);
CREATE INDEX idx_employee_role    ON employee(role_id);
CREATE INDEX idx_employee_active  ON employee(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_shift_employee   ON employee_shift(employee_id);
CREATE INDEX idx_shift_date       ON employee_shift(shift_date);
CREATE INDEX idx_animal_branch    ON animal(branch_id);
CREATE INDEX idx_animal_species   ON animal(species_id);
CREATE INDEX idx_animal_status    ON animal(status);
CREATE INDEX idx_animal_health    ON animal(health_status);
CREATE INDEX idx_report_city      ON report(city_id);
CREATE INDEX idx_report_status    ON report(status);
CREATE INDEX idx_report_team      ON report(assigned_team_id);
CREATE INDEX idx_mission_team     ON rescue_mission(team_id);
CREATE INDEX idx_mission_animal   ON rescue_mission(animal_id);
CREATE INDEX idx_care_animal      ON animal_care_log(animal_id);
CREATE INDEX idx_care_date        ON animal_care_log(log_date);
CREATE INDEX idx_adoption_animal  ON adoption(animal_id);
CREATE INDEX idx_adoption_status  ON adoption(status);
CREATE INDEX idx_medical_animal   ON medical_record(animal_id);
CREATE INDEX idx_medical_employee ON medical_record(employee_id);
CREATE INDEX idx_medical_date     ON medical_record(visit_date);
CREATE INDEX idx_volunteer_branch ON volunteer(branch_id);
CREATE INDEX idx_volunteer_active ON volunteer(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_donation_branch  ON donation(branch_id);
CREATE INDEX idx_donation_date    ON donation(donation_date);
CREATE INDEX idx_training_branch  ON training_session(branch_id);
CREATE INDEX idx_training_date    ON training_session(session_date);
CREATE INDEX idx_training_trainer ON training_session(trainer_id);

CREATE OR REPLACE FUNCTION fn_adoption_status_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        UPDATE animal
        SET status = 'Adopted'
        WHERE animal_id = NEW.animal_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_adoption_status
AFTER UPDATE ON adoption
FOR EACH ROW
EXECUTE FUNCTION fn_adoption_status_update();

CREATE OR REPLACE FUNCTION fn_audit_animal_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_log(table_name, record_id, action, old_value, new_value, changed_by)
        VALUES ('animal', NEW.animal_id, 'UPDATE', OLD.status, NEW.status, current_user);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_animal_status
AFTER UPDATE ON animal
FOR EACH ROW
EXECUTE FUNCTION fn_audit_animal_status();

CREATE OR REPLACE FUNCTION fn_check_animal_available_for_adoption()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_status VARCHAR(20);
BEGIN
    SELECT status INTO v_status FROM animal WHERE animal_id = NEW.animal_id;
    IF v_status != 'In Shelter' THEN
        RAISE EXCEPTION 'Animal % is not available for adoption (current status: %)',
                        NEW.animal_id, v_status;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_adoption_eligibility
BEFORE INSERT ON adoption
FOR EACH ROW
EXECUTE FUNCTION fn_check_animal_available_for_adoption();

CREATE VIEW vw_available_animals AS
SELECT
    a.animal_id,
    a.name,
    s.species_name,
    a.breed,
    a.gender,
    a.colour,
    a.health_status,
    a.intake_date,
    b.branch_name,
    c.city_name
FROM animal a
JOIN species  s ON s.species_id = a.species_id
JOIN branch   b ON b.branch_id  = a.branch_id
JOIN city     c ON c.city_id    = b.city_id
WHERE a.status = 'In Shelter'
  AND a.health_status IN ('Healthy', 'Recovering');

CREATE VIEW vw_branch_summary AS
SELECT
    b.branch_id,
    b.branch_name,
    c.city_name,
    b.capacity,
    COUNT(DISTINCT a.animal_id) FILTER (WHERE a.status = 'In Shelter') AS animals_in_shelter,
    b.capacity - COUNT(DISTINCT a.animal_id) FILTER (WHERE a.status = 'In Shelter') AS available_capacity,
    COUNT(DISTINCT e.employee_id) FILTER (WHERE e.is_active) AS active_employees,
    COUNT(DISTINCT rt.team_id) AS rescue_teams
FROM branch b
JOIN city c ON c.city_id = b.city_id
LEFT JOIN animal       a  ON a.branch_id = b.branch_id
LEFT JOIN employee     e  ON e.branch_id = b.branch_id
LEFT JOIN rescue_team  rt ON rt.branch_id = b.branch_id
GROUP BY b.branch_id, b.branch_name, c.city_name, b.capacity;

CREATE VIEW vw_employee_hours_summary AS
SELECT
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    r.role_name,
    b.branch_name,
    DATE_TRUNC('month', es.shift_date) AS month,
    COUNT(es.shift_id)                 AS shifts_count,
    SUM(es.hours_worked)               AS total_hours
FROM employee_shift es
JOIN employee e ON e.employee_id = es.employee_id
JOIN role     r ON r.role_id     = e.role_id
JOIN branch   b ON b.branch_id   = e.branch_id
GROUP BY e.employee_id, employee_name, r.role_name, b.branch_name, month;
