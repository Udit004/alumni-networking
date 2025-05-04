/**
 * Service for cached MongoDB data operations
 */
const mongoose = require('mongoose');
const cacheManager = require('../utils/cacheManager');

/**
 * Get data from MongoDB with caching
 * @param {string} modelName - Mongoose model name
 * @param {Object} query - MongoDB query
 * @param {Object} options - Query options (projection, sort, limit, etc.)
 * @param {string} cacheKey - Custom cache key (defaults to modelName + stringified query)
 * @param {number} expirationTime - Cache expiration time in milliseconds
 * @returns {Promise<Array>} - Query results
 */
const getCachedData = async (modelName, query = {}, options = {}, cacheKey = null, expirationTime = null) => {
  try {
    // Generate cache key if not provided
    const key = cacheKey || `${modelName}:${JSON.stringify(query)}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedData = cacheManager.get(key, expirationTime);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Not in cache, fetch from database
    console.log(`Fetching ${modelName} data from MongoDB with query:`, query);
    
    // Get the model
    const Model = mongoose.model(modelName);
    
    // Build the query
    let dbQuery = Model.find(query);
    
    // Apply options
    if (options.select) {
      dbQuery = dbQuery.select(options.select);
    }
    
    if (options.sort) {
      dbQuery = dbQuery.sort(options.sort);
    }
    
    if (options.limit) {
      dbQuery = dbQuery.limit(options.limit);
    }
    
    if (options.skip) {
      dbQuery = dbQuery.skip(options.skip);
    }
    
    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach(field => {
          dbQuery = dbQuery.populate(field);
        });
      } else {
        dbQuery = dbQuery.populate(options.populate);
      }
    }
    
    // Execute query with lean option for better performance
    const data = await dbQuery.lean().exec();
    
    // Cache the results
    cacheManager.set(key, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching cached data for ${modelName}:`, error);
    throw error;
  }
};

/**
 * Get a single document from MongoDB with caching
 * @param {string} modelName - Mongoose model name
 * @param {string|Object} id - Document ID or query
 * @param {Object} options - Query options (projection, populate)
 * @param {string} cacheKey - Custom cache key
 * @param {number} expirationTime - Cache expiration time in milliseconds
 * @returns {Promise<Object>} - Document
 */
const getCachedDocument = async (modelName, id, options = {}, cacheKey = null, expirationTime = null) => {
  try {
    // Generate cache key if not provided
    const key = cacheKey || `${modelName}:doc:${typeof id === 'object' ? JSON.stringify(id) : id}`;
    
    // Try to get from cache first
    const cachedData = cacheManager.get(key, expirationTime);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Not in cache, fetch from database
    console.log(`Fetching ${modelName} document from MongoDB with ID:`, id);
    
    // Get the model
    const Model = mongoose.model(modelName);
    
    // Build the query
    let dbQuery;
    
    if (typeof id === 'object') {
      // If id is an object, use it as a query
      dbQuery = Model.findOne(id);
    } else {
      // Otherwise, assume it's an ID
      dbQuery = Model.findById(id);
    }
    
    // Apply options
    if (options.select) {
      dbQuery = dbQuery.select(options.select);
    }
    
    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach(field => {
          dbQuery = dbQuery.populate(field);
        });
      } else {
        dbQuery = dbQuery.populate(options.populate);
      }
    }
    
    // Execute query with lean option for better performance
    const data = await dbQuery.lean().exec();
    
    // Cache the results
    if (data) {
      cacheManager.set(key, data);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching cached document for ${modelName}:`, error);
    throw error;
  }
};

/**
 * Invalidate cache for a model
 * @param {string} modelName - Mongoose model name
 */
const invalidateModelCache = (modelName) => {
  cacheManager.invalidatePattern(`^${modelName}:`);
};

/**
 * Invalidate cache for a specific document
 * @param {string} modelName - Mongoose model name
 * @param {string} id - Document ID
 */
const invalidateDocumentCache = (modelName, id) => {
  cacheManager.invalidate(`${modelName}:doc:${id}`);
};

module.exports = {
  getCachedData,
  getCachedDocument,
  invalidateModelCache,
  invalidateDocumentCache,
  cacheManager
};
