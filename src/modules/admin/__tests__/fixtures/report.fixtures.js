const validReport = {
  report_type: 'Test Report_type',
  date_generation: '2024-01-15',
  periode_debut: '2024-01-15',
  periode_fin: '2024-01-15',
  statut: '2024-01-15',
};

const reportWithAllFields = {
  report_type: 'Alternate Report_type',
  date_generation: '2023-06-20',
  periode_debut: '2023-06-20',
  periode_fin: '2023-06-20',
  statut: '2023-06-20',
};

const invalidReport = {
  date_generation: 'not-a-date',
  periode_debut: 'not-a-date',
  periode_fin: 'not-a-date',
  statut: 'not-a-date',
};

const reportFilters = {
  bySearch: { search: 'Test Repo' },
};

const paginationParams = {
  page: '1',
  perPage: '10',
};

module.exports = {
  validReport,
  reportWithAllFields,
  invalidReport,
  reportFilters,
  paginationParams,
};