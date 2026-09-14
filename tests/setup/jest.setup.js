const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI_TEST = mongoServer.getUri();
  global.__MONGOSERVER__ = mongoServer;
};
