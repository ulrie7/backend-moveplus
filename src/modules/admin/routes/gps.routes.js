/**
 * @GPSRoutes 
 */


const ParentRoute = require("../../../routes/route.parent")

const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class GPSRoutes extends ParentRoute {

  constructor() {
    super()

    // AdminAuthMiddlewares Middleware initialization 
    const adminauthmiddlewares = new(require("../../admin/middlewares/auth.admin.middlewares"))();

    // Controller initialization 
    const gpscontroller = new(require("../../admin/controllers/gps.controllers"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: GPS
     *   description: GPS management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('GPS');

    // Route: Create GPS
    swaggerBuilder.addRoute('/api/v1/gps', 'post', 'Create a new gps', ['GPS'])
      .addRequestBody('#/components/schemas/CreateGPSPayload', 'Create GPS')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateGPSResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.use(gpscontroller.create));

    // Route: Get List of GPS
    swaggerBuilder.addRoute('/api/v1/gps', 'get', 'Get list of gps', ['GPS'])
      .addQueryParam('perPage', 'string', 'the perPage of gps', false)
      .addQueryParam('page', 'string', 'the page of gps', false)
      .addQueryParam('createdBy', 'string', 'the createdBy of gps', false)
      .addQueryParam('updatedBy', 'string', 'the updatedBy of gps', false)
      .addQueryParam('deletedBy', 'string', 'the deletedBy of gps', false)
      .addQueryParam('imei', 'string', 'the imei of gps', false)
      .addQueryParam('status', 'string', 'the status of gps', false)
      .addQueryParam('battery', 'number', 'the battery of gps', false)
      .addQueryParam('batteryLessThan', 'number', 'the batteryLessThan of gps', false)
      .addQueryParam('batteryLessThanOrEqualTo', 'number', 'the batteryLessThanOrEqualTo of gps', false)
      .addQueryParam('batteryGreaterThanOrEqualTo', 'number', 'the batteryGreaterThanOrEqualTo of gps', false)
      .addQueryParam('batteryGreaterThan', 'number', 'the batteryGreaterThan of gps', false)
      .addQueryParam('brand', 'string', 'the brand of gps', false)
      .addQueryParam('last_connexionStart', 'string', 'the last_connexionStart of gps', false)
      .addQueryParam('last_connexionEnd', 'string', 'the last_connexionEnd of gps', false)
      .addQueryParam('model_device', 'string', 'the model_device of gps', false)
      .addQueryParam('vehicle_id', 'string', 'the vehicle_id of gps', false)
      .addResponse(200, 'A list of gps', '#/components/schemas/GPSPaginationResponse');

    router.route("/").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(gpscontroller.findAll));

    // Route: Update GPS
    swaggerBuilder.addRoute('/api/v1/gps/{id}', 'put', 'Update a gps by ID', ['GPS'])
      .addPathParam('id', 'string', 'gps id', true)
      .addRequestBody('#/components/schemas/UpdateGPSPayload', 'Update GPS')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateGPSResponse');

    router.route("/:id").put(
      this.use(gpscontroller.update));

    // Route: Delete GPS by ID
    swaggerBuilder.addRoute('/api/v1/gps/{id}', 'delete', 'Delete a gps by ID', ['GPS'])
      .addPathParam('id', 'string', 'gps id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteGPSResponse');

    router.route("/:id").delete(
      this.use(gpscontroller.delete));

    // Route: Get GPS by ID
    swaggerBuilder.addRoute('/api/v1/gps/{id}', 'get', 'Get one gps by ID', ['GPS'])
      .addPathParam('id', 'string', 'gps id', true)
      .addResponse(200, 'One GPS', '#/components/schemas/FindGPSResponse');

    router.route("/:id").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(gpscontroller.findOne));


    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('admin', 'crud.gps')


    return router
  }
}