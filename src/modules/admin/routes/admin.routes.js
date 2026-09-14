/**
 * @Admin 
 */


const ParentRoute = require("../../../routes/route.parent")
const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class AdminRoutes extends ParentRoute {

  constructor() {
    super()



    // AdminAuthMiddlewares Middleware initialization 
    const _adminauthmiddlewares = new(require("../../admin/middlewares/auth.admin.middlewares"))();

    // Controller initialization 
    const admincontroller = new(require("../../admin/controllers/admin.controller"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Admin
     *   description: Admin management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Admin');

    // Route: Create Admin
    swaggerBuilder.addRoute('/api/v1/admin', 'post', 'Create a new admin', ['Admin'])
      .addRequestBody('#/components/schemas/CreateAdminPayload', 'Create Admin')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateAdminResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.use(admincontroller.create));

    // Route: Get List of Admin
    swaggerBuilder.addRoute('/api/v1/admin', 'get', 'Get list of admin', ['Admin'])
      .addQueryParam('perPage', 'string', 'the perPage of admin', false)
      .addQueryParam('page', 'string', 'the page of admin', false)
      .addQueryParam('firstName', 'string', 'the firstName of admin', false)
      .addQueryParam('lastName', 'string', 'the lastName of admin', false)
      .addQueryParam('email', 'string', 'the email of admin', false)
      .addQueryParam('identity', 'string', 'the identity of admin', false)
      .addResponse(200, 'A list of admin', '#/components/schemas/AdminPaginationResponse');

    router.route("/").get(
      this.use(admincontroller.findAll));



    // Route: Get Admin Profile
    swaggerBuilder.addRoute('/api/v1/admin/profile', 'get', 'Get current profile', ['Admin'])
      .addResponse(200, 'One Admin', '#/components/schemas/GetAdminProfileResponse');

    router.route("/profile").get(
      _adminauthmiddlewares.authorizeAdmin('*'), this.use(admincontroller.getProfile)
    );

    // Route: Update Admin Profile
    swaggerBuilder.addRoute('/api/v1/admin/profile', 'put', 'Update a current profile', ['Admin'])
      .addRequestBody('#/components/schemas/UpdateAdminPayload', 'Update Admin')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateAdminProfileResponse');

    router.route("/profile").put(
      _adminauthmiddlewares.authorizeAdmin('*'),
      this.use(admincontroller.updateProfile)
    );

    // Route: Delete Admin Profile
    swaggerBuilder.addRoute('/api/v1/admin/profile', 'delete', 'Delete a current profile', ['Admin'])
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteAdminProfileResponse');

    router.route("/profile").delete(
      _adminauthmiddlewares.authorizeAdmin('*'), this.use(admincontroller.deleteProfile)
    );

    // Route: Update Admin
    swaggerBuilder.addRoute('/api/v1/admin/{id}', 'put', 'Update a admin by ID', ['Admin'])
      .addPathParam('id', 'string', 'admin id', true)
      .addRequestBody('#/components/schemas/UpdateAdminPayload', 'Update Admin')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateAdminResponse');

    router.route("/:id").put(
      _adminauthmiddlewares.authorizeAdmin('*'),
      this.use(admincontroller.update));

    // Route: Delete Admin by ID
    swaggerBuilder.addRoute('/api/v1/admin/{id}', 'delete', 'Delete a admin by ID', ['Admin'])
      .addPathParam('id', 'string', 'admin id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteAdminResponse');

    router.route("/:id").delete(
      _adminauthmiddlewares.authorizeAdmin('*'),
      this.use(admincontroller.delete));

    // Route: Get Admin by ID
    swaggerBuilder.addRoute('/api/v1/admin/{id}', 'get', 'Get one admin by ID', ['Admin'])
      .addPathParam('id', 'string', 'admin id', true)
      .addResponse(200, 'One Admin', '#/components/schemas/FindAdminResponse');

    router.route("/:id").get(
      this.use(admincontroller.findOne));

    // Save Swagger routes to module spec folder

    swaggerBuilder.saveToModuleSpecFolder('admin', 'crud.admin')


    return router
  }
}