export const mockAsyncFetch = async <T>(data: T, ms = 1000) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return data;
};
