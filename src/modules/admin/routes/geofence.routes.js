/**
 * @GeofenceRoutes 
 */


const ParentRoute = require("../../../routes/route.parent")

const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class GeofenceRoutes extends ParentRoute {

  constructor() {
    super()

    // AdminAuthMiddlewares Middleware initialization 
    const adminauthmiddlewares = new(require("../../admin/middlewares/auth.admin.middlewares"))();

    // Controller initialization 
    const geofencecontroller = new(require("../../admin/controllers/geofence.controllers"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Geofence
     *   description: Geofence management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Geofence');

    // Route: Create Geofence
    swaggerBuilder.addRoute('/api/v1/geofence', 'post', 'Create a new geofence', ['Geofence'])
      .addRequestBody('#/components/schemas/CreateGeofencePayload', 'Create Geofence')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateGeofenceResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.use(geofencecontroller.create));

    // Route: Get List of Geofence
    swaggerBuilder.addRoute('/api/v1/geofence', 'get', 'Get list of geofence', ['Geofence'])
      .addQueryParam('perPage', 'string', 'the perPage of geofence', false)
      .addQueryParam('page', 'string', 'the page of geofence', false)
      .addQueryParam('createdBy', 'string', 'the createdBy of geofence', false)
      .addQueryParam('updatedBy', 'string', 'the updatedBy of geofence', false)
      .addQueryParam('deletedBy', 'string', 'the deletedBy of geofence', false)
      .addQueryParam('zone_name', 'string', 'the zone_name of geofence', false)
      .addQueryParam('type_zone', 'string', 'the type_zone of geofence', false)
      .addQueryParam('coordinates', 'string', 'the coordinates of geofence', false)
      .addQueryParam('perimeter', 'number', 'the perimeter of geofence', false)
      .addQueryParam('perimeterLessThan', 'number', 'the perimeterLessThan of geofence', false)
      .addQueryParam('perimeterLessThanOrEqualTo', 'number', 'the perimeterLessThanOrEqualTo of geofence', false)
      .addQueryParam('perimeterGreaterThanOrEqualTo', 'number', 'the perimeterGreaterThanOrEqualTo of geofence', false)
      .addQueryParam('perimeterGreaterThan', 'number', 'the perimeterGreaterThan of geofence', false)
      .addQueryParam('vehicle_id', 'string', 'the vehicle_id of geofence', false)
      .addResponse(200, 'A list of geofence', '#/components/schemas/GeofencePaginationResponse');

    router.route("/").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(geofencecontroller.findAll));

    // Route: Update Geofence
    swaggerBuilder.addRoute('/api/v1/geofence/{id}', 'put', 'Update a geofence by ID', ['Geofence'])
      .addPathParam('id', 'string', 'geofence id', true)
      .addRequestBody('#/components/schemas/UpdateGeofencePayload', 'Update Geofence')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateGeofenceResponse');

    router.route("/:id").put(
      this.use(geofencecontroller.update));

    // Route: Delete Geofence by ID
    swaggerBuilder.addRoute('/api/v1/geofence/{id}', 'delete', 'Delete a geofence by ID', ['Geofence'])
      .addPathParam('id', 'string', 'geofence id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteGeofenceResponse');

    router.route("/:id").delete(
      this.use(geofencecontroller.delete));

    // Route: Get Geofence by ID
    swaggerBuilder.addRoute('/api/v1/geofence/{id}', 'get', 'Get one geofence by ID', ['Geofence'])
      .addPathParam('id', 'string', 'geofence id', true)
      .addResponse(200, 'One Geofence', '#/components/schemas/FindGeofenceResponse');

    router.route("/:id").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(geofencecontroller.findOne));


    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('admin', 'crud.geofence')


    return router
  }
}