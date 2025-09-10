const mongoose = require('mongoose');
const MSME = require('./models/msme.model');

async function createTestMSME() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ElakoNv');
    console.log('Connected to MongoDB');
    
    // Check if test MSME already exists
    const existingMSME = await MSME.findOne({ username: 'testmsme' });
    if (existingMSME) {
      console.log('Test MSME already exists:', existingMSME.username);
      await mongoose.disconnect();
      return;
    }
    
    // Create test MSME
    const testMSME = new MSME({
      id: `MSME_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: 'testmsme',
      password: 'password123',
      businessName: 'Test Food Business',
      category: 'food',
      clientProfilingNumber: 'CPN123456',
      address: 'Test Address',
      contactNumber: '09123456789',
      status: 'approved'
    });
    
    await testMSME.save();
    console.log('Test MSME created successfully:');
    console.log('Username: testmsme');
    console.log('Password: password123');
    console.log('Business Name:', testMSME.businessName);
    console.log('Status:', testMSME.status);
    
    await mongoose.disconnect();
    console.log('Test MSME creation completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestMSME();
