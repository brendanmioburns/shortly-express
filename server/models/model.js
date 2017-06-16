const db = require('../db');
const _ = require('lodash');

const executeQuery = (query, values) => {
  return db.queryAsync(query, values).spread(results => results);
};

const parseData = options => {
  return _.reduce(options, (parsed, value, key) => {
    parsed.string.push(`${key} = ?`);
    parsed.values.push(value);
    return parsed;
  }, { string: [], values: [] });
};

class Model {
  constructor(tablename) {
    this.tablename = tablename;
  }

  getAll() {
    let queryString = `SELECT * FROM ${this.tablename}`;
    return executeQuery(queryString);
  }

  get(options) {
    console.log('OPTIONS = ', options);
    let parsedOptions = parseData(options);
    // console.log('THIS = ', this);
    // console.log('THIS.TABLENAME = ', this.tablename);
    let queryString = `SELECT * FROM ${this.tablename} WHERE ${parsedOptions.string.join(' AND ')}`;
    // console.log('PARSED OPTIONS.STRING.JOIN = ', parsedOptions.string.join('AND'));
    console.log('PARSED OPTIONS = ', parsedOptions);
    // console.log('QUERY STRING = ', queryString);
    return executeQuery(queryString, parsedOptions.values).spread(results => results);
  }                                                     // ^ LIKE .then, BUT REQUIRES RESULTS TO BE AN ARRAY

  create(options) {
    let queryString = `INSERT INTO ${this.tablename} SET ?`;
    return executeQuery(queryString, options);
  }

  update(options, values) {
    let parsedOptions = parseData(options);
    let queryString = `UPDATE ${this.tablename} SET ? WHERE ${parsedOptions.string.join(' AND ')}`;
    return executeQuery(queryString, Array.prototype.concat(values, parsedOptions.values));
  }

  delete(options) {
    let parsedOptions = parseData(options);
    let queryString = `DELETE FROM ${this.tablename} WHERE ${parsedOptions.string.join(' AND ')}`;
    return executeQuery(queryString, parsedOptions.values);
  }

  deleteAll() {
    let queryString = `TRUNCATE TABLE ${this.tablename}`;
    return executeQuery(queryString);
  }
}

module.exports = Model;
