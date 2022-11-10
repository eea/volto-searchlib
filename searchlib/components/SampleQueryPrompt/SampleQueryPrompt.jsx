import React from 'react';
import { useSearchContext, useAppConfig } from '@eeacms/search/lib/hocs';
import { Modal, Icon, List, Button } from 'semantic-ui-react';
import { isLandingPageAtom } from '@eeacms/search/state';
import { useAtom } from 'jotai';

function toArray(s) {
  let a = [];
  if (typeof s === 'string') {
    a = (s || '').split('\n').filter((n) => !!n.trim());
  } else if (Array.isArray(s)) {
    a = s;
  }
  return a;
}

export default function SampleQueryPrompt() {
  const { appConfig } = useAppConfig();
  const { setSearchTerm, setSort, resetFilters } = useSearchContext();
  const [showModal, setShowModal] = React.useState();
  const [isLandingPage] = useAtom(isLandingPageAtom);

  const {
    showPromptQueries,
    defaultPromptQueries = [],
    promptQueries,
    // promptQueryInterval = 10000,
  } = appConfig;

  const pqa = toArray(promptQueries);
  const dpqa = toArray(defaultPromptQueries);

  const queries = pqa.length ? pqa : dpqa.length ? dpqa : [];
  // const nrQueries = queries.length;

  const [visibleQueries, setVisibleQueries] = React.useState(
    queries.slice(0, 3),
  );

  React.useEffect(() => {
    const result = queries.slice(0, 3).map(function () {
      return this.splice(Math.floor(Math.random() * this.length), 1)[0];
    }, queries.slice());
    setVisibleQueries(result);
  }, [setVisibleQueries, queries]);

  // const randomizer = React.useCallback(
  //   () => Math.max(Math.ceil(Math.random() * nrQueries) - 1, 0),
  //   [nrQueries],
  // );

  // const [index, setIndex] = React.useState(randomizer());
  // const [paused, setPaused] = React.useState(false);
  // const timerRef = React.useRef();

  // React.useEffect(() => {
  //   timerRef.current = setInterval(() => {
  //     const next = randomizer();
  //     if (!paused) setIndex(next);
  //   }, promptQueryInterval);
  //   return () => clearInterval(timerRef.current);
  // }, [paused, promptQueryInterval, randomizer]);

  const applyQuery = React.useCallback(
    (text) => {
      resetFilters();
      setSearchTerm(text, { shouldClearFilters: false });
      setSort('', '');
    },
    [resetFilters, setSearchTerm, setSort],
  );

  return showPromptQueries && isLandingPage && queries.length ? (
    <div className="demo-question">
      <h4>Try our suggestions</h4>
      {/*<Button
        as="a"
        basic
        onMouseOver={() => setPaused(true)}
        onMouseOut={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onClick={(evt) => {
          evt.preventDefault();
          // setTriedDemoQuestion(true);
          applyQuery(queries[index]);
        }}
        key={queries[index]}
      >
        {queries[index]}
      </Button>*/}

      <List className="search-list">
        {(visibleQueries || []).map((text, i) => (
          <List.Item
            key={i}
            as="a"
            onClick={() => {
              applyQuery(text);
            }}
            onKeyDown={() => {
              applyQuery(text);
            }}
          >
            {text}
          </List.Item>
        ))}
      </List>

      <Button
        className="explore-more-queries"
        basic
        compact
        as="a"
        onClick={(e) => {
          setShowModal(true);
          e.preventDefault();
          e.stopPropagation();
        }}
        onKeyDown={() => {}}
      >
        More
        <Icon className="ri-arrow-down-s-line" />
      </Button>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        onOpen={() => setShowModal(true)}
      >
        <Modal.Header>Pick one of our sample questions</Modal.Header>
        <Modal.Content scrolling>
          <List className="search-list">
            {queries.map((text, i) => (
              <List.Item
                key={i}
                as="a"
                onClick={() => {
                  applyQuery(text);
                }}
                onKeyDown={() => {
                  applyQuery(text);
                }}
              >
                {text}
              </List.Item>
            ))}
          </List>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
    </div>
  ) : null;
}
