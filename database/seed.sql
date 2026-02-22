-- Stray Animals Shelter - Sample Data

INSERT INTO city (city_name, province, country) VALUES
('Lahore',     'Punjab',    'Pakistan'),
('Karachi',    'Sindh',     'Pakistan'),
('Islamabad',  'ICT',       'Pakistan'),
('Faisalabad', 'Punjab',    'Pakistan'),
('Peshawar',   'KPK',       'Pakistan');

INSERT INTO species (species_name, avg_lifespan_years) VALUES
('Dog',    13),
('Cat',    15),
('Rabbit',  8),
('Parrot',  30),
('Tortoise',80);


INSERT INTO role (role_name, base_salary, permissions) VALUES
('Manager',   85000, '{"manage_employees":true,"view_reports":true,"approve_adoptions":true}'),
('Veterinarian', 75000, '{"view_animals":true,"update_health":true,"prescribe":true}'),
('Rescuer',   45000, '{"manage_missions":true,"view_reports":true}'),
('Caretaker', 35000, '{"update_care_log":true,"view_animals":true}'),
('Admin',     40000, '{"manage_records":true,"process_adoptions":true,"handle_reports":true}');


INSERT INTO branch (branch_name, city_id, address, phone, email, capacity, opened_date) VALUES
('Lahore Central Shelter',   1, '12 Mall Road, Lahore',             '042-1234567', 'lahore@sas.org.pk',    80, '2018-03-15'),
('Lahore North Branch',      1, '5 Johar Town, Lahore',             '042-7654321', 'lahore.n@sas.org.pk',  50, '2020-06-01'),
('Karachi South Shelter',    2, '88 Clifton, Karachi',              '021-9876543', 'karachi@sas.org.pk',   70, '2017-09-10'),
('Islamabad Branch',         3, '34 F-7 Markaz, Islamabad',         '051-3344556', 'isb@sas.org.pk',       40, '2019-01-20'),
('Faisalabad Branch',        4, '7 Susan Road, Faisalabad',         '041-2233445', 'fsd@sas.org.pk',       45, '2021-04-05'),
('Peshawar Branch',          5, '2 University Road, Peshawar',      '091-5566778', 'pew@sas.org.pk',       30, '2022-07-18');


