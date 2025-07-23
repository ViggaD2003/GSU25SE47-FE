// Helper functions for date filtering

export const getDateRangeFilter = (rangeKey) => {
  const today = new Date();

  switch (rangeKey) {
    case "7days":
      return getDateDaysAgo(today, 7);
    case "30days":
      return getDateDaysAgo(today, 30);
    case "3months":
      return getDateDaysAgo(today, 90);
    case "6months":
      return getDateDaysAgo(today, 180);
    case "1year":
      return getDateDaysAgo(today, 365);
    case "all":
    default:
      return null; // No filter
  }
};

const getDateDaysAgo = (fromDate, days) => {
  const targetDate = new Date(fromDate);
  targetDate.setDate(targetDate.getDate() - days);
  return targetDate;
};

export const filterSurveyRecordsByDateRange = (records, rangeKey) => {
  if (!records || records.length === 0) return records;

  const filterDate = getDateRangeFilter(rangeKey);

  if (!filterDate) {
    return records; // No filter for "all"
  }

  return records.filter((record) => {
    if (!record.completedAt) return false;

    // Parse the completedAt date (assuming format: "2025-07-19")
    const completedDate = new Date(record.completedAt);

    // Check if the date is valid
    if (isNaN(completedDate.getTime())) return false;

    return completedDate >= filterDate;
  });
};

export const getFilteredRecordsInfo = (
  allRecords,
  filteredRecords,
  rangeKey
) => {
  const dateRangeLabels = {
    all: "tất cả thời gian",
    "7days": "7 ngày qua",
    "30days": "30 ngày qua",
    "3months": "3 tháng qua",
    "6months": "6 tháng qua",
    "1year": "1 năm qua",
  };

  return {
    total: allRecords.length,
    filtered: filteredRecords.length,
    rangeLabel: dateRangeLabels[rangeKey] || "tất cả thời gian",
    isFiltered: rangeKey !== "all",
  };
};
