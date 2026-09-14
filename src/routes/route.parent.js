/**
 * @Route 
 */
const CoreServices = require("../shared/services/core.services");
module.exports = class Route extends CoreServices {
  constructor() {
    super();
    this.express = require("express");
    this.upload = new (require("../shared/middlewares/upload.middlewares"))();
    this.use = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
    this.auth = new (require("../modules/auth/middlewares/auth.middlewares.js"))();
  }
};