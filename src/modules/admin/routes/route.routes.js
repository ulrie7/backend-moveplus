/**
 * @RouteRoutes 
 */


const ParentRoute = require("../../../routes/route.parent")

const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class RouteRoutes extends ParentRoute {

  constructor() {
    super()


    // Controller initialization 
    const routecontroller = new(require("../../admin/controllers/route.controllers"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Route
     *   description: Route management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Route');

    // Route: Create Route
    swaggerBuilder.addRoute('/api/v1/route', 'post', 'Create a new route', ['Route'])
      .addRequestBody('#/components/schemas/CreateRoutePayload', 'Create Route')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateRouteResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.use(routecontroller.create));

    // Route: Get List of Route
    swaggerBuilder.addRoute('/api/v1/route', 'get', 'Get list of route', ['Route'])
      .addQueryParam('perPage', 'string', 'the perPage of route', false)
      .addQueryParam('page', 'string', 'the page of route', false)
      .addQueryParam('createdBy', 'string', 'the createdBy of route', false)
      .addQueryParam('updatedBy', 'string', 'the updatedBy of route', false)
      .addQueryParam('deletedBy', 'string', 'the deletedBy of route', false)
      .addQueryParam('date_startStart', 'string', 'the date_startStart of route', false)
      .addQueryParam('date_startEnd', 'string', 'the date_startEnd of route', false)
      .addQueryParam('date_endStart', 'string', 'the date_endStart of route', false)
      .addQueryParam('date_endEnd', 'string', 'the date_endEnd of route', false)
      .addQueryParam('stop_time', 'number', 'the stop_time of route', false)
      .addQueryParam('stop_timeLessThan', 'number', 'the stop_timeLessThan of route', false)
      .addQueryParam('stop_timeLessThanOrEqualTo', 'number', 'the stop_timeLessThanOrEqualTo of route', false)
      .addQueryParam('stop_timeGreaterThanOrEqualTo', 'number', 'the stop_timeGreaterThanOrEqualTo of route', false)
      .addQueryParam('stop_timeGreaterThan', 'number', 'the stop_timeGreaterThan of route', false)
      .addQueryParam('stop_nb', 'number', 'the stop_nb of route', false)
      .addQueryParam('stop_nbLessThan', 'number', 'the stop_nbLessThan of route', false)
      .addQueryParam('stop_nbLessThanOrEqualTo', 'number', 'the stop_nbLessThanOrEqualTo of route', false)
      .addQueryParam('stop_nbGreaterThanOrEqualTo', 'number', 'the stop_nbGreaterThanOrEqualTo of route', false)
      .addQueryParam('stop_nbGreaterThan', 'number', 'the stop_nbGreaterThan of route', false)
      .addQueryParam('status', 'string', 'the status of route', false)
      .addQueryParam('vehicle_id', 'string', 'the vehicle_id of route', false)
      .addQueryParam('distance', 'number', 'the distance of route', false)
      .addQueryParam('distanceLessThan', 'number', 'the distanceLessThan of route', false)
      .addQueryParam('distanceLessThanOrEqualTo', 'number', 'the distanceLessThanOrEqualTo of route', false)
      .addQueryParam('distanceGreaterThanOrEqualTo', 'number', 'the distanceGreaterThanOrEqualTo of route', false)
      .addQueryParam('distanceGreaterThan', 'number', 'the distanceGreaterThan of route', false)
      .addQueryParam('average_speed', 'number', 'the average_speed of route', false)
      .addQueryParam('average_speedLessThan', 'number', 'the average_speedLessThan of route', false)
      .addQueryParam('average_speedLessThanOrEqualTo', 'number', 'the average_speedLessThanOrEqualTo of route', false)
      .addQueryParam('average_speedGreaterThanOrEqualTo', 'number', 'the average_speedGreaterThanOrEqualTo of route', false)
      .addQueryParam('average_speedGreaterThan', 'number', 'the average_speedGreaterThan of route', false)
      .addQueryParam('max_speed', 'number', 'the max_speed of route', false)
      .addQueryParam('max_speedLessThan', 'number', 'the max_speedLessThan of route', false)
      .addQueryParam('max_speedLessThanOrEqualTo', 'number', 'the max_speedLessThanOrEqualTo of route', false)
      .addQueryParam('max_speedGreaterThanOrEqualTo', 'number', 'the max_speedGreaterThanOrEqualTo of route', false)
      .addQueryParam('max_speedGreaterThan', 'number', 'the max_speedGreaterThan of route', false)
      .addResponse(200, 'A list of route', '#/components/schemas/RoutePaginationResponse');

    router.route("/").get(
      this.use(routecontroller.findAll));

    // Route: Update Route
    swaggerBuilder.addRoute('/api/v1/route/{id}', 'put', 'Update a route by ID', ['Route'])
      .addPathParam('id', 'string', 'route id', true)
      .addRequestBody('#/components/schemas/UpdateRoutePayload', 'Update Route')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateRouteResponse');

    router.route("/:id").put(
      this.use(routecontroller.update));

    // Route: Delete Route by ID
    swaggerBuilder.addRoute('/api/v1/route/{id}', 'delete', 'Delete a route by ID', ['Route'])
      .addPathParam('id', 'string', 'route id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteRouteResponse');

    router.route("/:id").delete(
      this.use(routecontroller.delete));

    // Route: Get Route by ID
    swaggerBuilder.addRoute('/api/v1/route/{id}', 'get', 'Get one route by ID', ['Route'])
      .addPathParam('id', 'string', 'route id', true)
      .addResponse(200, 'One Route', '#/components/schemas/FindRouteResponse');

    router.route("/:id").get(
      this.use(routecontroller.findOne));


    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('admin', 'crud.route')


    return router
  }
}