INSERT INTO employee (first_name, last_name, cnic, email, phone, hire_date, branch_id, role_id, salary) VALUES
('Ali',      'Hassan',   '35201-1234567-1', 'ali.hassan@sas.org.pk',    '0300-1111111', '2018-04-01', 1, 1, 88000),
('Sara',     'Ahmed',    '35201-2345678-2', 'sara.ahmed@sas.org.pk',    '0300-2222222', '2018-05-15', 1, 2, 76000),
('Usman',    'Khan',     '35201-3456789-3', 'usman.khan@sas.org.pk',    '0300-3333333', '2019-01-10', 1, 3, 46000),
('Fatima',   'Malik',    '35201-4567890-4', 'fatima.malik@sas.org.pk',  '0300-4444444', '2019-03-20', 1, 4, 36000),
('Bilal',    'Qureshi',  '35201-5678901-5', 'bilal.q@sas.org.pk',       '0300-5555555', '2019-06-01', 1, 5, 41000),
('Hira',     'Siddiqui', '35201-6789012-6', 'hira.s@sas.org.pk',        '0300-6666666', '2020-02-14', 1, 4, 36000),
('Asad',     'Riaz',     '35202-7890123-7', 'asad.riaz@sas.org.pk',     '0301-1111111', '2020-07-01', 2, 1, 86000),
('Nadia',    'Baig',     '35202-8901234-8', 'nadia.baig@sas.org.pk',    '0301-2222222', '2020-08-10', 2, 2, 77000),
('Kamran',   'Sheikh',   '35202-9012345-9', 'kamran.s@sas.org.pk',      '0301-3333333', '2021-01-05', 2, 3, 46500),
('Zara',     'Butt',     '35202-0123456-0', 'zara.butt@sas.org.pk',     '0301-4444444', '2021-03-15', 2, 4, 35500),
('Imran',    'Mirza',    '42101-1234567-1', 'imran.mirza@sas.org.pk',   '0302-1111111', '2017-10-01', 3, 1, 89000),
('Ayesha',   'Jaffri',   '42101-2345678-2', 'ayesha.j@sas.org.pk',      '0302-2222222', '2018-01-20', 3, 2, 78000),
('Tariq',    'Memon',    '42101-3456789-3', 'tariq.m@sas.org.pk',       '0302-3333333', '2018-03-10', 3, 3, 47000),
('Sana',     'Patel',    '42101-4567890-4', 'sana.p@sas.org.pk',        '0302-4444444', '2018-06-01', 3, 4, 36000),
('Hassan',   'Rashid',   '42101-5678901-5', 'hassan.r@sas.org.pk',      '0302-5555555', '2019-09-01', 3, 5, 41500),
('Mariam',   'Hussain',  '42101-6789012-6', 'mariam.h@sas.org.pk',      '0302-6666666', '2020-01-15', 3, 3, 46000),
('Omer',     'Farooq',   '61101-1234567-1', 'omer.f@sas.org.pk',        '0303-1111111', '2019-02-01', 4, 1, 87000),
('Lubna',    'Zahid',    '61101-2345678-2', 'lubna.z@sas.org.pk',       '0303-2222222', '2019-04-10', 4, 2, 76500),
('Faisal',   'Nawaz',    '61101-3456789-3', 'faisal.n@sas.org.pk',      '0303-3333333', '2019-07-01', 4, 3, 45500),
('Sobia',    'Ali',      '61101-4567890-4', 'sobia.a@sas.org.pk',       '0303-4444444', '2020-01-20', 4, 4, 35000),
('Waqas',    'Chaudhry', '33101-1234567-1', 'waqas.c@sas.org.pk',       '0304-1111111', '2021-05-01', 5, 1, 85000),
('Noor',     'Arshad',   '33101-2345678-2', 'noor.a@sas.org.pk',        '0304-2222222', '2021-06-15', 5, 2, 74000),
('Amir',     'Ghafoor',  '33101-3456789-3', 'amir.g@sas.org.pk',        '0304-3333333', '2021-09-01', 5, 3, 45000),
('Rabia',    'Akhtar',   '33101-4567890-4', 'rabia.a@sas.org.pk',       '0304-4444444', '2022-01-10', 5, 4, 35000),
('Danish',   'Yousuf',   '17101-1234567-1', 'danish.y@sas.org.pk',      '0305-1111111', '2022-08-01', 6, 1, 85000),
('Bushra',   'Kakar',    '17101-2345678-2', 'bushra.k@sas.org.pk',      '0305-2222222', '2022-09-10', 6, 2, 74000),
('Adeel',    'Khan',     '17101-3456789-3', 'adeel.k@sas.org.pk',       '0305-3333333', '2022-11-01', 6, 3, 45000),
('Shabana',  'Afridi',   '17101-4567890-4', 'shabana.a@sas.org.pk',     '0305-4444444', '2023-01-15', 6, 4, 35000),
('Rehan',    'Gul',      '17101-5678901-5', 'rehan.g@sas.org.pk',       '0305-5555555', '2023-03-01', 6, 5, 40000),
('Zahida',   'Shinwari',  '17101-6789012-6','zahida.sh@sas.org.pk',     '0305-6666666', '2023-06-01', 6, 4, 35000);


INSERT INTO rescue_team (team_name, branch_id, leader_id, vehicle_plate) VALUES
('Lahore Alpha Team',    1, 3,  'LHR-1001'),
('Lahore Beta Team',     2, 9,  'LHR-2002'),
('Karachi Rescue Unit',  3, 13, 'KHI-3003'),
('ISB Rapid Response',   4, 19, 'ISB-4004'),
('Faisalabad Unit',      5, 23, 'FSD-5005'),
('Peshawar Patrol',      6, 27, 'PSW-6006');


