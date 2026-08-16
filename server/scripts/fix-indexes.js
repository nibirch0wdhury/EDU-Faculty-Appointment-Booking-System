const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixIndexes = async () => {
  let connection;
  
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    console.log(`📊 Database: ${process.env.MONGODB_URI ? 'Using MONGODB_URI' : 'Using default'}`);
    
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    const collection = db.collection('schedules');
    
    // ========================================
    // 1. Show all current indexes
    // ========================================
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => {
      const keys = Object.keys(idx.key);
      const isOldIndex = keys.includes('day');
      console.log(`  ${isOldIndex ? '⚠️' : '✅'} ${idx.name}:`, JSON.stringify(idx.key));
    });
    
    // ========================================
    // 2. Drop old indexes
    // ========================================
    const oldIndexNames = [
      'facultyId_1_day_1_startTime_1',
      'facultyId_1_day_1_startTime_1_1',
      'facultyId_1_day_1_startTime_1_2',
    ];
    
    for (const oldIndexName of oldIndexNames) {
      try {
        await collection.dropIndex(oldIndexName);
        console.log(`\n✅ Dropped index: "${oldIndexName}"`);
      } catch (err) {
        if (err.code === 27) {
          console.log(`\nℹ️ Index "${oldIndexName}" does not exist (skipped)`);
        } else {
          console.log(`\n⚠️ Could not drop index "${oldIndexName}":`, err.message);
        }
      }
    }
    
    // ========================================
    // 3. Drop any index that has 'day' field
    // ========================================
    const currentIndexes = await collection.indexes();
    for (const idx of currentIndexes) {
      if (idx.key && idx.key.day !== undefined && idx.name !== '_id_') {
        try {
          await collection.dropIndex(idx.name);
          console.log(`\n✅ Dropped old day-based index: "${idx.name}"`);
        } catch (err) {
          console.log(`\n⚠️ Could not drop "${idx.name}":`, err.message);
        }
      }
    }
    
    // ========================================
    // 4. Remove old data with 'day' field
    // ========================================
    const oldDataCount = await collection.countDocuments({ day: { $exists: true } });
    if (oldDataCount > 0) {
      console.log(`\n📋 Found ${oldDataCount} documents with old 'day' field format`);
      const result = await collection.deleteMany({ day: { $exists: true } });
      console.log(`✅ Removed ${result.deletedCount} documents with old format`);
    }
    
    // ========================================
    // 5. Create new indexes
    // ========================================
    console.log('\n🔄 Creating new indexes...');
    
    // Unique index for faculty/date/time
    await collection.createIndex(
      { facultyId: 1, date: 1, startTime: 1 },
      { unique: true, name: 'facultyId_1_date_1_startTime_1' }
    );
    console.log('✅ Created index: facultyId_1_date_1_startTime_1');
    
    // Index for date range queries
    await collection.createIndex(
      { facultyId: 1, date: 1 },
      { name: 'facultyId_1_date_1' }
    );
    console.log('✅ Created index: facultyId_1_date_1');
    
    // Index for availability queries
    await collection.createIndex(
      { facultyId: 1, date: 1, isAvailable: 1 },
      { name: 'facultyId_1_date_1_isAvailable_1' }
    );
    console.log('✅ Created index: facultyId_1_date_1_isAvailable_1');
    
    // Index for sorting by date
    await collection.createIndex(
      { date: -1 },
      { name: 'date_-1' }
    );
    console.log('✅ Created index: date_-1');
    
    // ========================================
    // 6. Show final indexes
    // ========================================
    const finalIndexes = await collection.indexes();
    console.log('\n📋 Final indexes:');
    finalIndexes.forEach(idx => {
      console.log(`  ✅ ${idx.name}:`, JSON.stringify(idx.key));
    });
    
    console.log('\n✅ All done! Indexes fixed successfully.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
    process.exit(0);
  }
};

fixIndexes();