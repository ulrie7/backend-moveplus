const validVehicle = {
  immatriculation: 'Test Immatriculation',
  type_vehicule: 'Test Type_vehicule',
  brand: 'Test Brand',
  modele: 'Test Modele',
  color: '#FF5733',
  year: '2024',
  status: 'active',
};

const vehicleWithAllFields = {
  immatriculation: 'Alternate Immatriculation',
  type_vehicule: 'Alternate Type_vehicule',
  brand: 'Alternate Brand',
  modele: 'Alternate Modele',
  color: 'Alternate Color',
  year: '99',
  status: 'inactive',
};

const invalidVehicle = {
  immatriculation: 12345,
};

const vehicleFilters = {
  bySearch: { search: 'Test Imma' },
  byYearRange: { year_gte: 0, year_lte: 99999999 },
};

const paginationParams = {
  page: '1',
  perPage: '10',
};

module.exports = {
  validVehicle,
  vehicleWithAllFields,
  invalidVehicle,
  vehicleFilters,
  paginationParams,
};