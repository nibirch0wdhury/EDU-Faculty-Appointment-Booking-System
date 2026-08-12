const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/(.*)@/, '//****:****@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();