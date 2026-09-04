export const buildMLTFilter = (filter, config) => {
  if (!filter) return;

  const { condition = 'like', queryParams = {} } = config;
  return {
    more_like_this: {
      ...queryParams,
      [condition]: [
        {
          _id: filter.values[0],
        },
      ],
    },
  };
};