INSERT INTO animal (name, species_id, breed, gender, date_of_birth, colour, weight_kg, health_status, status, branch_id, intake_date, intake_method) VALUES
('Bruno',    1, 'German Shepherd', 'M', '2021-03-10', 'Brown/Black', 28.5, 'Healthy',    'In Shelter', 1, '2023-01-15', 'Rescue'),
('Laila',    2, 'Persian',         'F', '2020-07-22', 'White',        3.8, 'Healthy',    'In Shelter', 1, '2023-02-10', 'Rescue'),
('Max',      1, 'Labrador',        'M', '2022-01-05', 'Golden',      25.0, 'Recovering', 'In Shelter', 1, '2023-03-01', 'Donation'),
('Mittens',  2, 'Domestic Short',  'F', '2021-11-15', 'Tabby',        4.2, 'Healthy',    'In Shelter', 1, '2023-03-20', 'Rescue'),
('Rex',      1, 'Rottweiler',      'M', '2020-05-30', 'Black/Tan',   38.0, 'Healthy',    'In Shelter', 1, '2022-09-05', 'Rescue'),
('Snowball', 2, 'Angora',          'F', '2022-03-18', 'White',        2.9, 'Healthy',    'In Shelter', 2, '2023-04-01', 'Rescue'),
('Buddy',    1, 'Golden Retriever','M', '2021-08-12', 'Golden',      30.0, 'Healthy',    'In Shelter', 2, '2023-04-15', 'Donation'),
('Cleo',     2, 'Siamese',         'F', '2020-12-01', 'Cream/Brown',  3.5, 'Sick',       'In Shelter', 2, '2023-05-01', 'Rescue'),
('Shadow',   1, 'Mixed Breed',     'M', '2019-06-20', 'Black',       22.0, 'Recovering', 'In Shelter', 2, '2023-05-20', 'Donation'),
('Fluffy',   2, 'Maine Coon',      'F', '2022-09-09', 'Grey',         5.5, 'Healthy',    'In Shelter', 3, '2023-06-01', 'Rescue'),
('Rocky',    1, 'Bulldog',         'M', '2021-04-25', 'White/Brown', 24.0, 'Healthy',    'In Shelter', 3, '2023-06-10', 'Donation'),
('Coco',     1, 'Poodle',          'F', '2022-02-14', 'Brown',       10.0, 'Healthy',    'In Shelter', 3, '2023-07-01', 'Rescue'),
('Tiger',    2, 'Bengal',          'M', '2021-10-10', 'Orange/Black', 4.8, 'Healthy',    'In Shelter', 3, '2023-01-10', 'Rescue'),
('Daisy',    1, 'Dalmatian',       'F', '2022-06-30', 'White/Black', 22.5, 'Healthy',    'In Shelter', 3, '2023-07-20', 'Rescue'),
('Oreo',     2, 'Domestic Short',  'M', '2023-01-01', 'Black/White',  2.5, 'Recovering', 'In Shelter', 3, '2023-08-01', 'Rescue'),
('Zeus',     1, 'Husky',           'M', '2020-11-11', 'Grey/White',  27.0, 'Healthy',    'In Shelter', 4, '2023-04-05', 'Donation'),
('Luna',     2, 'Russian Blue',    'F', '2021-05-16', 'Grey',         3.9, 'Healthy',    'In Shelter', 4, '2023-05-01', 'Rescue'),
('Brownie',  1, 'Cocker Spaniel',  'F', '2022-04-08', 'Brown',       12.0, 'Sick',       'In Shelter', 4, '2023-06-20', 'Rescue'),
('Snoopy',   1, 'Beagle',          'M', '2021-07-19', 'Tri-colour',  10.5, 'Healthy',    'In Shelter', 4, '2023-07-10', 'Rescue'),
('Nemo',     3, 'Dutch',           'M', '2022-12-25', 'White/Black',  1.8, 'Healthy',    'In Shelter', 4, '2023-08-15', 'Donation'),
('Simba',    1, 'Mixed Breed',     'M', '2020-08-08', 'Brown',       18.0, 'Healthy',    'In Shelter', 5, '2023-05-05', 'Rescue'),
('Nala',     2, 'Domestic Long',   'F', '2021-03-22', 'Orange',       4.0, 'Recovering', 'In Shelter', 5, '2023-05-25', 'Rescue'),
('Loki',     1, 'Siberian Husky',  'M', '2022-01-30', 'Black/White', 24.0, 'Healthy',    'In Shelter', 5, '2023-06-15', 'Donation'),
('Molly',    2, 'Domestic Short',  'F', '2022-07-07', 'Calico',       3.2, 'Healthy',    'In Shelter', 5, '2023-07-01', 'Rescue'),
('Charlie',  1, 'Border Collie',   'M', '2021-09-15', 'Black/White', 20.0, 'Healthy',    'In Shelter', 5, '2023-07-20', 'Rescue'),
('Mia',      2, 'Scottish Fold',   'F', '2022-05-05', 'Grey',         3.7, 'Healthy',    'In Shelter', 6, '2023-06-01', 'Rescue'),
('Ginger',   2, 'Domestic Short',  'F', '2021-12-12', 'Orange',       4.1, 'Healthy',    'In Shelter', 6, '2023-06-20', 'Donation'),
('Bolt',     1, 'Greyhound',       'M', '2020-09-09', 'White',       27.5, 'Healthy',    'In Shelter', 6, '2023-07-05', 'Rescue'),
('Pearl',    3, 'Angora',          'F', '2023-02-10', 'White',        1.5, 'Healthy',    'In Shelter', 6, '2023-08-01', 'Donation'),
('Leo',      1, 'Doberman',        'M', '2021-06-01', 'Black/Tan',   32.0, 'Injured',    'In Shelter', 1, '2023-09-01', 'Rescue'),
('Bella',    1, 'Shih Tzu',        'F', '2022-08-20', 'White/Gold',   6.5, 'Healthy',    'In Shelter', 1, '2023-09-15', 'Donation'),
('Oscar',    4, 'African Grey',    'M', '2015-04-01', 'Grey/Red',     0.5, 'Healthy',    'In Shelter', 2, '2023-03-10', 'Donation'),
('Tweety',   4, 'Budgerigar',      'F', '2021-01-15', 'Green/Yellow', 0.04,'Healthy',    'In Shelter', 3, '2023-04-20', 'Donation'),
('Tommy',    1, 'German Shepherd', 'M', '2019-10-10', 'Sable',       34.0, 'Healthy',    'In Shelter', 3, '2022-11-01', 'Rescue'),
('Whiskers', 2, 'Persian',         'F', '2020-06-15', 'Silver',       4.3, 'Healthy',    'In Shelter', 2, '2022-08-10', 'Rescue'),
('Duke',     1, 'Great Dane',      'M', '2021-02-28', 'Fawn',        60.0, 'Recovering', 'In Shelter', 2, '2023-10-01', 'Rescue'),
('Kitty',    2, 'Domestic Short',  'F', '2023-03-03', 'Black',        2.8, 'Healthy',    'In Shelter', 4, '2023-10-10', 'Rescue'),
('Roxy',     1, 'Pomeranian',      'F', '2022-11-11', 'Cream',        3.0, 'Healthy',    'In Shelter', 5, '2023-10-15', 'Donation'),
('Chip',     3, 'Flemish Giant',   'M', '2022-10-20', 'Grey',         4.5, 'Healthy',    'In Shelter', 6, '2023-10-20', 'Donation'),
(NULL,       1, 'Mixed Breed',     'U', NULL,          'Black/White', 15.0, 'Injured',    'In Shelter', 1, '2023-11-01', 'Rescue');


