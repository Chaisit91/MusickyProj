export const toThaiTime = (date: Date): string => {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

export const formatThaiDate = (data: Record<string, any>): Record<string, any> => {
  const result = { ...data };
  if (result.createdAt) result.createdAt = toThaiTime(new Date(result.createdAt));
  if (result.updatedAt) result.updatedAt = toThaiTime(new Date(result.updatedAt));
  if (result.lastLogin) result.lastLogin = toThaiTime(new Date(result.lastLogin));
  if (result.downloadedAt) result.downloadedAt = toThaiTime(new Date(result.downloadedAt));
  if (result.searchedAt) result.searchedAt = toThaiTime(new Date(result.searchedAt));
  if (result.queuedAt) result.queuedAt = toThaiTime(new Date(result.queuedAt));
  return result;
};