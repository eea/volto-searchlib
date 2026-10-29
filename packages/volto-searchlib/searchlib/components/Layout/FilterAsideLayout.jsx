import React from 'react';

import { Grid } from 'semantic-ui-react';
import { isLandingPageAtom } from '@eeacms/search/state';
import { useAtom } from 'jotai';
import { Ref } from 'semantic-ui-react';
import { bodyContentRefAtom } from '@eeacms/search/state';
import cx from 'classnames';

const FilterAsideLayout = (props) => {
  const { bodyContent, bodyFooter, bodyHeader, header, sideContent } = props;
  const [isLandingPage] = useAtom(isLandingPageAtom);

  const [stateRef, setStateRef] = useAtom(bodyContentRefAtom);
  const setRef = React.useCallback(setStateRef, [setStateRef]);

  return (
    <div className="filter-aside-layout">
      <div className="search-header-container">
        <div className="sui-layout-header">
          <div className="sui-layout-header__inner">{header}</div>
        </div>
      </div>

      <Grid columns={2} container stackable className="body-content">
        <Ref innerRef={setRef}>
          {isLandingPage ? (
            <Grid.Row>
              <Grid.Column widescreen="12" tablet="12" className="col-full">
                <div>{bodyHeader}</div>
                <div>{bodyContent}</div>
              </Grid.Column>
            </Grid.Row>
          ) : (
            <Grid.Row>
              <Grid.Column
                widescreen="2"
                tablet="2"
                computer="2"
                className="col-left"
              >
                <div className={cx({ scrolled: stateRef })}>{sideContent}</div>
              </Grid.Column>
              <Grid.Column
                widescreen="10"
                tablet="10"
                computer="10"
                className="col-mid"
              >
                <div>{bodyHeader}</div>
                <div>{bodyContent}</div>
              </Grid.Column>
            </Grid.Row>
          )}
        </Ref>
      </Grid>

      <Grid className="body-footer">
        <Grid.Row>
          <Grid.Column
            widescreen="2"
            tablet="2"
            computer="2"
            className="col-left"
          ></Grid.Column>
          <Grid.Column
            widescreen="8"
            tablet="12"
            computer="10"
            className="col-mid"
          >
            <div>{bodyFooter}</div>
          </Grid.Column>
          <Grid.Column
            only="computer widescreen large screen"
            widescreen="2"
            className="col-right"
          ></Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default FilterAsideLayout;
