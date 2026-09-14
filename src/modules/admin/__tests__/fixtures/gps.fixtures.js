const validGPS = {
  imei: 'Test Imei',
  status: 'active',
  battery: 42,
  brand: 'Test Brand',
  last_connexion: '2024-01-15',
  model_device: 'Test Model_device',
};

const gPSWithAllFields = {
  imei: 'Alternate Imei',
  status: 'inactive',
  battery: 99,
  brand: 'Alternate Brand',
  last_connexion: '2023-06-20',
  model_device: 'Alternate Model_device',
};

const invalidGPS = {
  battery: 'not-a-number',
  last_connexion: 'not-a-date',
};

const gPSFilters = {
  bySearch: { search: 'Test Imei' },
  byBatteryRange: { battery_gte: 0, battery_lte: 99999999 },
};

const paginationParams = {
  page: '1',
  perPage: '10',
};

module.exports = {
  validGPS,
  gPSWithAllFields,
  invalidGPS,
  gPSFilters,
  paginationParams,
};