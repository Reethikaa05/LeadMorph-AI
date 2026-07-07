const { parse } = require("csv-parse/sync");

/**
 * Parses a raw CSV buffer/string into { headers, rows }.
 * Column names are NOT assumed - whatever the file provides is used as-is.
 */
function parseCsvBuffer(buffer) {
  const content = Buffer.isBuffer(buffer) ? buffer.toString("utf-8") : String(buffer);

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  });

  const headers = records.length > 0 ? Object.keys(records[0]) : [];

  return { headers, rows: records };
}

module.exports = { parseCsvBuffer };