INSERT INTO employee_shift (employee_id, shift_date, start_time, end_time) VALUES
(1, '2024-01-08', '09:00', '17:00'),
(2, '2024-01-08', '09:00', '17:00'),
(3, '2024-01-08', '08:00', '16:00'),
(4, '2024-01-08', '10:00', '18:00'),
(5, '2024-01-09', '09:00', '17:00'),
(6, '2024-01-09', '10:00', '18:00'),
(1, '2024-01-09', '09:00', '17:00'),
(2, '2024-01-09', '09:00', '17:00'),
(7, '2024-01-08', '09:00', '17:00'),
(8, '2024-01-08', '09:00', '17:00'),
(9, '2024-01-08', '07:00', '15:00'),
(10,'2024-01-08', '11:00', '19:00'),
(11,'2024-01-08', '09:00', '17:00'),
(12,'2024-01-08', '09:00', '17:00'),
(13,'2024-01-08', '08:00', '16:00'),
(14,'2024-01-08', '10:00', '18:00'),
(15,'2024-01-09', '09:00', '17:00'),
(16,'2024-01-09', '08:00', '16:00'),
(17,'2024-01-08', '09:00', '17:00'),
(18,'2024-01-08', '09:00', '17:00'),
(19,'2024-01-08', '07:00', '15:00'),
(20,'2024-01-08', '10:00', '18:00'),
(21,'2024-01-08', '09:00', '17:00'),
(22,'2024-01-08', '09:00', '17:00'),
(23,'2024-01-08', '08:00', '16:00'),
(24,'2024-01-09', '10:00', '18:00'),
(25,'2024-01-08', '09:00', '17:00'),
(26,'2024-01-08', '09:00', '17:00'),
(27,'2024-01-08', '08:00', '16:00'),
(28,'2024-01-09', '10:00', '18:00');


