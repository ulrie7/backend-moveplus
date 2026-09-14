const validAlert = {
  alert_type: 'Test Alert_type',
  seuil: 'Test Seuil',
  date_generation: '2024-01-15',
  status: 'active',
  message: 'Test Message',
};

const alertWithAllFields = {
  alert_type: 'Alternate Alert_type',
  seuil: 'Alternate Seuil',
  date_generation: '2023-06-20',
  status: 'inactive',
  message: 'Alternate Message',
};

const invalidAlert = {
  date_generation: 'not-a-date',
};

const alertFilters = {
  bySearch: { search: 'Test Aler' },
};

const paginationParams = {
  page: '1',
  perPage: '10',
};

module.exports = {
  validAlert,
  alertWithAllFields,
  invalidAlert,
  alertFilters,
  paginationParams,
};