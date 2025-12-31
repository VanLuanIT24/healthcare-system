
require('dotenv').config();
const mongoose = require('mongoose');
const prescriptionService = require('./src/services/prescription.service');
const Prescription = require('./src/models/prescription.model');
const fs = require('fs');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find any prescription
        const prescription = await Prescription.findOne().sort({ createdAt: -1 });
        if (!prescription) {
            console.log('No prescription found to test.');
            process.exit(0);
        }
        console.log('Testing with prescription:', prescription._id);

        try {
            const pdfBuffer = await prescriptionService.generatePrescriptionPDF(prescription._id);
            console.log('PDF generated successfully. Size:', pdfBuffer.length);
            fs.writeFileSync('test_prescription.pdf', pdfBuffer);
            console.log('Saved to test_prescription.pdf');
        } catch (genError) {
            console.error('ERROR Generating PDF:', genError);
        }

        process.exit(0);

    } catch (err) {
        console.error('Script Error:', err);
        process.exit(1);
    }
}

verify();
