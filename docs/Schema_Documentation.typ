#set page(paper: "a4", margin: 2.5cm)
#set text(font: "Linux Libertine", size: 11pt)
#set heading(numbering: "1.")
#set par(justify: true)

#align(center)[
  #text(size: 20pt, weight: "bold")[
    Stray Animals Shelter Management System
  ]
  
  #v(1cm)
  #text(size: 16pt)[Schema Documentation]
  
  #v(0.5cm)
  #text(size: 10pt)[Database: PostgreSQL 16]
]

#pagebreak()

#outline(title: "Table of Contents", indent: 1em)

#pagebreak()

= System Overview

The Stray Animals Shelter Management System manages the lifecycle of stray and surrendered animals across multiple cities and branches. The system handles rescue operations, animal care, adoptions, and sales.

The schema uses PostgreSQL 16 and follows Third Normal Form (3NF) principles.

== Tables

The database contains 14 tables:

- *Reference tables:* city, species, role
- *Organization:* branch, rescue_team
- *Staff:* employee, employee_shift
- *Animals:* animal, animal_care_log
- *Operations:* report, rescue_mission
- *Transactions:* adoption, animal_sale
- *System:* audit_log

= Normalization

== First Normal Form (1NF)
All columns contain atomic values. No repeating groups exist.

== Second Normal Form (2NF)
All tables use single-column primary keys (SERIAL). No partial dependencies exist.

== Third Normal Form (3NF)
No transitive dependencies. City names are stored in the city table only. Species names are stored in the species table only. Employee roles are stored in the role table only.

#pagebreak()

= Data Dictionary

== city
Stores city information.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [city_id], [SERIAL], [Primary key],
  [city_name], [VARCHAR(100)], [City name (unique, not null)],
  [province], [VARCHAR(100)], [Province name (not null)],
  [country], [VARCHAR(100)], [Country (default: Pakistan)],
)

== species
Animal species reference.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [species_id], [SERIAL], [Primary key],
  [species_name], [VARCHAR(50)], [Species name (unique, not null)],
  [avg_lifespan_years], [INT], [Average lifespan (check > 0)],
)

== role
Employee roles and base salaries.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [role_id], [SERIAL], [Primary key],
  [role_name], [VARCHAR(50)], [Role name (unique, not null)],
  [base_salary], [NUMERIC(10,2)], [Base salary (not null, >= 0)],
  [permissions], [TEXT], [JSON permissions],
)

== branch
Shelter branches.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [branch_id], [SERIAL], [Primary key],
  [branch_name], [VARCHAR(150)], [Branch name (not null)],
  [city_id], [INT], [Foreign key to city (not null)],
  [address], [VARCHAR(255)], [Street address (not null)],
  [phone], [VARCHAR(20)], [Phone number],
  [email], [VARCHAR(150)], [Email (unique)],
  [capacity], [INT], [Max capacity (not null, > 0)],
  [opened_date], [DATE], [Opening date (not null)],
  [is_active], [BOOLEAN], [Active status (default: true)],
)

#pagebreak()

== employee
Staff members.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [employee_id], [SERIAL], [Primary key],
  [first_name], [VARCHAR(80)], [First name (not null)],
  [last_name], [VARCHAR(80)], [Last name (not null)],
  [cnic], [CHAR(15)], [National ID (unique)],
  [email], [VARCHAR(150)], [Email (unique, not null)],
  [phone], [VARCHAR(20)], [Phone number],
  [hire_date], [DATE], [Hire date (not null)],
  [branch_id], [INT], [Foreign key to branch (not null)],
  [role_id], [INT], [Foreign key to role (not null)],
  [salary], [NUMERIC(10,2)], [Actual salary (not null, >= 0)],
  [is_active], [BOOLEAN], [Active status (default: true)],
)

== employee_shift
Work shift records.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [shift_id], [SERIAL], [Primary key],
  [employee_id], [INT], [Foreign key to employee (not null)],
  [shift_date], [DATE], [Shift date (not null)],
  [start_time], [TIME], [Start time (not null)],
  [end_time], [TIME], [End time (not null, > start_time)],
  [hours_worked], [NUMERIC(4,2)], [Computed hours (generated)],
)

== rescue_team
Rescue teams per branch.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [team_id], [SERIAL], [Primary key],
  [team_name], [VARCHAR(100)], [Team name (not null)],
  [branch_id], [INT], [Foreign key to branch (not null)],
  [leader_id], [INT], [Foreign key to employee],
  [vehicle_plate], [VARCHAR(20)], [Vehicle plate number],
  [is_active], [BOOLEAN], [Active status (default: true)],
)

#pagebreak()

== animal
Animal records.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [animal_id], [SERIAL], [Primary key],
  [name], [VARCHAR(80)], [Animal name],
  [species_id], [INT], [Foreign key to species (not null)],
  [breed], [VARCHAR(80)], [Breed],
  [gender], [CHAR(1)], [M/F/U],
  [date_of_birth], [DATE], [Birth date],
  [colour], [VARCHAR(50)], [Color description],
  [weight_kg], [NUMERIC(5,2)], [Weight (> 0)],
  [microchip_no], [VARCHAR(50)], [Microchip (unique)],
  [health_status], [VARCHAR(20)], [Health status (default: Unknown)],
  [status], [VARCHAR(20)], [Status (default: In Shelter)],
  [branch_id], [INT], [Foreign key to branch (not null)],
  [intake_date], [DATE], [Intake date (default: today)],
  [intake_method], [VARCHAR(20)], [Intake method (not null)],
)

