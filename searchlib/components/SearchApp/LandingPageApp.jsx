import BasicSearchApp from './BasicSearchApp';

function BoostrapLandingPageView(props) {
  const { appConfig, registry } = props;

  const InitialViewComponent =
    appConfig.initialView?.factory &&
    registry.resolve[appConfig.initialView.factory].component;

  return <InitialViewComponent {...props} />;
}

export default function LandingPageApp(props) {
  return (
    <BasicSearchApp {...props} searchViewComponent={BoostrapLandingPageView} />
  );
}
