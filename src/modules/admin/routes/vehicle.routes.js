/**
 * @VehicleRoutes 
 */


const ParentRoute = require("../../../routes/route.parent")

const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class VehicleRoutes extends ParentRoute {

  constructor() {
    super()


    // Controller initialization 
    const vehiclecontroller = new(require("../../admin/controllers/vehicle.controllers"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Vehicle
     *   description: Vehicle management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Vehicle');

    // Route: Create Vehicle
    swaggerBuilder.addRoute('/api/v1/vehicle', 'post', 'Create a new vehicle', ['Vehicle'])
      .addFormField('imei', 'number', 'the imei of vehicle', true)
      .addFormField('immatriculation', 'string', 'the immatriculation of vehicle', false)
      .addFormField('type_vehicule', 'string', 'the type_vehicule of vehicle', false)
      .addFormField('brand', 'string', 'the brand of vehicle', false)
      .addFormField('modele', 'string', 'the modele of vehicle', false)
      .addFormField('color', 'string', 'the color of vehicle', false)
      .addFormField('year', 'string', 'the year of vehicle', false)
      .addFormField('status', 'string', 'the status of vehicle', false)
      .addFormField('gps_id', 'string', 'the gps_id of vehicle', false)
      .addFileUpload('image', 'imageto upload', true)
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateVehicleResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.upload.defaultUpload(process.env.DEFAULT_UPLOAD || './public/uploads/default/' + 'image', "-image-").single("image"),
      this.use(vehiclecontroller.create));

    // Route: Get List of Vehicle
    swaggerBuilder.addRoute('/api/v1/vehicle', 'get', 'Get list of vehicle', ['Vehicle'])
      .addQueryParam('perPage', 'string', 'the perPage of vehicle', false)
      .addQueryParam('page', 'string', 'the page of vehicle', false)
      .addQueryParam('imei', 'number', 'the imei of vehicle', false)
      .addQueryParam('immatriculation', 'string', 'the immatriculation of vehicle', false)
      .addQueryParam('type_vehicule', 'string', 'the type_vehicule of vehicle', false)
      .addQueryParam('brand', 'string', 'the brand of vehicle', false)
      .addQueryParam('modele', 'string', 'the modele of vehicle', false)
      .addQueryParam('color', 'string', 'the color of vehicle', false)
      .addQueryParam('year', 'number', 'the year of vehicle', false)
      .addQueryParam('yearLessThan', 'number', 'the yearLessThan of vehicle', false)
      .addQueryParam('yearLessThanOrEqualTo', 'number', 'the yearLessThanOrEqualTo of vehicle', false)
      .addQueryParam('yearGreaterThanOrEqualTo', 'number', 'the yearGreaterThanOrEqualTo of vehicle', false)
      .addQueryParam('yearGreaterThan', 'number', 'the yearGreaterThan of vehicle', false)
      .addQueryParam('status', 'string', 'the status of vehicle', false)
      .addQueryParam('gps_id', 'string', 'the gps_id of vehicle', false)
      .addResponse(200, 'A list of vehicle', '#/components/schemas/VehiclePaginationResponse');

    router.route("/").get(
      this.use(vehiclecontroller.findAll));

    // Route: Update Vehicle
    swaggerBuilder.addRoute('/api/v1/vehicle/{id}', 'put', 'Update a vehicle by ID', ['Vehicle'])
      .addPathParam('id', 'string', 'vehicle id', true)
      .addFormField('imei', 'number', 'the imei of vehicle', false)
      .addFormField('immatriculation', 'string', 'the immatriculation of vehicle', false)
      .addFormField('type_vehicule', 'string', 'the type_vehicule of vehicle', false)
      .addFormField('brand', 'string', 'the brand of vehicle', false)
      .addFormField('modele', 'string', 'the modele of vehicle', false)
      .addFormField('color', 'string', 'the color of vehicle', false)
      .addFormField('year', 'string', 'the year of vehicle', false)
      .addFormField('status', 'string', 'the status of vehicle', false)
      .addFormField('gps_id', 'string', 'the gps_id of vehicle', false)
      .addFileUpload('image', 'imageto upload', true)
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateVehicleResponse');

    router.route("/:id").put(
      this.upload.defaultUpload(process.env.DEFAULT_UPLOAD || './public/uploads/default/' + 'image', "-image-").single("image"),
      this.use(vehiclecontroller.update));

    // Route: Delete Vehicle by ID
    swaggerBuilder.addRoute('/api/v1/vehicle/{id}', 'delete', 'Delete a vehicle by ID', ['Vehicle'])
      .addPathParam('id', 'string', 'vehicle id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteVehicleResponse');

    router.route("/:id").delete(
      this.use(vehiclecontroller.delete));

    // Route: Get Vehicle by ID
    swaggerBuilder.addRoute('/api/v1/vehicle/{id}', 'get', 'Get one vehicle by ID', ['Vehicle'])
      .addPathParam('id', 'string', 'vehicle id', true)
      .addResponse(200, 'One Vehicle', '#/components/schemas/FindVehicleResponse');

    router.route("/:id").get(
      this.use(vehiclecontroller.findOne));


    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('admin', 'crud.vehicle')


    return router
  }
}