INSERT INTO report (channel, reporter_name, reporter_contact, description, location_text, city_id, reported_at, status, assigned_team_id) VALUES
('Phone',        'Khalid Mehmood',   '0321-9988776', 'Injured dog near canal bank',              'Canal Road near Model Town',     1, '2023-10-01 10:00+05', 'Resolved',  1),
('Email',        'Rabia Naz',        NULL,           'Cat stuck on rooftop for 2 days',           'DHA Phase 5 Block C',            1, '2023-10-02 14:30+05', 'Resolved',  1),
('Email',        'Hamid Raza',       'hamid@gm.com', 'Stray pups near school',                   'Model Town School Gate',         1, '2023-10-05 09:00+05', 'Resolved',  1),
('Walk-in',      NULL,               NULL,           'Found injured cat on street',               'Johar Town Lahore',              1, '2023-10-10 11:00+05', 'Resolved',  2),
('Phone',        'Sadia Bibi',       '0333-4455667', 'Pack of dogs attacking pedestrians',       'Gulberg Main Boulevard',         1, '2023-10-15 16:00+05', 'Resolved',  2),
('Phone',        'Naveed Iqbal',     '0312-3344556', 'Sick cat abandoned in park',               'Clifton Block 4 Park',           2, '2023-10-03 08:30+05', 'Resolved',  3),
('Email',        'Zeba Murtaza',     'zeba@gm.com',  'Injured dog on main road',                 'Shahrah-e-Faisal near Dolmen',   2, '2023-10-07 12:00+05', 'Resolved',  3),
('Email',        NULL,               NULL,           'Monkey spotted in residential area',       'Gulshan-e-Iqbal Block 13',       2, '2023-10-12 15:00+05', 'Closed',    3),
('Phone',        'Aamir Sultan',     '0345-6677889', 'Dog with broken leg near market',          'F-10 Markaz Islamabad',          3, '2023-10-04 10:00+05', 'Resolved',  4),
('Walk-in',      'Fauzia Begum',     '0332-1122334', 'Abandoned rabbit in cardboard box',        'I-8 Islamabad',                  3, '2023-10-09 13:00+05', 'Resolved',  4),
('Email',        'Tariq Saeed',      'ts@gm.com',    'Stray dogs near hospital entrance',        'PIMS Hospital Road',             3, '2023-10-14 09:00+05', 'Assigned',  4),
('Phone',        'Urooj Fatima',     '0300-9988776', 'Cat with kittens abandoned in bag',        'Susan Road Faisalabad',          4, '2023-10-06 11:00+05', 'Resolved',  5),
('Phone',        'Akram Chaudhry',   '0312-4455667', 'Dog hit by car',                           'Canal Road Faisalabad',          4, '2023-10-11 17:00+05', 'Resolved',  5),
('Email',        NULL,               NULL,           'Stray dogs in market causing issues',     'D-Ground Faisalabad',            4, '2023-10-16 10:00+05', 'Pending',   NULL),
('Phone',        'Salma Bibi',       '0345-5566778', 'Injured parrot fell from tree',            'University Town Peshawar',       5, '2023-10-08 09:30+05', 'Resolved',  6),
('Email',        'Imtiaz Shah',      'is@gm.com',    'Puppies abandoned near mosque',            'Hayatabad Phase 3 Peshawar',     5, '2023-10-13 14:00+05', 'Resolved',  6),
('Walk-in',      NULL,               NULL,           'Cat with eye infection',                   'Ring Road Peshawar',             5, '2023-10-18 11:00+05', 'Assigned',  6),
('Phone',        'Gulshan Parveen',  '0321-7788990', 'Dog pack near school morning',             'Gulshan-e-Ravi Lahore',          1, '2023-11-01 07:30+05', 'Pending',   NULL),
('Email',        'Bilal Rana',       'br@gm.com',    'Tortoise found on road',                   'Bahria Town Lahore',             1, '2023-11-02 12:00+05', 'Pending',   NULL),
('Phone',        NULL,               NULL,           'Cat meowing in wall cavity',               'Model Town Lahore',              1, '2023-11-03 08:00+05', 'Pending',   NULL);


INSERT INTO rescue_mission (report_id, team_id, animal_id, dispatched_at, completed_at, outcome, notes) VALUES
(1,  1, 1,  '2023-10-01 11:00+05', '2023-10-01 14:00+05', 'Rescued',  'Dog found with laceration, brought to shelter'),
(2,  1, 2,  '2023-10-02 15:00+05', '2023-10-02 17:00+05', 'Rescued',  'Cat retrieved safely from rooftop'),
(3,  1, 4,  '2023-10-05 10:00+05', '2023-10-05 12:30+05', 'Rescued',  '3 pups found, one transferred to branch 2'),
(4,  2, 8,  '2023-10-10 12:00+05', '2023-10-10 13:30+05', 'Rescued',  'Cat had upper respiratory infection'),
(5,  2, NULL,'2023-10-15 16:30+05','2023-10-15 18:00+05', 'Not Found','Dogs had dispersed by arrival'),
(6,  3, 10, '2023-10-03 09:00+05', '2023-10-03 11:00+05', 'Rescued',  'Cat had injuries from cat fight'),
(7,  3, 12, '2023-10-07 12:30+05', '2023-10-07 15:00+05', 'Rescued',  'Dog had been hit by motorbike'),
(8,  3, NULL,'2023-10-12 15:30+05','2023-10-12 16:30+05', 'Not Found','Wildlife dept notified for monkey'),
(9,  4, 16, '2023-10-04 10:30+05', '2023-10-04 13:00+05', 'Rescued',  'Husky had broken paw, surgery required'),
(10, 4, 20, '2023-10-09 13:30+05', '2023-10-09 14:30+05', 'Rescued',  'Rabbit in good health'),
(11, 4, 18, '2023-10-14 09:30+05', '2023-10-14 11:30+05', 'Rescued',  'Two dogs brought in'),
(12, 5, 22, '2023-10-06 11:30+05', '2023-10-06 13:30+05', 'Rescued',  'Mother cat and 4 kittens'),
(13, 5, 28, '2023-10-11 17:30+05', '2023-10-11 19:00+05', 'Rescued',  'Greyhound with leg fracture'),
(15, 6, 32, '2023-10-08 10:00+05', '2023-10-08 11:00+05', 'Rescued',  'African grey parrot found under tree'),
(16, 6, 26, '2023-10-13 14:30+05', '2023-10-13 16:30+05', 'Rescued',  'Two puppies rescued');


