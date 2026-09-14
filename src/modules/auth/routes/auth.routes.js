/**
 * @Auth 
 */


const ParentRoute = require("../../../routes/route.parent")
module.exports = class AuthRoutes extends ParentRoute {

  constructor() {
    super()
    const authController = new(require("../controllers/auth.controller"))()
    const router = this.express.Router();

    return router
  }
}