const ParentRoute = require("../../../routes/route.parent");

module.exports = class VehiculeRoutes extends ParentRoute {
  constructor() {
    super();
    const router = this.express.Router();
    return router;
  }
};