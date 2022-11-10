import React from 'react';

export const AppConfigContext = React.createContext(null);

export const useAppConfig = () => {
  const context = React.useContext(AppConfigContext);

  if (!context) {
    // eslint-disable-next-line no-console
    console.warn(
      `The \`useAppConfig\` hook must be used inside the <AppConfigContext.Provider> component's context.`,
    );
  }

  return context;
};

export const withAppConfig = (WrappedComponent) => {
  const Wrapper = (props) => {
    const { appConfig, registry } = useAppConfig();

    return (
      <WrappedComponent appConfig={appConfig} registry={registry} {...props} />
    );
  };

  return Wrapper;
};
