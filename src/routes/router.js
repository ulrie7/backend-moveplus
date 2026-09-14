const versionOne = (routeName) => `/api/v1/${routeName}`;
const authRoutes = require('../modules/auth/routes/auth.routes.js');
const adminRoutes = require('../modules/admin/routes/admin.routes.js');
const AdminAuthRoutes = require('../modules/admin/routes/auth.admin.routes.js');
const vehiculeRoutes = require('../modules/admin/routes/vehicule.routes.js');
const gpsRoutes = require('../modules/admin/routes/gps.routes.js');
const trajetRoutes = require('../modules/admin/routes/trajet.routes.js');
const geofenceRoutes = require('../modules/admin/routes/geofence.routes.js');
const alertRoutes = require('../modules/admin/routes/alert.routes.js');
const reportRoutes = require('../modules/admin/routes/report.routes.js');
const routeRoutes = require('../modules/admin/routes/route.routes.js');
const vehicleRoutes = require('../modules/admin/routes/vehicle.routes.js');

module.exports = (app) => {
  app.use(versionOne('auth'), new authRoutes());
  app.use(versionOne('admin'), new adminRoutes());
  app.use(versionOne('admin/auth'), new AdminAuthRoutes());
  app.use(versionOne('vehicule'), new vehiculeRoutes());
  app.use(versionOne('gps'), new gpsRoutes());
  app.use(versionOne('trajet'), new trajetRoutes());
  app.use(versionOne('geofence'), new geofenceRoutes());
  app.use(versionOne('alert'), new alertRoutes());
  app.use(versionOne('report'), new reportRoutes());
  app.use(versionOne('route'), new routeRoutes());
  app.use(versionOne('vehicle'), new vehicleRoutes());
};