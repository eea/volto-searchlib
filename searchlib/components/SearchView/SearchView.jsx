/**
 * Full search engine view, with landing page, search input and results
 */

import React from 'react';

import { withAppConfig } from '@eeacms/search/lib/hocs';
import {
  SearchBox,
  AppInfo,
  SampleQueryPrompt,
  RenderSlot,
} from '@eeacms/search/components';
import registry from '@eeacms/search/registry';
import { SearchContext as SUISearchContext } from '@elastic/react-search-ui';

import { checkInteracted } from '@eeacms/search/lib/search/helpers';
import { BodyContent } from './BodyContent';
import BackToHome from './BackToHome';
import { useSearchContext } from '@eeacms/search/lib/hocs';
import { SEARCH_STATE_IDS } from '@eeacms/search/constants';
import { useAtom } from 'jotai';
import { isLandingPageAtom } from './state';

const useWasInteracted = ({ searchedTerm, searchContext, appConfig }) => {
  // a check that, once toggled true, it always return true

  const [cached, setCached] = React.useState();

  const wasInteracted = !!(
    searchedTerm ||
    checkInteracted({
      searchContext,
      appConfig,
    })
  );

  React.useEffect(() => {
    if (wasInteracted && !cached) {
      setCached(true);
    }
    // else if (!wasInteracted && cached === true) {
    //   setCached(false);
    // }
  }, [wasInteracted, cached]);

  const resetInteracted = React.useCallback(() => {
    console.log('reset');
    setCached(false);
  }, []);

  // console.log('wasInteracted', {
  //   wasInteracted,
  //   searchedTerm,
  //
  //   check: checkInteracted({
  //     searchContext,
  //     appConfig,
  //   }),
  //   cached,
  // });

  React.useEffect(() => () => console.log('unmount'), []);

  return {
    wasInteracted: cached || wasInteracted,
    resetInteracted,
  };
};

export const SearchView = (props) => {
  const { appConfig, appName, mode = 'view' } = props;
  // React.useEffect(() => () => console.log('unmount searchview'), []);

  const searchContext = useSearchContext();
  const { driver } = React.useContext(SUISearchContext);
  const [, setIsLandingPageAtom] = useAtom(isLandingPageAtom);

  const Layout = registry.resolve[appConfig.layoutComponent].component;

  const searchedTerm = driver.URLManager // URLManager doesn't exist if not trackStateURL
    ? driver.URLManager.getStateFromURL().searchTerm
    : null;

  const { wasInteracted, resetInteracted } = useWasInteracted({
    searchedTerm,
    searchContext,
    appConfig,
  });

  // console.log(
  //   'searchedTerm',
  //   `-[${searchedTerm}]-[${searchContext.searchTerm}]-`,
  //   wasInteracted,
  // );

  React.useEffect(() => {
    window.searchContext = searchContext;
  }, [searchContext]);

  React.useEffect(() => {
    setIsLandingPageAtom(!wasInteracted);
  }, [setIsLandingPageAtom, wasInteracted]);

  const customClassName = !wasInteracted ? 'landing-page' : 'simple-page';
  const { wasSearched, results = [] } = searchContext;

  const searchState = !wasInteracted
    ? SEARCH_STATE_IDS.isLandingPage
    : wasSearched && results?.length > 0
    ? SEARCH_STATE_IDS.hasResults
    : SEARCH_STATE_IDS.hasNoResults;

  // React.useEffect(() => () => console.log('unmount SearchView'), []);

  return (
    <div className={`searchapp searchapp-${appName} ${customClassName}`}>
      {props.children}
      <Layout
        appConfig={appConfig}
        header={
          <>
            <BackToHome
              wasInteracted={wasInteracted}
              appConfig={appConfig}
              searchContext={searchContext}
              resetInteracted={resetInteracted}
            />
            <RenderSlot
              {...props}
              searchState={searchState}
              slotName="aboveSearchInput"
            />
            <SearchBox
              searchContext={searchContext}
              isLandingPage={!wasInteracted}
              autocompleteMinimumCharacters={3}
              autocompleteResults={appConfig.autocomplete.results}
              autocompleteSuggestions={appConfig.autocomplete.suggestions}
              shouldClearFilters={false}
              useSearchPhrases={appConfig.useSearchPhrases}
              inputView={
                appConfig.searchBoxInputComponent
                  ? registry.resolve[appConfig.searchBoxInputComponent]
                      .component
                  : undefined
              }
              view={
                appConfig.searchBoxComponent
                  ? registry.resolve[appConfig.searchBoxComponent].component
                  : undefined
              }
              mode={mode}
            />
            <RenderSlot
              {...props}
              searchState={searchState}
              slotName="belowSearchInput"
            />
          </>
        }
        sideContent={null}
        bodyHeader={<SampleQueryPrompt />}
        bodyContent={
          <>
            <BodyContent {...props} wasInteracted={wasInteracted} />

            <RenderSlot
              {...props}
              searchState={searchState}
              slotName="belowResults"
            />
          </>
        }
        bodyFooter={wasInteracted ? <AppInfo appConfig={appConfig} /> : null}
      />
    </div>
  );
};

export default withAppConfig(SearchView);
