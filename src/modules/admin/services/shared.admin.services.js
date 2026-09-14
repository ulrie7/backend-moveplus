module.exports = class SharedAdminServices {

  constructor() {

  }
  /**
   * @createAdmin
   */
  createAdmin = async (payload, session = null) => {
    const AdminServices = new(require("./admin.services"))();
    return await AdminServices.create(payload, session);
  };
  /**
   * @updateAdmin
   */
  updateAdmin = async (query, payload, profile, session = null) => {
    const AdminServices = new(require("./admin.services"))();
    return await AdminServices.update(query, payload, profile, session);
  };
  /**
   * @deleteAdmin
   */
  deleteAdmin = async (query, profile, session = null) => {
    const AdminServices = new(require("./admin.services"))();
    return await AdminServices.delete(query, profile, session);
  };
  /**
   * @findAdminById
   */
  findAdminById = async (id, session = null) => {
    const AdminServices = new(require("./admin.services"))();
    return await AdminServices.findById(id, session);
  };
  /**
   * @getAdminList
   */
  getAdminList = async (querySchema, match = {
    matchIdentity: {}
  }, session = null) => {
    const AdminServices = new(require("./admin.services"))();
    return await AdminServices.getList(querySchema, match, session);
  };
  /**
   * @createVehicle
   */
  createVehicle = async (payload, session = null) => {
    const VehicleServices = new(require("./vehicle.services"))();
    return await VehicleServices.create(payload, session);
  };
  /**
   * @updateVehicle
   */
  updateVehicle = async (query, payload, session = null) => {
    const VehicleServices = new(require("./vehicle.services"))();
    return await VehicleServices.update(query, payload, session);
  };
  /**
   * @deleteVehicle
   */
  deleteVehicle = async (query, session = null) => {
    const VehicleServices = new(require("./vehicle.services"))();
    return await VehicleServices.delete(query, session);
  };
  /**
   * @findVehicleById
   */
  findVehicleById = async (id, session = null) => {
    const VehicleServices = new(require("./vehicle.services"))();
    return await VehicleServices.findById(id, session);
  };
  /**
   * @getVehicleList
   */
  getVehicleList = async (querySchema, match = {
    matchGps_id: {}
  }, session = null) => {
    const VehicleServices = new(require("./vehicle.services"))();
    return await VehicleServices.getList(querySchema, match, session);
  };
  /**
   * @createGPS
   */
  createGPS = async (payload, session = null) => {
    const GPSServices = new(require("./gps.services"))();
    return await GPSServices.create(payload, session);
  };
  /**
   * @updateGPS
   */
  updateGPS = async (query, payload, session = null) => {
    const GPSServices = new(require("./gps.services"))();
    return await GPSServices.update(query, payload, session);
  };
  /**
   * @deleteGPS
   */
  deleteGPS = async (query, session = null) => {
    const GPSServices = new(require("./gps.services"))();
    return await GPSServices.delete(query, session);
  };
  /**
   * @findGPSById
   */
  findGPSById = async (id, session = null) => {
    const GPSServices = new(require("./gps.services"))();
    return await GPSServices.findById(id, session);
  };
  /**
   * @getGPSList
   */
  getGPSList = async (querySchema, match = {
    matchVehicle_id: {}
  }, session = null) => {
    const GPSServices = new(require("./gps.services"))();
    return await GPSServices.getList(querySchema, match, session);
  };
  /**
   * @createRoute
   */
  createRoute = async (payload, session = null) => {
    const RouteServices = new(require("./route.services"))();
    return await RouteServices.create(payload, session);
  };
  /**
   * @updateRoute
   */
  updateRoute = async (query, payload, session = null) => {
    const RouteServices = new(require("./route.services"))();
    return await RouteServices.update(query, payload, session);
  };
  /**
   * @deleteRoute
   */
  deleteRoute = async (query, session = null) => {
    const RouteServices = new(require("./route.services"))();
    return await RouteServices.delete(query, session);
  };
  /**
   * @findRouteById
   */
  findRouteById = async (id, session = null) => {
    const RouteServices = new(require("./route.services"))();
    return await RouteServices.findById(id, session);
  };
  /**
   * @getRouteList
   */
  getRouteList = async (querySchema, match = {
    matchVehicle_id: {}
  }, session = null) => {
    const RouteServices = new(require("./route.services"))();
    return await RouteServices.getList(querySchema, match, session);
  };
  /**
   * @createGeofence
   */
  createGeofence = async (payload, session = null) => {
    const GeofenceServices = new(require("./geofence.services"))();
    return await GeofenceServices.create(payload, session);
  };
  /**
   * @updateGeofence
   */
  updateGeofence = async (query, payload, session = null) => {
    const GeofenceServices = new(require("./geofence.services"))();
    return await GeofenceServices.update(query, payload, session);
  };
  /**
   * @deleteGeofence
   */
  deleteGeofence = async (query, session = null) => {
    const GeofenceServices = new(require("./geofence.services"))();
    return await GeofenceServices.delete(query, session);
  };
  /**
   * @findGeofenceById
   */
  findGeofenceById = async (id, session = null) => {
    const GeofenceServices = new(require("./geofence.services"))();
    return await GeofenceServices.findById(id, session);
  };
  /**
   * @getGeofenceList
   */
  getGeofenceList = async (querySchema, match = {
    matchVehicle_id: {}
  }, session = null) => {
    const GeofenceServices = new(require("./geofence.services"))();
    return await GeofenceServices.getList(querySchema, match, session);
  };
  /**
   * @createAlert
   */
  createAlert = async (payload, session = null) => {
    const AlertServices = new(require("./alert.services"))();
    return await AlertServices.create(payload, session);
  };
  /**
   * @updateAlert
   */
  updateAlert = async (query, payload, session = null) => {
    const AlertServices = new(require("./alert.services"))();
    return await AlertServices.update(query, payload, session);
  };
  /**
   * @deleteAlert
   */
  deleteAlert = async (query, session = null) => {
    const AlertServices = new(require("./alert.services"))();
    return await AlertServices.delete(query, session);
  };
  /**
   * @findAlertById
   */
  findAlertById = async (id, session = null) => {
    const AlertServices = new(require("./alert.services"))();
    return await AlertServices.findById(id, session);
  };
  /**
   * @getAlertList
   */
  getAlertList = async (querySchema, match = {
    matchGps_id: {}
  }, session = null) => {
    const AlertServices = new(require("./alert.services"))();
    return await AlertServices.getList(querySchema, match, session);
  };
  /**
   * @createReport
   */
  createReport = async (payload, session = null) => {
    const ReportServices = new(require("./report.services"))();
    return await ReportServices.create(payload, session);
  };
  /**
   * @updateReport
   */
  updateReport = async (query, payload, session = null) => {
    const ReportServices = new(require("./report.services"))();
    return await ReportServices.update(query, payload, session);
  };
  /**
   * @deleteReport
   */
  deleteReport = async (query, session = null) => {
    const ReportServices = new(require("./report.services"))();
    return await ReportServices.delete(query, session);
  };
  /**
   * @findReportById
   */
  findReportById = async (id, session = null) => {
    const ReportServices = new(require("./report.services"))();
    return await ReportServices.findById(id, session);
  };
  /**
   * @getReportList
   */
  getReportList = async (querySchema, match = {
    matchId_admin: {},
    matchId_vehicule: {}
  }, session = null) => {
    const ReportServices = new(require("./report.services"))();
    return await ReportServices.getList(querySchema, match, session);
  };
  /**
   * @createTrajet
   */
  createTrajet = async (payload, session = null) => {
    const TrajetServices = new(require("./trajet.services"))();
    return await TrajetServices.create(payload, session);
  };
  /**
   * @updateTrajet
   */
  updateTrajet = async (query, payload, session = null) => {
    const TrajetServices = new(require("./trajet.services"))();
    return await TrajetServices.update(query, payload, session);
  };
  /**
   * @deleteTrajet
   */
  deleteTrajet = async (query, session = null) => {
    const TrajetServices = new(require("./trajet.services"))();
    return await TrajetServices.delete(query, session);
  };
  /**
   * @findTrajetById
   */
  findTrajetById = async (id, session = null) => {
    const TrajetServices = new(require("./trajet.services"))();
    return await TrajetServices.findById(id, session);
  };
  /**
   * @getTrajetList
   */
  getTrajetList = async (querySchema, match = {
    matchVehicle_id: {}
  }, session = null) => {
    const TrajetServices = new(require("./trajet.services"))();
    return await TrajetServices.getList(querySchema, match, session);
  };

}