INSERT INTO animal_care_log (animal_id, employee_id, log_date, care_type, notes, cost) VALUES
(1,  2,  '2023-10-02', 'Check-up',    'General health check, all vitals normal',             500),
(1,  2,  '2023-10-09', 'Vaccination', 'Rabies + Distemper combo',                            800),
(2,  2,  '2023-10-03', 'Check-up',    'Slight dehydration, placed on fluids',                300),
(3,  2,  '2023-10-02', 'Treatment',   'Wound dressing for leg injury',                       600),
(3,  2,  '2023-10-10', 'Check-up',    'Wound healing well',                                  200),
(4,  4,  '2023-10-21', 'Feeding',     'Special kitten formula twice daily',                   50),
(5,  2,  '2022-09-10', 'Check-up',    'Full health screening before adoption',               400),
(6,  8,  '2023-04-05', 'Vaccination', 'Core feline vaccines administered',                   700),
(7,  8,  '2023-04-20', 'Check-up',    'Healthy adult dog, good weight',                      200),
(8,  8,  '2023-05-05', 'Treatment',   'Started antibiotics for URI',                         900),
(8,  8,  '2023-05-15', 'Check-up',    'Improving but still on medication',                   200),
(9,  8,  '2023-05-25', 'Treatment',   'Wound care for road injury',                          700),
(10, 12, '2023-06-05', 'Check-up',    'Healthy cat, ready for adoption screening',           200),
(11, 12, '2023-06-15', 'Vaccination', 'Annual vaccines due',                                 700),
(12, 12, '2023-07-05', 'Check-up',    'Normal health for age',                               200),
(16, 18, '2023-04-10', 'Treatment',   'Fracture repair on left front paw',                  8000),
(16, 18, '2023-05-01', 'Check-up',    'Post-surgery follow-up, healing well',               300),
(17, 18, '2023-05-05', 'Vaccination', 'Core feline vaccines',                               700),
(18, 18, '2023-06-25', 'Treatment',   'Started treatment for parvovirus',                  1500),
(18, 18, '2023-07-10', 'Check-up',    'Recovery ongoing',                                   300),
(19, 18, '2023-07-15', 'Check-up',    'Healthy beagle',                                     200),
(30, 2,  '2023-09-05', 'Treatment',   'Emergency treatment - severe infection',            3000),
(30, 2,  '2023-09-15', 'Check-up',    'Still critical, monitoring closely',                 300),
(31, 2,  '2023-09-20', 'Check-up',    'Healthy small dog',                                  200),
(20, 18, '2023-08-20', 'Check-up',    'Rabbit in good health',                              200),
(21, 22, '2023-05-10', 'Check-up',    'Malnourished on arrival, special diet started',     400),
(25, 22, '2023-07-25', 'Vaccination', 'Distemper and parvovirus combo',                    700),
(26, 26, '2023-06-05', 'Check-up',    'Healthy cat',                                        200),
(39, 26, '2023-10-25', 'Check-up',    'Rabbit healthy, good temperament',                   200),
(40, 2,  '2023-11-02', 'Treatment',   'Treating leg injury from road incident',            1200);


INSERT INTO adoption (animal_id, adopter_name, adopter_cnic, adopter_contact, adopter_address, employee_id, adoption_date, adoption_fee, status) VALUES
(5,  'Ahmad Farhan',     '35201-9988776-1', '0322-1234567', '14 Garden Town, Lahore',        5,  '2022-10-01', 1500, 'Pending'),
(13, 'Shehnaz Bibi',     '42101-8877665-2', '0333-7654321', '23 PECHS Block 6, Karachi',     15, '2023-02-15', 1500, 'Completed'),
(35, 'Imran Rasheed',    '35202-7766554-3', '0311-9988776', '7 DHA Phase 4, Lahore',         5,  '2022-09-20', 1500, 'Completed'),
(1,  'Tariq Javed',      '35202-6655443-4', '0300-5544332', '3 Model Town Ext, Lahore',      5,  '2023-11-10', 2000, 'Pending'),
(7,  'Fareeha Malik',    '35202-5544332-5', '0321-4433221', '88 Johar Town Block D, Lahore', 10, '2023-11-12', 2000, 'Pending'),
(16, 'Kabir Sultan',     '61101-4433221-6', '0333-3322110', '45 F-8/3, Islamabad',           20, '2023-10-20', 2000, 'Approved'),
(19, 'Zainab Niaz',      '61101-3322110-7', '0312-2211009', '12 G-9 Islamabad',              20, '2023-11-01', 1500, 'Pending'),
(6,  'Hamza Tariq',      '35202-2211009-8', '0345-1100998', '56 Bahria Town Lahore',         10, '2023-11-05', 1500, 'Pending'),
(21, 'Amna Shabbir',     '33101-1100998-9', '0300-0099887', '9 Gulshan Colony, Faisalabad',  25, '2023-11-08', 1500, 'Pending'),
(26, 'Rifat Anjum',      '17101-0099887-0', '0321-9988665', '4 Hayatabad Ph2, Peshawar',     30, '2023-11-10', 1500, 'Pending');


