const validGeofence = {
  zone_name: 'Test Zone_name',
  type_zone: 'Test Type_zone',
  coordinates: 'Test Coordinates',
  perimeter: 42,
  statut: true,
};

const geofenceWithAllFields = {
  zone_name: 'Alternate Zone_name',
  type_zone: 'Alternate Type_zone',
  coordinates: 'Alternate Coordinates',
  perimeter: 99,
  statut: true,
};

const invalidGeofence = {
  perimeter: 'not-a-number',
};

const geofenceFilters = {
  bySearch: { search: 'Test Zone' },
  byPerimeterRange: { perimeter_gte: 0, perimeter_lte: 99999999 },
  byStatut: { statut: 'true' },
};

const paginationParams = {
  page: '1',
  perPage: '10',
};

module.exports = {
  validGeofence,
  geofenceWithAllFields,
  invalidGeofence,
  geofenceFilters,
  paginationParams,
};