/**
 * @ReportRoutes 
 */


const ParentRoute = require("../../../routes/route.parent")

const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class ReportRoutes extends ParentRoute {

  constructor() {
    super()

    // AdminAuthMiddlewares Middleware initialization 
    const adminauthmiddlewares = new(require("../../admin/middlewares/auth.admin.middlewares"))();

    // Controller initialization 
    const reportcontroller = new(require("../../admin/controllers/report.controllers"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Report
     *   description: Report management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Report');

    // Route: Create Report
    swaggerBuilder.addRoute('/api/v1/report', 'post', 'Create a new report', ['Report'])
      .addRequestBody('#/components/schemas/CreateReportPayload', 'Create Report')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateReportResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.use(reportcontroller.create));

    // Route: Get List of Report
    swaggerBuilder.addRoute('/api/v1/report', 'get', 'Get list of report', ['Report'])
      .addQueryParam('perPage', 'string', 'the perPage of report', false)
      .addQueryParam('page', 'string', 'the page of report', false)
      .addQueryParam('createdBy', 'string', 'the createdBy of report', false)
      .addQueryParam('updatedBy', 'string', 'the updatedBy of report', false)
      .addQueryParam('deletedBy', 'string', 'the deletedBy of report', false)
      .addQueryParam('id_admin', 'string', 'the id_admin of report', false)
      .addQueryParam('id_vehicule', 'string', 'the id_vehicule of report', false)
      .addQueryParam('report_type', 'string', 'the report_type of report', false)
      .addQueryParam('date_generationStart', 'string', 'the date_generationStart of report', false)
      .addQueryParam('date_generationEnd', 'string', 'the date_generationEnd of report', false)
      .addQueryParam('periode_debutStart', 'string', 'the periode_debutStart of report', false)
      .addQueryParam('periode_debutEnd', 'string', 'the periode_debutEnd of report', false)
      .addQueryParam('periode_finStart', 'string', 'the periode_finStart of report', false)
      .addQueryParam('periode_finEnd', 'string', 'the periode_finEnd of report', false)
      .addQueryParam('statutStart', 'string', 'the statutStart of report', false)
      .addQueryParam('statutEnd', 'string', 'the statutEnd of report', false)
      .addResponse(200, 'A list of report', '#/components/schemas/ReportPaginationResponse');

    router.route("/").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(reportcontroller.findAll));

    // Route: Update Report
    swaggerBuilder.addRoute('/api/v1/report/{id}', 'put', 'Update a report by ID', ['Report'])
      .addPathParam('id', 'string', 'report id', true)
      .addRequestBody('#/components/schemas/UpdateReportPayload', 'Update Report')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateReportResponse');

    router.route("/:id").put(
      this.use(reportcontroller.update));

    // Route: Delete Report by ID
    swaggerBuilder.addRoute('/api/v1/report/{id}', 'delete', 'Delete a report by ID', ['Report'])
      .addPathParam('id', 'string', 'report id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteReportResponse');

    router.route("/:id").delete(
      this.use(reportcontroller.delete));

    // Route: Get Report by ID
    swaggerBuilder.addRoute('/api/v1/report/{id}', 'get', 'Get one report by ID', ['Report'])
      .addPathParam('id', 'string', 'report id', true)
      .addResponse(200, 'One Report', '#/components/schemas/FindReportResponse');

    router.route("/:id").get(
      adminauthmiddlewares.authorizeAdmin('*'),
      this.use(reportcontroller.findOne));


    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('admin', 'crud.report')


    return router
  }
}