INSERT INTO animal_sale (animal_id, sale_type, counterparty_name, counterparty_contact, employee_id, transaction_date, amount, notes) VALUES
(3,  'Donation Received',  'Junaid Akhtar',   '0322-6655443', 5,  '2023-03-01', 0,     'Owner relocating abroad'),
(7,  'Donation Received', 'Rehana Bibi',     '0311-5544332', 10, '2023-04-15', 0,     'Owner unable to care for dog'),
(9,  'Donation Received',  'Shahid Latif',    '0300-4433221', 10, '2023-05-20', 0,     'Financial constraints'),
(20, 'Donation Received', 'Farida Begum',    '0321-3322110', 20, '2023-08-15', 0,     'Moving to apartment, no pets allowed'),
(29, 'Donation Received', 'Saeed Ahmad',     '0312-2211009', 30, '2023-08-01', 0,     'Donor purchased too many rabbits'),
(31, 'Donation Received',  'Nasreen Akthar',  '0345-1100998', 5,  '2023-09-15', 0,     'Allergic family member'),
(34, 'Sale',              'Zafar Hussain',   '0300-7788991', 15, '2022-12-01', 5000,  'Trained German Shepherd sold to security firm'),
(37, 'Donation Received',  'Rubina Salim',    '0321-6677880', 25, '2023-10-15', 0,     'Pomeranian - owner health issues'),
(38, 'Donation Received', 'Farooq Anwar',    '0333-5566779', 30, '2023-10-20', 0,     'Rabbit breed pair donated'),
(39, 'Donation Received', 'Haseena Khatoon', '0311-4455668', 30, '2023-10-20', 0,     'Second rabbit from same donor');


INSERT INTO medical_record (animal_id, employee_id, visit_date, diagnosis, treatment_plan, medication_prescribed, cost, next_visit_date) VALUES
(1,  8,  '2023-02-10', 'Routine Checkup',              'Continue regular diet and exercise',                'None',                           200,  NULL),
(2,  8,  '2023-02-15', 'Skin Infection',               'Apply topical cream twice daily',                   'Betadine, Anti-fungal cream',    500,  '2023-03-01'),
(5,  8,  '2023-03-01', 'Vaccination',                  'Annual rabies and distemper vaccine',               'Rabies vaccine',                 300,  '2024-03-01'),
(10, 18, '2023-06-10', 'Respiratory Infection',        'Antibiotics for 10 days, rest',                     'Amoxicillin',                    800,  '2023-06-20'),
(12, 18, '2023-07-01', 'Dental Cleaning',              'Regular dental checkups recommended',               'None',                           1500, '2024-01-01'),
(16, 18, '2023-04-10', 'Fractured Left Front Leg',     'Surgery and 6 weeks recovery',                      'Pain medication, Antibiotics',   8000, '2023-05-22'),
(20, 23, '2023-08-20', 'Vaccination',                  'Annual vaccines',                                   'FVRCP vaccine',                  250,  '2024-08-20'),
(25, 28, '2023-08-05', 'Eye Infection',                'Eye drops three times daily',                       'Antibiotic eye drops',           350,  '2023-08-15'),
(30, 18, '2023-09-01', 'Spay Surgery',                 'Post-op monitoring for 2 weeks',                    'Pain medication',                3500, '2023-09-15'),
(35, 8,  '2023-09-20', 'Routine Checkup',              'Healthy, no issues',                                'None',                           200,  NULL);


INSERT INTO volunteer (first_name, last_name, cnic, email, phone, registration_date, branch_id, skills, hours_contributed, is_active) VALUES
('Sara',      'Ahmed',     '35202-9988776-5', 'sara.ahmed@email.com',      '0300-9988776', '2023-01-15', 1, 'Animal handling, Dog walking',      120, TRUE),
('Bilal',     'Raza',      '35202-8877665-4', 'bilal.raza@email.com',      '0321-8877665', '2023-02-20', 1, 'Photography, Social media',          80, TRUE),
('Ayesha',    'Khan',      '61101-7766554-3', 'ayesha.khan@email.com',     '0333-7766554', '2023-03-10', 2, 'Veterinary student, First aid',     150, TRUE),
('Usman',     'Malik',     '54000-6655443-2', 'usman.malik@email.com',     '0312-6655443', '2023-04-05', 3, 'Grooming, Animal training',         100, TRUE),
('Hina',      'Siddiqui',  '33101-5544332-1', 'hina.siddiqui@email.com',   '0345-5544332', '2023-05-12', 4, 'Fundraising, Event planning',        90, TRUE),
('Kamran',    'Ali',       '17101-4433221-0', 'kamran.ali@email.com',      '0300-4433221', '2023-06-18', 5, 'Transport, Heavy lifting',           75, TRUE),
('Fatima',    'Noor',      '42000-3322110-9', 'fatima.noor@email.com',     '0321-3322110', '2023-07-22', 6, 'Cat care specialist',                60, TRUE),
('Ahmed',     'Hassan',    '35202-2211009-8', 'ahmed.hassan@email.com',    '0333-2211009', '2023-08-15', 1, 'IT support, Database management',    40, TRUE),
('Zara',      'Hussain',   '61101-1100998-7', 'zara.hussain@email.com',    '0312-1100998', '2023-09-10', 2, 'Teaching, Community outreach',       55, TRUE),
('Shahid',    'Jameel',    '54000-0099887-6', 'shahid.jameel@email.com',   '0345-0099887', '2023-10-05', 3, 'Construction, Facility maintenance', 30, TRUE);


