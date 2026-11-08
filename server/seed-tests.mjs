// server/seed-tests.mjs
import mongoose from "mongoose";

const tests = [
  {
    testCode: "BSG",
    testName: "Blood Sugar Tests (Diabetes)",
    category: "Biochemistry",
    price: 1000,
    sampleType: "Blood / plasma",
    parameters: [
      { name: "Fasting Blood Sugar (FBS)", unit: "mg/dL", resultType: "numeric", referenceRange: "70–99 mg/dL", low: 70, high: 99 },
      { name: "Random Blood Sugar (RBS)", unit: "mg/dL", resultType: "numeric", referenceRange: "Below 140 mg/dL", low: 70, high: 140 },
      { name: "HbA1c", unit: "%", resultType: "numeric", referenceRange: "Below 5.7%", low: 4, high: 5.7 },
      { name: "Postprandial Blood Sugar (PPBS)", unit: "mg/dL", resultType: "numeric", referenceRange: "Below 140 mg/dL at 2 hours", low: 70, high: 140 },
      { name: "Estimated Average Glucose (eAG)", unit: "", resultType: "numeric", referenceRange: "Depends on HbA1c" }
    ]
  },
  {
    testCode: "CBC",
    testName: "Complete Blood Count (CBC)",
    category: "Hematology",
    price: 1500,
    sampleType: "EDTA whole blood",
    parameters: [
      { name: "Hb (Hemoglobin)", unit: "g/dL", resultType: "numeric", referenceRange: "Male 13.5–17.5; female 12–16", low: 12, high: 17.5 },
      { name: "RBC (Red Blood Cells)", unit: "million/µL", resultType: "numeric", referenceRange: "Male 4.5–5.9; female 4.0–5.2", low: 4.0, high: 5.9 },
      { name: "WBC (White Blood Cells)", unit: "/µL", resultType: "numeric", referenceRange: "4,000–11,000", low: 4000, high: 11000 },
      { name: "HCT (Hematocrit)", unit: "%", resultType: "numeric", referenceRange: "Male 41–53%; female 36–46%", low: 36, high: 53 },
      { name: "MCV (Mean Corpuscular Volume)", unit: "fL", resultType: "numeric", referenceRange: "80–100 fL", low: 80, high: 100 },
      { name: "MCH (Mean Corpuscular Hemoglobin)", unit: "pg", resultType: "numeric", referenceRange: "27–33 pg", low: 27, high: 33 },
      { name: "MCHC", unit: "g/dL", resultType: "numeric", referenceRange: "32–36 g/dL", low: 32, high: 36 },
      { name: "RDW", unit: "%", resultType: "numeric", referenceRange: "11.5–15%", low: 11.5, high: 15 },
      { name: "PLT (Platelets)", unit: "/µL", resultType: "numeric", referenceRange: "150,000–450,000", low: 150000, high: 450000 },
      { name: "MPV", unit: "fL", resultType: "numeric", referenceRange: "7.5–12 fL", low: 7.5, high: 12 },
      { name: "Neutrophils", unit: "%", resultType: "numeric", referenceRange: "40–70%", low: 40, high: 70 },
      { name: "Lymphocytes", unit: "%", resultType: "numeric", referenceRange: "20–40%", low: 20, high: 40 },
      { name: "Monocytes", unit: "%", resultType: "numeric", referenceRange: "2–8%", low: 2, high: 8 },
      { name: "Eosinophils", unit: "%", resultType: "numeric", referenceRange: "1–4%", low: 1, high: 4 },
      { name: "Basophils", unit: "%", resultType: "numeric", referenceRange: "0–1%", low: 0, high: 1 }
    ]
  },
  {
    testCode: "LFT",
    testName: "Liver Function Tests (LFT)",
    category: "Biochemistry",
    price: 1800,
    sampleType: "Serum",
    parameters: [
      { name: "ALT (SGPT)", unit: "U/L", resultType: "numeric", referenceRange: "7–56 U/L", low: 7, high: 56 },
      { name: "AST (SGOT)", unit: "U/L", resultType: "numeric", referenceRange: "10–40 U/L", low: 10, high: 40 },
      { name: "ALP", unit: "U/L", resultType: "numeric", referenceRange: "44–147 U/L", low: 44, high: 147 },
      { name: "GGT", unit: "U/L", resultType: "numeric", referenceRange: "9–48 U/L", low: 9, high: 48 },
      { name: "Total Bilirubin", unit: "mg/dL", resultType: "numeric", referenceRange: "0.1–1.2 mg/dL", low: 0.1, high: 1.2 },
      { name: "Direct Bilirubin", unit: "mg/dL", resultType: "numeric", referenceRange: "0–0.3 mg/dL", low: 0, high: 0.3 },
      { name: "Indirect Bilirubin", unit: "mg/dL", resultType: "numeric", referenceRange: "0.2–0.9 mg/dL", low: 0.2, high: 0.9 },
      { name: "Albumin", unit: "g/dL", resultType: "numeric", referenceRange: "3.5–5.0 g/dL", low: 3.5, high: 5.0 },
      { name: "Total Protein", unit: "g/dL", resultType: "numeric", referenceRange: "6.0–8.3 g/dL", low: 6.0, high: 8.3 },
      { name: "Globulin", unit: "g/dL", resultType: "numeric", referenceRange: "2.0–3.5 g/dL", low: 2.0, high: 3.5 },
      { name: "A/G Ratio", unit: "", resultType: "numeric", referenceRange: "1.0–2.2", low: 1.0, high: 2.2 }
    ]
  },
  {
    testCode: "RFT",
    testName: "Renal Function Tests (RFT)",
    category: "Biochemistry",
    price: 1600,
    sampleType: "Serum / plasma",
    parameters: [
      { name: "Urea", unit: "mg/dL", resultType: "numeric", referenceRange: "15–40 mg/dL", low: 15, high: 40 },
      { name: "BUN", unit: "mg/dL", resultType: "numeric", referenceRange: "7–20 mg/dL", low: 7, high: 20 },
      { name: "Creatinine", unit: "mg/dL", resultType: "numeric", referenceRange: "Male 0.7–1.3; female 0.6–1.1", low: 0.6, high: 1.3 },
      { name: "eGFR", unit: "mL/min/1.73m²", resultType: "numeric", referenceRange: "≥90", low: 90, high: 200 },
      { name: "Uric Acid", unit: "mg/dL", resultType: "numeric", referenceRange: "Male 3.5–7.2; female 2.6–6.0", low: 2.6, high: 7.2 },
      { name: "Sodium (Na)", unit: "mmol/L", resultType: "numeric", referenceRange: "135–145 mmol/L", low: 135, high: 145 },
      { name: "Potassium (K)", unit: "mmol/L", resultType: "numeric", referenceRange: "3.5–5.0 mmol/L", low: 3.5, high: 5.0 },
      { name: "Chloride (Cl)", unit: "mmol/L", resultType: "numeric", referenceRange: "98–106 mmol/L", low: 98, high: 106 },
      { name: "Calcium (Ca)", unit: "mg/dL", resultType: "numeric", referenceRange: "8.5–10.2 mg/dL", low: 8.5, high: 10.2 },
      { name: "Phosphorus", unit: "mg/dL", resultType: "numeric", referenceRange: "2.5–4.5 mg/dL", low: 2.5, high: 4.5 },
      { name: "Magnesium", unit: "mg/dL", resultType: "numeric", referenceRange: "1.7–2.2 mg/dL", low: 1.7, high: 2.2 }
    ]
  }
];

(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/mlmis");
  const col = mongoose.connection.db.collection("tests");
  
  let added = 0;
  for (const t of tests) {
    const exists = await col.findOne({ testCode: t.testCode });
    if (!exists) {
      await col.insertOne({ ...t, isActive: true, createdAt: new Date(), updatedAt: new Date() });
      added++;
      console.log(`✅ Added: ${t.testName} (${t.parameters.length} parameters)`);
    } else {
      console.log(`⏭️ Skipped: ${t.testName} (already exists)`);
    }
  }
  
  console.log(`\n🎉 Done! Added ${added} new test profiles to the database.`);
  await mongoose.disconnect();
  process.exit(0);
})();