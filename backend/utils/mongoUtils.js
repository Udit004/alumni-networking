/**
 * MongoDB utility functions
 */
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to check
 * @returns {boolean} - Whether the ID is a valid ObjectId
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
};

/**
 * Safely convert a string to a MongoDB ObjectId
 * @param {string} id - The ID to convert
 * @returns {ObjectId|string} - The ObjectId if valid, or the original string
 */
const toObjectId = (id) => {
  if (isValidObjectId(id)) {
    return new ObjectId(id);
  }
  return id;
};

/**
 * Create a safe query for MongoDB that handles both ObjectId and string IDs
 * @param {string} id - The ID to query
 * @param {string} field - The field name (default: '_id')
 * @returns {Object} - A MongoDB query object
 */
const createIdQuery = (id, field = '_id') => {
  if (isValidObjectId(id)) {
    return { [field]: new ObjectId(id) };
  }
  
  // If it's not a valid ObjectId, create a query that will match either a string ID or an ObjectId
  return {
    $or: [
      { [field]: id }, // Match string ID
      // Add any other fields that might contain the ID
      { 'alternateIds': id }
    ]
  };
};

module.exports = {
  isValidObjectId,
  toObjectId,
  createIdQuery
};
