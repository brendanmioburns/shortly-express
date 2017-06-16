const utils = require('../lib/hashUtils');
const Model = require('./model');

class Users extends Model {
  constructor() {
    super('users');
  }

  compare(attempted, password, salt) {
    return utils.compareHash(attempted, password, salt);
  }

  create({ username, password }) {
    let timestamp = Date.now();
    let salt = utils.createSalt(timestamp);
    console.log('show username: ', username, 'show password: ', password);
    let newUser = {
      username: username,
      salt: salt,
      password: utils.createHash(password, salt)
    };

    return super.create.call(this, newUser);
  }
}

module.exports = new Users();
