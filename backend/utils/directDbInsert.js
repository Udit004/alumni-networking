const mongoose = require('mongoose');

/**
 * Insert a document directly into a MongoDB collection
 * @param {String} collectionName - Name of the collection
 * @param {Object} document - Document to insert
 * @returns {Promise<Object>} - Result of the operation
 */
async function insertDocument(collectionName, document) {
  try {
    console.log(`Inserting document into ${collectionName}:`, document);
    
    // Get direct access to the database
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection not available');
      return { success: false, message: 'Database connection not available' };
    }
    
    // Get the collection
    const collection = db.collection(collectionName);
    
    // Insert the document
    const result = await collection.insertOne(document);
    console.log(`Insert result for ${collectionName}:`, result);
    
    if (result.acknowledged) {
      return { 
        success: true, 
        message: 'Document inserted successfully', 
        id: result.insertedId,
        data: { _id: result.insertedId, ...document }
      };
    } else {
      return { success: false, message: 'Failed to insert document' };
    }
  } catch (error) {
    console.error(`Error inserting document into ${collectionName}:`, error);
    return { success: false, message: error.message };
  }
}

/**
 * Find documents in a MongoDB collection
 * @param {String} collectionName - Name of the collection
 * @param {Object} query - Query to find documents
 * @param {Object} options - Options for the query (sort, limit, etc.)
 * @returns {Promise<Array>} - Array of documents
 */
async function findDocuments(collectionName, query, options = {}) {
  try {
    console.log(`Finding documents in ${collectionName} with query:`, query);
    
    // Get direct access to the database
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection not available');
      return [];
    }
    
    // Get the collection
    const collection = db.collection(collectionName);
    
    // Build the cursor
    let cursor = collection.find(query);
    
    // Apply options
    if (options.sort) {
      cursor = cursor.sort(options.sort);
    }
    
    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }
    
    // Execute the query
    const documents = await cursor.toArray();
    console.log(`Found ${documents.length} documents in ${collectionName}`);
    
    return documents;
  } catch (error) {
    console.error(`Error finding documents in ${collectionName}:`, error);
    return [];
  }
}

/**
 * Update documents in a MongoDB collection
 * @param {String} collectionName - Name of the collection
 * @param {Object} query - Query to find documents
 * @param {Object} update - Update to apply
 * @returns {Promise<Object>} - Result of the operation
 */
async function updateDocuments(collectionName, query, update) {
  try {
    console.log(`Updating documents in ${collectionName} with query:`, query);
    console.log('Update:', update);
    
    // Get direct access to the database
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection not available');
      return { success: false, message: 'Database connection not available' };
    }
    
    // Get the collection
    const collection = db.collection(collectionName);
    
    // Update the documents
    const result = await collection.updateMany(query, update);
    console.log(`Update result for ${collectionName}:`, result);
    
    return { 
      success: true, 
      message: `${result.modifiedCount} documents updated`, 
      modifiedCount: result.modifiedCount 
    };
  } catch (error) {
    console.error(`Error updating documents in ${collectionName}:`, error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  insertDocument,
  findDocuments,
  updateDocuments
};
