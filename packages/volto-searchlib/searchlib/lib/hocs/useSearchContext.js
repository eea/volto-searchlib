import React from 'react';

export const SearchContext = React.createContext();

export const useSearchContext = () => {
  const context = React.useContext(SearchContext);

  if (!context) {
    // eslint-disable-next-line no-console
    console.warn(
      `The \`useSearchContext\` hook must be used inside the <SearchContext.Provider> component's context.`,
    );
  }

  return context;
};
