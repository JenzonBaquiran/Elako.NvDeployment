const mongoose = require('mongoose');

async function fixDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ElakoNv');
    console.log('Connected to MongoDB');
    
    // Drop the products collection to remove the problematic index
    try {
      await mongoose.connection.db.dropCollection('products');
      console.log('Products collection dropped successfully');
    } catch (error) {
      if (error.code === 26) {
        console.log('Products collection does not exist, that\'s fine');
      } else {
        console.log('Error dropping collection:', error.message);
      }
    }
    
    await mongoose.disconnect();
    console.log('Database fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDatabase();
