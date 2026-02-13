const crypto = require('crypto');

const generateRoomCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

module.exports = generateRoomCode;
