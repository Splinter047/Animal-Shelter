-- Stray Animals Shelter Performance:wq

DROP INDEX IF EXISTS idx_animal_status;
DROP INDEX IF EXISTS idx_animal_health;
DROP INDEX IF EXISTS idx_branch_city;

EXPLAIN ANALYZE
SELECT
    a.animal_id,
    a.name,
    s.species_name,
    a.breed,
    a.colour,
    a.gender,
    b.branch_name,
    c.city_name
FROM animal a
JOIN species s ON s.species_id = a.species_id
JOIN branch  b ON b.branch_id  = a.branch_id
JOIN city    c ON c.city_id    = b.city_id
WHERE a.status = 'In Shelter'
  AND a.health_status IN ('Healthy', 'Recovering')
  AND c.city_id = 1
ORDER BY a.intake_date ASC;

CREATE INDEX IF NOT EXISTS idx_animal_status ON animal(status);
CREATE INDEX IF NOT EXISTS idx_animal_health  ON animal(health_status);
CREATE INDEX IF NOT EXISTS idx_branch_city    ON branch(city_id);

EXPLAIN ANALYZE
SELECT
    a.animal_id,
    a.name,
    s.species_name,
    a.breed,
    a.colour,
    a.gender,
    b.branch_name,
    c.city_name
FROM animal a
JOIN species s ON s.species_id = a.species_id
JOIN branch  b ON b.branch_id  = a.branch_id
JOIN city    c ON c.city_id    = b.city_id
WHERE a.status = 'In Shelter'
  AND a.health_status IN ('Healthy', 'Recovering')
  AND c.city_id = 1
ORDER BY a.intake_date ASC;

-- replaces Seq Scan on animal and branch, reducing rows examined significantly.



DROP INDEX IF EXISTS idx_shift_employee;
DROP INDEX IF EXISTS idx_shift_date;

EXPLAIN ANALYZE
SELECT
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    b.branch_name,
    DATE_TRUNC('month', es.shift_date) AS month,
    SUM(es.hours_worked)               AS total_hours,
    COUNT(*)                           AS shifts
FROM employee_shift es
JOIN employee e ON e.employee_id = es.employee_id
JOIN branch   b ON b.branch_id   = e.branch_id
GROUP BY e.employee_id, employee_name, b.branch_name, month
ORDER BY month DESC, total_hours DESC;

CREATE INDEX IF NOT EXISTS idx_shift_employee ON employee_shift(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_date     ON employee_shift(shift_date);

EXPLAIN ANALYZE
SELECT
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    b.branch_name,
    DATE_TRUNC('month', es.shift_date) AS month,
    SUM(es.hours_worked)               AS total_hours,
    COUNT(*)                           AS shifts
FROM employee_shift es
JOIN employee e ON e.employee_id = es.employee_id
JOIN branch   b ON b.branch_id   = e.branch_id
GROUP BY e.employee_id, employee_name, b.branch_name, month
ORDER BY month DESC, total_hours DESC;




DROP INDEX IF EXISTS idx_report_status;
DROP INDEX IF EXISTS idx_report_city;
DROP INDEX IF EXISTS idx_report_team;

EXPLAIN ANALYZE
SELECT
    r.report_id,
    r.channel,
    r.reporter_name,
    r.description,
    r.location_text,
    c.city_name,
    r.reported_at,
    rt.team_name,
    e.first_name || ' ' || e.last_name AS team_leader
FROM report r
JOIN city          c  ON c.city_id  = r.city_id
LEFT JOIN rescue_team rt ON rt.team_id = r.assigned_team_id
LEFT JOIN employee    e  ON e.employee_id = rt.leader_id
WHERE r.status IN ('Pending', 'Assigned')
ORDER BY r.reported_at ASC;

CREATE INDEX IF NOT EXISTS idx_report_status ON report(status);
CREATE INDEX IF NOT EXISTS idx_report_city   ON report(city_id);
CREATE INDEX IF NOT EXISTS idx_report_team   ON report(assigned_team_id);

EXPLAIN ANALYZE
SELECT
    r.report_id,
    r.channel,
    r.reporter_name,
    r.description,
    r.location_text,
    c.city_name,
    r.reported_at,
    rt.team_name,
    e.first_name || ' ' || e.last_name AS team_leader
FROM report r
JOIN city          c  ON c.city_id  = r.city_id
LEFT JOIN rescue_team rt ON rt.team_id = r.assigned_team_id
LEFT JOIN employee    e  ON e.employee_id = rt.leader_id
WHERE r.status IN ('Pending', 'Assigned')
ORDER BY r.reported_at ASC;




DROP INDEX IF EXISTS idx_care_animal;
DROP INDEX IF EXISTS idx_care_date;

EXPLAIN ANALYZE
SELECT
    a.animal_id,
    COALESCE(a.name, 'Unnamed') AS animal_name,
    s.species_name,
    b.branch_name,
    COUNT(cl.log_id)            AS care_sessions,
    SUM(cl.cost)                AS total_cost
FROM animal_care_log cl
JOIN animal  a ON a.animal_id  = cl.animal_id
JOIN species s ON s.species_id = a.species_id
JOIN branch  b ON b.branch_id  = a.branch_id
WHERE cl.log_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY a.animal_id, animal_name, s.species_name, b.branch_name
ORDER BY total_cost DESC;

CREATE INDEX IF NOT EXISTS idx_care_animal ON animal_care_log(animal_id);
CREATE INDEX IF NOT EXISTS idx_care_date   ON animal_care_log(log_date);

EXPLAIN ANALYZE
SELECT
    a.animal_id,
    COALESCE(a.name, 'Unnamed') AS animal_name,
    s.species_name,
    b.branch_name,
    COUNT(cl.log_id)            AS care_sessions,
    SUM(cl.cost)                AS total_cost
FROM animal_care_log cl
JOIN animal  a ON a.animal_id  = cl.animal_id
JOIN species s ON s.species_id = a.species_id
JOIN branch  b ON b.branch_id  = a.branch_id
WHERE cl.log_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY a.animal_id, animal_name, s.species_name, b.branch_name
ORDER BY total_cost DESC;


