/**
 * A component to render the content clusters
 */

import React from 'react';
import { Menu, Ref } from 'semantic-ui-react'; // Dropdown
import { Icon } from '@eeacms/search/components';
import { useAtom } from 'jotai';

import {
  // useWindowDimensions,
  useSearchContext,
  useAppConfig,
} from '@eeacms/search/lib/hocs';
import { isLandingPageAtom } from '@eeacms/search/state';

const cmp = (a, b) => (a > b ? 1 : a === b ? 0 : a < b ? -1 : 0);

const SectionTabs = (props) => {
  // const { width } = useWindowDimensions();
  const searchContext = useSearchContext();
  const { appConfig } = useAppConfig();
  const [isLandingPage] = useAtom(isLandingPageAtom);
  const menuRef = React.useRef(null);

  const showOverflow = false;

  // TODO: use https://www.npmjs.com/package/react-horizontal-scrolling-menu ?
  //
  // const [showOverflow, setShowOverflow] = React.useState(false);
  // React.useLayoutEffect(() => {
  //   setTimeout(() => {
  //     if (
  //       menuRef.current &&
  //       menuRef.current.clientWidth < menuRef.current.scrollWidth
  //     ) {
  //       setShowOverflow(true);
  //     } else {
  //       setShowOverflow(false);
  //     }
  //   }, 100);
  // }, []);

  const { contentSectionsParams = {} } = appConfig;
  if (!contentSectionsParams.enable || isLandingPage) return null;

  const { facets = {}, filters = [] } = searchContext;
  const facetField = contentSectionsParams.sectionFacetsField;

  const sectionOrder = contentSectionsParams.sections.map(({ name }) => name);

  let sections = facets?.[facetField]?.[0]?.data || [];
  const activeFilter = filters.find(({ field }) => field === facetField) || {};
  let activeValues = activeFilter.values || [];
  if (!Array.isArray(activeValues)) {
    activeValues = [activeValues];
  }

  const allCount =
    sections.filter((section) => section.value === '_all_')?.[0]?.count ||
    sections.reduce((acc, { count }) => acc + count, 0);

  sections = sections.filter((section) => section.value !== '_all_');
  sections.sort((s1, s2) =>
    cmp(sectionOrder.indexOf(s1.value), sectionOrder.indexOf(s2.value)),
  );

  return (
    <div>
      {showOverflow ? (
        <span className="content-section-tabs-overflow">
          <Icon name="angle right" />
        </span>
      ) : (
        ''
      )}
      <Ref innerRef={menuRef}>
        <Menu secondary pointing className="content-section-tabs">
          <Menu.Item
            onClick={() => {
              searchContext.removeFilter(facetField, '', 'any');
            }}
            active={activeValues.length === 0}
          >
            {`All (${allCount})`}
          </Menu.Item>
          {sections.map(({ value, count }) => (
            <Menu.Item
              key={value}
              active={activeValues.includes(value)}
              onClick={() => {
                searchContext.setFilter(facetField, value, 'any');
              }}
            >
              {/*<Icon type={value} family="Content types" />*/}
              <span className="title">{value}</span>
              <span className="count">({count})</span>
            </Menu.Item>
          ))}
        </Menu>
      </Ref>
    </div>
  );
};

export default SectionTabs;

/**
 *
        {enableFeature && hiddenSections.length > 0 && (
          <Dropdown item text="More">
            <Dropdown.Menu>
              {hiddenSections.map(({ value, count }) => (
                <Dropdown.Item
                  key={value}
                  active={activeValues.includes(value)}
                  onClick={() => {
                    searchContext.setFilter(facetField, value, 'any');
                    views.setActiveViewId(
                      sectionMapping[value].defaultResultView || 'listing',
                    );
                  }}
                >
                  <Icon type={value} family="Content types" />
                  <span className="title">{value}</span>
                  <span className="count">({count})</span>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}

  // const tabSize = (title) => {
  //   return title.length * 10 + 120;
  // };
  // const noLeftCol = width < 770 ? 150 : 0;
  // const tolerance = 230 - noLeftCol;
  //
  // let visibleSections = [];
  // let hiddenSections = [];
  // let totalWidth = 0;
  // for (let section of sections) {
  //   let tabS = tabSize(section.value);
  //   totalWidth += tabS;
  //
  //   if (totalWidth + tolerance > width) {
  //     section.hidden = true;
  //     hiddenSections.push(section);
  //   } else {
  //     section.hidden = false;
  //     visibleSections.push(section);
  //   }
  // }
  // const enableFeature = false; // WIP use it to test the partial solution
  //
  // if (enableFeature) {
  //   sections = visibleSections;
  // }

 *
*/
