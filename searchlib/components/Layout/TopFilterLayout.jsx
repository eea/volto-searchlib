import React from 'react';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';
import { isLandingPageAtom } from '@eeacms/search/state';
import { useAtom } from 'jotai';
import { useSearchContext } from '@eeacms/search/lib/hocs';

const TopFilterLayout = (props) => {
  const { bodyContent, bodyFooter, bodyHeader, header, sideContent } = props;
  const [isLandingPage] = useAtom(isLandingPageAtom);
  const searchContext = useSearchContext();

  return (
    <div className="top-filter-layout">
      {searchContext.isLoading && (
        <Dimmer active inverted>
          <Loader active size="big" />
        </Dimmer>
      )}

      <div className="search-header-container">
        <div className="sui-layout-header">
          <div className="sui-layout-header__inner">{header}</div>
        </div>
      </div>

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
