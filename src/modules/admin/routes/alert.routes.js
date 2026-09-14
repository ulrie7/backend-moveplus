/**
 * @AlertRoutes 
 */


const ParentRoute = require("../../../routes/route.parent")

const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class AlertRoutes extends ParentRoute {

  constructor() {
    super()

    // AdminAuthMiddlewares Middleware initialization 
    const adminauthmiddlewares = new(require("../../admin/middlewares/auth.admin.middlewares"))();

    // Controller initialization 
    const alertcontroller = new(require("../../admin/controllers/alert.controllers"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Alert
     *   description: Alert management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Alert');

    // Route: Create Alert
    swaggerBuilder.addRoute('/api/v1/alert', 'post', 'Create a new alert', ['Alert'])
      .addRequestBody('#/components/schemas/CreateAlertPayload', 'Create Alert')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateAlertResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.use(alertcontroller.create));

    // Route: Get List of Alert
    swaggerBuilder.addRoute('/api/v1/alert', 'get', 'Get list of alert', ['Alert'])
      .addQueryParam('perPage', 'string', 'the perPage of alert', false)
      .addQueryParam('page', 'string', 'the page of alert', false)
      .addQueryParam('createdBy', 'string', 'the createdBy of alert', false)
      .addQueryParam('updatedBy', 'string', 'the updatedBy of alert', false)
      .addQueryParam('deletedBy', 'string', 'the deletedBy of alert', false)
      .addQueryParam('gps_id', 'string', 'the gps_id of alert', false)
      .addQueryParam('alert_type', 'string', 'the alert_type of alert', false)
      .addQueryParam('seuil', 'string', 'the seuil of alert', false)
      .addQueryParam('date_generationStart', 'string', 'the date_generationStart of alert', false)
      .addQueryParam('date_generationEnd', 'string', 'the date_generationEnd of alert', false)
      .addQueryParam('status', 'string', 'the status of alert', false)
      .addQueryParam('message', 'string', 'the message of alert', false)
      .addResponse(200, 'A list of alert', '#/components/schemas/AlertPaginationResponse');

    router.route("/").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(alertcontroller.findAll));

    // Route: Update Alert
    swaggerBuilder.addRoute('/api/v1/alert/{id}', 'put', 'Update a alert by ID', ['Alert'])
      .addPathParam('id', 'string', 'alert id', true)
      .addRequestBody('#/components/schemas/UpdateAlertPayload', 'Update Alert')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateAlertResponse');

    router.route("/:id").put(
      this.use(alertcontroller.update));

    // Route: Delete Alert by ID
    swaggerBuilder.addRoute('/api/v1/alert/{id}', 'delete', 'Delete a alert by ID', ['Alert'])
      .addPathParam('id', 'string', 'alert id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteAlertResponse');

    router.route("/:id").delete(
      this.use(alertcontroller.delete));

    // Route: Get Alert by ID
    swaggerBuilder.addRoute('/api/v1/alert/{id}', 'get', 'Get one alert by ID', ['Alert'])
      .addPathParam('id', 'string', 'alert id', true)
      .addResponse(200, 'One Alert', '#/components/schemas/FindAlertResponse');

    router.route("/:id").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(alertcontroller.findOne));


    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('admin', 'crud.alert')


    return router
  }
}