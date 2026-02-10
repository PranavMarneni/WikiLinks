const crypto = require('crypto');

const generateRoomCode = () => {
  return crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
};

module.exports = generateRoomCode;