== report
Public distress reports.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [report_id], [SERIAL], [Primary key],
  [channel], [VARCHAR(20)], [Report channel (not null)],
  [reporter_name], [VARCHAR(150)], [Reporter name],
  [reporter_contact], [VARCHAR(150)], [Reporter contact],
  [description], [TEXT], [Description (not null)],
  [location_text], [VARCHAR(255)], [Location (not null)],
  [city_id], [INT], [Foreign key to city (not null)],
  [reported_at], [TIMESTAMPTZ], [Report time (default: now)],
  [status], [VARCHAR(20)], [Status (default: Pending)],
  [assigned_team_id], [INT], [Foreign key to rescue_team],
)

#pagebreak()

== rescue_mission
Rescue operations.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [mission_id], [SERIAL], [Primary key],
  [report_id], [INT], [Foreign key to report],
  [team_id], [INT], [Foreign key to rescue_team (not null)],
  [animal_id], [INT], [Foreign key to animal],
  [dispatched_at], [TIMESTAMPTZ], [Dispatch time (default: now)],
  [completed_at], [TIMESTAMPTZ], [Completion time],
  [outcome], [VARCHAR(20)], [Outcome (default: Ongoing)],
  [notes], [TEXT], [Mission notes],
)

== animal_care_log
Animal care events.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [log_id], [SERIAL], [Primary key],
  [animal_id], [INT], [Foreign key to animal (not null)],
  [employee_id], [INT], [Foreign key to employee (not null)],
  [log_date], [DATE], [Log date (default: today)],
  [care_type], [VARCHAR(30)], [Care type (not null)],
  [notes], [TEXT], [Care notes],
  [cost], [NUMERIC(8,2)], [Cost (>= 0)],
)

== adoption
Adoption records.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [adoption_id], [SERIAL], [Primary key],
  [animal_id], [INT], [Foreign key to animal (not null)],
  [adopter_name], [VARCHAR(150)], [Adopter name (not null)],
  [adopter_cnic], [CHAR(15)], [Adopter CNIC],
  [adopter_contact], [VARCHAR(150)], [Adopter contact (not null)],
  [adopter_address], [TEXT], [Adopter address],
  [employee_id], [INT], [Foreign key to employee (not null)],
  [adoption_date], [DATE], [Adoption date (default: today)],
  [adoption_fee], [NUMERIC(8,2)], [Fee (default: 0, >= 0)],
  [status], [VARCHAR(20)], [Status (default: Pending)],
)

#pagebreak()

== animal_sale
Animal sales and donations.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [sale_id], [SERIAL], [Primary key],
  [animal_id], [INT], [Foreign key to animal (not null)],
  [sale_type], [VARCHAR(20)], [Transaction type (not null)],
  [counterparty_name], [VARCHAR(150)], [Buyer/donor name],
  [counterparty_contact], [VARCHAR(150)], [Contact info],
  [employee_id], [INT], [Foreign key to employee (not null)],
  [transaction_date], [DATE], [Transaction date (default: today)],
  [amount], [NUMERIC(10,2)], [Amount (default: 0, >= 0)],
  [notes], [TEXT], [Transaction notes],
)

== audit_log
System audit trail.

#table(
  columns: (3cm, 3cm, 1fr),
  [*Column*], [*Type*], [*Description*],
  [audit_id], [SERIAL], [Primary key],
  [table_name], [VARCHAR(50)], [Table name (not null)],
  [record_id], [INT], [Record ID (not null)],
  [action], [VARCHAR(10)], [Action type (not null)],
  [old_value], [TEXT], [Old value],
  [new_value], [TEXT], [New value],
  [changed_by], [VARCHAR(100)], [User who made change],
  [changed_at], [TIMESTAMPTZ], [Change timestamp (default: now)],
)

#pagebreak()

= User Roles

The system defines five employee roles:

#table(
  columns: (2.5cm, 2.5cm, 1fr),
  [*Role*], [*Base Salary*], [*Responsibilities*],
  [Manager], [PKR 85,000], [Manage employees, approve adoptions, view reports and financial records],
  [Veterinarian], [PKR 75,000], [Manage animal health records, prescribe treatments, log care events],
  [Rescuer], [PKR 45,000], [Manage rescue missions, respond to distress reports],
  [Caretaker], [PKR 35,000], [Log feeding and grooming events, basic animal care],
  [Admin], [PKR 40,000], [Process adoptions and sales, manage reports],
)

= Indexes

Key indexes for query performance:

- branch(city_id)
- employee(branch_id, role_id, is_active)
- employee_shift(employee_id, shift_date)
- animal(branch_id, species_id, status, health_status)
- report(status, city_id, assigned_team_id)
- rescue_mission(team_id, animal_id)
- animal_care_log(animal_id, log_date)
- adoption(animal_id, status)

= Triggers

*trg_adoption_status:* Updates animal.status to 'Adopted' when adoption.status becomes 'Completed'.

*trg_audit_animal_status:* Logs changes to animal health_status or status in audit_log.

*trg_check_adoption_eligibility:* Prevents adoption of animals not in 'In Shelter' status.

= Views

*vw_available_animals:* Shows animals available for adoption with species, branch, and city info.

*vw_branch_summary:* Branch operational dashboard with animal count, capacity, and staff count.

*vw_employee_hours_summary:* Monthly hours worked per employee for payroll.
