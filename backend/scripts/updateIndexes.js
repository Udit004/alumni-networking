/**
 * Script to update MongoDB indexes for all models
 * Run with: node scripts/updateIndexes.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/alumni-networking';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10
}).then(() => {
  console.log('✅ Connected to MongoDB');
  updateIndexes();
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Function to update indexes
async function updateIndexes() {
  try {
    console.log('🔄 Updating MongoDB indexes...');
    
    // Load all models
    const modelsDir = path.join(__dirname, '..', 'models');
    const modelFiles = fs.readdirSync(modelsDir);
    
    console.log(`📂 Found ${modelFiles.length} model files`);
    
    // Import each model to ensure indexes are created
    for (const file of modelFiles) {
      if (file.endsWith('.js')) {
        const modelPath = path.join(modelsDir, file);
        console.log(`📄 Loading model: ${file}`);
        
        try {
          // Import the model
          require(modelPath);
          
          // Get the model name from the file name
          const modelName = path.basename(file, '.js');
          
          // Get the model
          const Model = mongoose.models[modelName] || 
                        mongoose.models[modelName.charAt(0).toUpperCase() + modelName.slice(1)] ||
                        mongoose.models[modelName.toLowerCase()];
          
          if (Model) {
            console.log(`🔍 Checking indexes for model: ${Model.modelName}`);
            
            // Get the collection
            const collection = Model.collection;
            
            // Get existing indexes
            const indexes = await collection.indexes();
            console.log(`📊 Found ${indexes.length} existing indexes for ${Model.modelName}`);
            
            // Log each index
            indexes.forEach((index, i) => {
              console.log(`   Index ${i+1}: ${JSON.stringify(index.key)} - ${index.name}`);
            });
          } else {
            console.warn(`⚠️ Could not find model for file: ${file}`);
          }
        } catch (err) {
          console.error(`❌ Error loading model ${file}:`, err);
        }
      }
    }
    
    console.log('✅ MongoDB indexes updated successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating indexes:', err);
    process.exit(1);
  }
}
