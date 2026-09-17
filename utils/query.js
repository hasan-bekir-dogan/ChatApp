const mongoose = require("mongoose");

/**
 * Mongo treats an object such as `{ "$ne": null }` as a query operator, so a
 * JSON body can smuggle one into a filter. Everything that reaches a query
 * goes through these helpers first.
 */
function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Returns a valid ObjectId or null. Never throws, so callers can answer with a
 * 400 instead of a 500.
 */
function asObjectId(value) {
  const id = asString(value);

  return mongoose.Types.ObjectId.isValid(id) ? id : null;
}

/**
 * Escapes user input before it is used inside a `$regex` filter, which would
 * otherwise allow both false matches and catastrophic backtracking.
 */
function escapeRegExp(value) {
  return asString(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { asString, asObjectId, escapeRegExp };
