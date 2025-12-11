// Migration to fix old indexes
const mongoose = require('mongoose');

async function fixOldIndexes() {
  try {
    console.log('🔧 [MIGRATION] Checking and fixing old indexes...');
    
    const db = mongoose.connection.db;
    if (!db) {
      console.log('⚠️  [MIGRATION] Database not connected, skipping index fix');
      return;
    }
    
    // Fix bills collection
    try {
      const billsCollection = db.collection('bills');
      const billIndexes = await billsCollection.indexes();
      const hasBillNumber = billIndexes.some(idx => idx.name === 'billNumber_1');
      
      if (hasBillNumber) {
        await billsCollection.dropIndex('billNumber_1');
        console.log('✅ [MIGRATION] Dropped billNumber_1 index from bills');
      }
    } catch (error) {
      if (error.code !== 27) { // Ignore IndexNotFound
        console.error('⚠️  [MIGRATION] Bills index error:', error.message);
      }
    }
    
    // Fix medicalrecords collection
    try {
      const mrCollection = db.collection('medicalrecords');
      const mrIndexes = await mrCollection.indexes();
      
      // Drop unique patientId index if exists
      const uniquePatientIdx = mrIndexes.find(idx => 
        idx.key.patientId === 1 && idx.unique === true && !idx.key.visitDate
      );
      
      if (uniquePatientIdx) {
        await mrCollection.dropIndex(uniquePatientIdx.name);
        console.log(`✅ [MIGRATION] Dropped unique ${uniquePatientIdx.name} from medicalrecords`);
      }
    } catch (error) {
      if (error.code !== 27) {
        console.error('⚠️  [MIGRATION] MedicalRecords index error:', error.message);
      }
    }
    
    console.log('✅ [MIGRATION] Index migration complete');
    
  } catch (error) {
    console.error('❌ [MIGRATION] Error:', error.message);
  }
}

module.exports = { fixOldIndexes };
