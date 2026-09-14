const validTrajet = {
  date_start: '2024-01-15',
  date_end: '2024-01-15',
  stop_time: 42,
  stop_nb: 42,
  status: 'active',
  distance: 42,
  average_speed: 25,
  max_speed: 42,
};

const trajetWithAllFields = {
  date_start: '2023-06-20',
  date_end: '2023-06-20',
  stop_time: 99,
  stop_nb: 99,
  status: 'inactive',
  distance: 99,
  average_speed: 99,
  max_speed: 99,
};

const invalidTrajet = {
  date_start: 'not-a-date',
  date_end: 'not-a-date',
  stop_time: 'not-a-number',
  stop_nb: 'not-a-number',
  distance: 'not-a-number',
  average_speed: 'not-a-number',
  max_speed: 'not-a-number',
};

const trajetFilters = {
  bySearch: { search: 'active' },
  byStop_timeRange: { stop_time_gte: 0, stop_time_lte: 99999999 },
  byStop_nbRange: { stop_nb_gte: 0, stop_nb_lte: 99999999 },
  byDistanceRange: { distance_gte: 0, distance_lte: 99999999 },
  byAverage_speedRange: { average_speed_gte: 0, average_speed_lte: 99999999 },
  byMax_speedRange: { max_speed_gte: 0, max_speed_lte: 99999999 },
};

const paginationParams = {
  page: '1',
  perPage: '10',
};

module.exports = {
  validTrajet,
  trajetWithAllFields,
  invalidTrajet,
  trajetFilters,
  paginationParams,
};