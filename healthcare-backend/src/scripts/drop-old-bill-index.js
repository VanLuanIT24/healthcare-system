// Script to drop old indexes causing E11000 errors
const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.DB_HOST || 'mongodb://localhost:27017/healthcare';

async function dropOldIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // 1. Fix bills collection - drop billNumber_1 index
    console.log('📋 Fixing bills collection...');
    const billsCollection = db.collection('bills');
    try {
      const billIndexes = await billsCollection.indexes();
      console.log('Current bill indexes:', billIndexes.map(i => i.name).join(', '));
      
      await billsCollection.dropIndex('billNumber_1');
      console.log('✅ Dropped billNumber_1 index from bills');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  billNumber_1 index not found');
      } else {
        console.error('❌ Error with bills:', error.message);
      }
    }
    
    // 2. Fix medicalrecords collection - drop patientId_1 unique index
    console.log('\n📋 Fixing medicalrecords collection...');
    const mrCollection = db.collection('medicalrecords');
    try {
      const mrIndexes = await mrCollection.indexes();
      console.log('Current medical record indexes:', mrIndexes.map(i => i.name).join(', '));
      
      // Find the unique patientId index and drop it
      const patientIdIndex = mrIndexes.find(idx => 
        idx.key.patientId === 1 && idx.unique === true
      );
      
      if (patientIdIndex) {
        await mrCollection.dropIndex(patientIdIndex.name);
        console.log(`✅ Dropped unique index ${patientIdIndex.name} from medicalrecords`);
      } else {
        console.log('ℹ️  No unique patientId index found');
      }
      
      // Ensure we have the correct non-unique compound index
      const hasCompoundIndex = mrIndexes.some(idx => 
        idx.key.patientId === 1 && idx.key.visitDate === -1
      );
      
      if (!hasCompoundIndex) {
        await mrCollection.createIndex({ patientId: 1, visitDate: -1 });
        console.log('✅ Created compound index (patientId, visitDate) on medicalrecords');
      }
      
    } catch (error) {
      console.error('❌ Error with medicalrecords:', error.message);
    }
    
    console.log('\n✅ Index cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

dropOldIndexes();
