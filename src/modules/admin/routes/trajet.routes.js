/**
 * @TrajetRoutes 
 */


const ParentRoute = require("../../../routes/route.parent")

const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class TrajetRoutes extends ParentRoute {

  constructor() {
    super()

    // AdminAuthMiddlewares Middleware initialization 
    const adminauthmiddlewares = new(require("../../admin/middlewares/auth.admin.middlewares"))();

    // Controller initialization 
    const trajetcontroller = new(require("../../admin/controllers/trajet.controllers"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Trajet
     *   description: Trajet management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Trajet');

    // Route: Create Trajet
    swaggerBuilder.addRoute('/api/v1/trajet', 'post', 'Create a new trajet', ['Trajet'])
      .addRequestBody('#/components/schemas/CreateTrajetPayload', 'Create Trajet')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateTrajetResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.use(trajetcontroller.create));

    // Route: Get List of Trajet
    swaggerBuilder.addRoute('/api/v1/trajet', 'get', 'Get list of trajet', ['Trajet'])
      .addQueryParam('perPage', 'string', 'the perPage of trajet', false)
      .addQueryParam('page', 'string', 'the page of trajet', false)
      .addQueryParam('createdBy', 'string', 'the createdBy of trajet', false)
      .addQueryParam('updatedBy', 'string', 'the updatedBy of trajet', false)
      .addQueryParam('deletedBy', 'string', 'the deletedBy of trajet', false)
      .addQueryParam('date_startStart', 'string', 'the date_startStart of trajet', false)
      .addQueryParam('date_startEnd', 'string', 'the date_startEnd of trajet', false)
      .addQueryParam('date_endStart', 'string', 'the date_endStart of trajet', false)
      .addQueryParam('date_endEnd', 'string', 'the date_endEnd of trajet', false)
      .addQueryParam('stop_time', 'number', 'the stop_time of trajet', false)
      .addQueryParam('stop_timeLessThan', 'number', 'the stop_timeLessThan of trajet', false)
      .addQueryParam('stop_timeLessThanOrEqualTo', 'number', 'the stop_timeLessThanOrEqualTo of trajet', false)
      .addQueryParam('stop_timeGreaterThanOrEqualTo', 'number', 'the stop_timeGreaterThanOrEqualTo of trajet', false)
      .addQueryParam('stop_timeGreaterThan', 'number', 'the stop_timeGreaterThan of trajet', false)
      .addQueryParam('stop_nb', 'number', 'the stop_nb of trajet', false)
      .addQueryParam('stop_nbLessThan', 'number', 'the stop_nbLessThan of trajet', false)
      .addQueryParam('stop_nbLessThanOrEqualTo', 'number', 'the stop_nbLessThanOrEqualTo of trajet', false)
      .addQueryParam('stop_nbGreaterThanOrEqualTo', 'number', 'the stop_nbGreaterThanOrEqualTo of trajet', false)
      .addQueryParam('stop_nbGreaterThan', 'number', 'the stop_nbGreaterThan of trajet', false)
      .addQueryParam('status', 'string', 'the status of trajet', false)
      .addQueryParam('vehicle_id', 'string', 'the vehicle_id of trajet', false)
      .addQueryParam('distance', 'number', 'the distance of trajet', false)
      .addQueryParam('distanceLessThan', 'number', 'the distanceLessThan of trajet', false)
      .addQueryParam('distanceLessThanOrEqualTo', 'number', 'the distanceLessThanOrEqualTo of trajet', false)
      .addQueryParam('distanceGreaterThanOrEqualTo', 'number', 'the distanceGreaterThanOrEqualTo of trajet', false)
      .addQueryParam('distanceGreaterThan', 'number', 'the distanceGreaterThan of trajet', false)
      .addQueryParam('average_speed', 'number', 'the average_speed of trajet', false)
      .addQueryParam('average_speedLessThan', 'number', 'the average_speedLessThan of trajet', false)
      .addQueryParam('average_speedLessThanOrEqualTo', 'number', 'the average_speedLessThanOrEqualTo of trajet', false)
      .addQueryParam('average_speedGreaterThanOrEqualTo', 'number', 'the average_speedGreaterThanOrEqualTo of trajet', false)
      .addQueryParam('average_speedGreaterThan', 'number', 'the average_speedGreaterThan of trajet', false)
      .addQueryParam('max_speed', 'number', 'the max_speed of trajet', false)
      .addQueryParam('max_speedLessThan', 'number', 'the max_speedLessThan of trajet', false)
      .addQueryParam('max_speedLessThanOrEqualTo', 'number', 'the max_speedLessThanOrEqualTo of trajet', false)
      .addQueryParam('max_speedGreaterThanOrEqualTo', 'number', 'the max_speedGreaterThanOrEqualTo of trajet', false)
      .addQueryParam('max_speedGreaterThan', 'number', 'the max_speedGreaterThan of trajet', false)
      .addResponse(200, 'A list of trajet', '#/components/schemas/TrajetPaginationResponse');

    router.route("/").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(trajetcontroller.findAll));

    // Route: Update Trajet
    swaggerBuilder.addRoute('/api/v1/trajet/{id}', 'put', 'Update a trajet by ID', ['Trajet'])
      .addPathParam('id', 'string', 'trajet id', true)
      .addRequestBody('#/components/schemas/UpdateTrajetPayload', 'Update Trajet')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateTrajetResponse');

    router.route("/:id").put(
      this.use(trajetcontroller.update));

    // Route: Delete Trajet by ID
    swaggerBuilder.addRoute('/api/v1/trajet/{id}', 'delete', 'Delete a trajet by ID', ['Trajet'])
      .addPathParam('id', 'string', 'trajet id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteTrajetResponse');

    router.route("/:id").delete(
      this.use(trajetcontroller.delete));

    // Route: Get Trajet by ID
    swaggerBuilder.addRoute('/api/v1/trajet/{id}', 'get', 'Get one trajet by ID', ['Trajet'])
      .addPathParam('id', 'string', 'trajet id', true)
      .addResponse(200, 'One Trajet', '#/components/schemas/FindTrajetResponse');

    router.route("/:id").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(trajetcontroller.findOne));


    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('admin', 'crud.trajet')


    return router
  }
}