INSERT INTO donation (donor_name, donor_contact, donor_email, branch_id, donation_date, donation_type, amount, items_donated, notes) VALUES
('Ali Enterprises',         '0300-1234567', 'ali.ent@business.com',      1, '2023-01-20', 'Cash',  50000,  NULL,                                      'Corporate sponsorship'),
('Fatima Textiles',         '0321-2345678', 'fatima@textiles.com',       2, '2023-02-15', 'Items', 0,      '50 blankets, 30 feeding bowls',           'Winter donation drive'),
('Anonymous',               NULL,           NULL,                        1, '2023-03-10', 'Cash',  10000,  NULL,                                      'Anonymous donor'),
('Pet Care Pakistan',       '0333-3456789', 'info@petcare.pk',           3, '2023-04-05', 'Both',  25000,  '100kg dog food, 50kg cat food',           'Quarterly donation'),
('Zainab Ahmed',            '0312-4567890', 'zainab@email.com',          4, '2023-05-18', 'Cash',  5000,   NULL,                                      'In memory of her late pet'),
('Karachi Vet Supplies',    '0345-5678901', 'karachi.vet@supplies.pk',   2, '2023-06-22', 'Items', 0,      'Medical supplies, Vaccines',              'Bulk medical donation'),
('Lahore Medical College',  '0300-6789012', 'lmc@college.edu.pk',        1, '2023-07-30', 'Items', 0,      'First aid kits, Medical equipment',       'Student community service'),
('Imran Brothers',          '0321-7890123', 'imran@business.com',        5, '2023-08-15', 'Cash',  15000,  NULL,                                      'Monthly donor'),
('Green Valley Farms',      '0333-8901234', 'greenvalley@farms.pk',      6, '2023-09-10', 'Items', 0,      '200kg vegetables, 100kg grains',          'Farm produce donation'),
('Dr. Saima Clinic',        '0312-9012345', 'saima@clinic.pk',           1, '2023-10-25', 'Both',  8000,   'Medications, Surgical supplies',          'Professional support');


INSERT INTO training_session (session_name, branch_id, session_date, start_time, end_time, trainer_id, topic, max_participants, description) VALUES
('Animal Handling Basics',           1, '2023-02-15', '09:00', '12:00', 5,  'Safe handling techniques for dogs and cats',       20, 'Introduction to proper animal handling and safety protocols'),
('Emergency First Aid',              2, '2023-03-20', '10:00', '14:00', 15, 'First aid for injured animals',                    15, 'Emergency response and basic first aid techniques'),
('Adoption Process Training',        1, '2023-04-10', '14:00', '17:00', 10, 'Streamlining the adoption workflow',               25, 'Training on documentation and adoption procedures'),
('Rescue Mission Safety',            3, '2023-05-05', '08:00', '12:00', 18, 'Safety protocols during rescue operations',        12, 'Field safety and risk management during rescues'),
('Database System Usage',            4, '2023-06-15', '13:00', '16:00', 22, 'Using the shelter management system',              30, 'Training on database operations and reporting'),
('Volunteer Coordination',           5, '2023-07-20', '10:00', '13:00', 27, 'Managing and coordinating volunteer activities',   20, 'Leadership training for volunteer management'),
('Animal Behavior Workshop',         6, '2023-08-10', '09:00', '15:00', 5,  'Understanding animal behavior and psychology',     18, 'Advanced workshop on animal behavior patterns'),
('Veterinary Care Basics',           2, '2023-09-12', '11:00', '14:00', 18, 'Basic veterinary care and medication',             15, 'Introduction to veterinary procedures'),
('Fundraising Strategies',           1, '2023-10-05', '14:00', '17:00', 10, 'Effective fundraising and donor management',       25, 'Workshop on fundraising techniques and donor relations'),
('Community Outreach Program',       3, '2023-11-08', '10:00', '13:00', 20, 'Building community partnerships',                  20, 'Strategies for community engagement and awareness');
