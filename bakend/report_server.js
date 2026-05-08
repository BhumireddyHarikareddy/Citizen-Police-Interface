// Express server for handling crime report submissions
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // change as needed
  password: '', // change as needed
  database: 'police'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
});

// Handle form submission
app.post('/api/report', (req, res) => {
  const data = req.body;

  // Map form fields to DB columns
  const report = {
     reporterName: req.body.reporterName,
    reporterAge: req.body.reporterAge,
    reporterGender: req.body.reporterGender,
    reporterPhone: req.body.reporterPhone,
    reporterEmail: req.body.reporterEmail,
    reporterAddress: req.body.reporterAddress,
    crimeType: req.body.crimeType,

    // Missing Person
    missing_name: data.missing_name,
    missing_age: data.missing_age,
    missing_gender: data.missing_gender,
    missing_last_seen_location: data.missing_last_seen_location,
    missing_last_seen_datetime: data.missing_last_seen_datetime,
    missing_clothing: data.missing_clothing,
    missing_identification_marks: data.missing_identification_marks,
    missing_relation_to_reporter: data.missing_relation_to_reporter,
    missing_contact_number: data.missing_contact_number,

    // Theft
    theft_type: data.theft_type,
    theft_location: data.theft_location,
    theft_datetime: data.theft_datetime,
    theft_items_stolen: data.theft_items_stolen,
    theft_estimated_value: data.theft_estimated_value,
    theft_suspect_description: data.theft_suspect_description,
    theft_report_filed: data.theft_report_filed,

    // Suspicious Activity
    suspicious_location: data.suspicious_location,
    suspicious_datetime: data.suspicious_datetime,
    suspicious_activity: data.suspicious_activity,
    suspicious_people: data.suspicious_people,
    suspicious_vehicle: data.suspicious_vehicle,
    suspicious_photos: data.suspicious_photos,

    // Assault
    assault_type: data.assault_type,
    assault_location: data.assault_location,
    assault_datetime: data.assault_datetime,
    assault_description: data.assault_description,
    assault_injuries: data.assault_injuries,
    assault_suspect_description: data.assault_suspect_description,
    assault_relationship: data.assault_relationship,

    // Vandalism
    vandalism_type: data.vandalism_type,
    vandalism_location: data.vandalism_location,
    vandalism_datetime: data.vandalism_datetime,
    vandalism_description: data.vandalism_description,
    vandalism_estimated_cost: data.vandalism_estimated_cost,

    // Cyber Crime
    cyber_type: data.cyber_type,
    cyber_platform: data.cyber_platform,
    cyber_datetime: data.cyber_datetime,
    cyber_description: data.cyber_description,
    cyber_financial_loss: data.cyber_financial_loss,

    // Domestic Violence
    domestic_type: data.domestic_type,
    domestic_location: data.domestic_location,
    domestic_datetime: data.domestic_datetime,
    domestic_description: data.domestic_description,
    domestic_relationship: data.domestic_relationship,

    // Drug Offense
    drug_type: data.drug_type,
    drug_location: data.drug_location,
    drug_datetime: data.drug_datetime,
    drug_description: data.drug_description,

    // Traffic Violation
    traffic_type: data.traffic_type,
    traffic_location: data.traffic_location,
    traffic_datetime: data.traffic_datetime,
    traffic_vehicle_details: data.traffic_vehicle_details,

    // Fraud / Scam
    fraud_type: data.fraud_type,
    fraud_platform: data.fraud_platform,
    fraud_datetime: data.fraud_datetime,
    fraud_description: data.fraud_description,
    fraud_financial_loss: data.fraud_financial_loss,

    // Arson
    arson_location: data.arson_location,
    arson_datetime: data.arson_datetime,
    arson_description: data.arson_description,
    arson_estimated_damage: data.arson_estimated_damage,

    // Other Crime
    other_description: data.other_description,
    other_location: data.other_location,
    other_datetime: data.other_datetime,
    other_witnesses: data.other_witnesses
  };

  const sql = 'INSERT INTO crime_reports SET ?';
  db.query(sql, report, (err, result) => {
    if (err) {
      console.error('Error inserting report:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Report submitted successfully.' });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
