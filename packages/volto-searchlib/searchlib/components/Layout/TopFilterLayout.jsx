import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';

import { isLandingPageAtom, loadingFamily } from '@eeacms/search/state';
import { isLoadingSummaryAtom } from '@eeacms/search/lib/hocs/useSearchAssist';

const TopFilterLayout = (props) => {
  const {
    bodyContent,
    bodyFooter,
    bodyHeader,
    header,
    sideContent,
    appConfig,
  } = props;
  const { onlyLandingPage = false } = appConfig;
  const [isLandingPage] = useAtom(isLandingPageAtom);
  const loadingAtom = loadingFamily(appConfig.appName);
  const isLoading = useAtomValue(loadingAtom);
  const isLoadingSummary = useAtomValue(isLoadingSummaryAtom);
  const showLoader =
    isLoading || (appConfig.enableChatbotAnswer && isLoadingSummary);

  return (
    <div className="top-filter-layout">
      {showLoader && (
        <Dimmer active inverted>
          <Loader active size="big" />
        </Dimmer>
      )}

      {!onlyLandingPage && (
        <div className="search-header-container">
          <div className="sui-layout-header">
            <div className="sui-layout-header__inner">{header}</div>
          </div>
        </div>
      )}

      <div className="body-content">
        {!isLandingPage && <>{sideContent}</>}
        {bodyHeader}
        {bodyContent}
      </div>

      <Grid className="body-footer">
        <Grid.Row>
          <Grid.Column>
            <div>{bodyFooter}</div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default TopFilterLayout;
