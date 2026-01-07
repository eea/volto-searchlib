/**
 * A singleton object exposed as a module. Importing the registry is fine if
 * you only read the `registry.resolve` part, as that's meant to be fixed and
 * unique. The `searchui` part is meant to be mutable and should be read
 * through the system by passing it down or using `useAppConfig().appConfig`
 *
 */

import React from 'react';
import { SearchBox } from '@elastic/react-search-ui';
import SingleTermFacet from '@eeacms/search/components/Facets/Unconnected/SingleTermFacet';
import MultiTermFacet from '@eeacms/search/components/Facets/Unconnected/MultiTermFacet';
import MultiTermListFacet from '@eeacms/search/components/Facets/Unconnected/MultiTermListFacet';
import HistogramFacet from '@eeacms/search/components/Facets/Unconnected/HistogramFacet';
import BooleanFacet from '@eeacms/search/components/Facets/Unconnected/BooleanFacet';
import DropdownFixedRangeFilter from '@eeacms/search/components/Filters/DropdownFixedRangeFilter';
// import FilterWrapper from '@eeacms/search/components/Filters/FilterWrapper';
import DropdownFacetWrapper from '@eeacms/search/components/Facets/Wrappers/DropdownFacetWrapper';
import FixedRangeFacet from '@eeacms/search/components/Facets/Unconnected/FixedRangeFacet';
import ModalFixedRangeFacet from '@eeacms/search/components/Facets/Unconnected/ModalFixedRangeFacet';
import {
  AccordionFacetWrapper,
  LeftColumnLayout,
  RightColumnLayout,
  TableRowItem,
  TableView,
  MoreLikeThisEntry,
  MultiCheckboxFacet,
  ModalFacetWrapper,
  FilterAsideLayout,
  TopFilterLayout,
} from '@eeacms/search/components';

import SimpleSearchInput from '@eeacms/search/components/SearchInput/SimpleSearchInput';
import SearchInput from '@eeacms/search/components/SearchInput/SearchInput';
import ListingViewItem from '@eeacms/search/components/Result/ListingViewItem';
import TopFacetList from '@eeacms/search/components/Facets/TopFacetList';
import SecondaryFacetsList from '@eeacms/search/components/Facets/SecondaryFacetsList';
import DefaultFacetsList from '@eeacms/search/components/Facets/DefaultFacetsList';
import CardItem from '@eeacms/search/components/Result/CardItem';
import HorizontalCardItem from '@eeacms/search/components/Result/HorizontalCardItem';
import DefaultContentView from '@eeacms/search/components/SearchView/DefaultContentView';
import FilterAsideContentView from '@eeacms/search/components/SearchView/FilterAsideContentView';
import TilesLandingPage from '@eeacms/search/components/LandingPage/TilesLandingPage';
import DefaultFilterValue from '@eeacms/search/components/FilterList/FilterValue';
import { Item, Card, Menu } from 'semantic-ui-react';
import {
  getTermFilter,
  getRangeFilter,
  getValueFacet,
  getRangeFacet,
  getDateRangeFilter,
  getHistogramFilter,
  getBooleanFilter,
  getBooleanFacet,
  buildTermFacetAggregationRequest,
  buildDateRangeFacetAggregationRequest,
  buildHistogramFacetAggregationRequest,
  buildRangeFacetAggregationRequest,
  buildMLTFilter,
  highlightQueryBuilder,
  buildBooleanFacetRequest,
} from '@eeacms/search/lib/search';
import { ResultModel } from '@eeacms/search/lib/models';
import {
  addQAParams,
  extractAnswers,
} from '@eeacms/search/components/AnswerBox';
import { getActiveFilters } from '@eeacms/search/lib/search/helpers';

const config = {
  resolve: {
    'searchui.Facet': {
      component: MultiCheckboxFacet,

      // the facet aggregation part
      buildRequest: buildTermFacetAggregationRequest,

      // the query filter part
      buildFilter: getTermFilter,

      // get the filter value based on query that was run
      getValue: getValueFacet,
    },
    'searchui.RangeFacet': {
      component: MultiTermFacet,
      buildRequest: buildRangeFacetAggregationRequest,
      buildFilter: getRangeFilter,
      getValue: getRangeFacet,
    },
    FixedRangeFacet: {
      component: FixedRangeFacet,
      buildRequest: buildRangeFacetAggregationRequest,
      buildFilter: getRangeFilter,
      getValue: getRangeFacet,
    },
    DropdownRangeFilter: {
      component: DropdownFixedRangeFilter,
      // wrapper: FilterWrapper,
      buildRequest: buildDateRangeFacetAggregationRequest, //not implemented
      buildFilter: getDateRangeFilter,
      // getValue: getDateRangeFacet,
    },
    ModalFixedRangeFacet: {
      component: ModalFixedRangeFacet,
      buildRequest: buildRangeFacetAggregationRequest,
      buildFilter: getRangeFilter,
      getValue: getRangeFacet,
    },
    BooleanFacet: {
      component: BooleanFacet,
      buildRequest: buildBooleanFacetRequest,
      buildFilter: getBooleanFilter,
      getValue: getBooleanFacet,
    },
    SingleTermFacet: {
      component: SingleTermFacet,
      buildRequest: buildTermFacetAggregationRequest,
      buildFilter: getTermFilter,
      getValue: getValueFacet,
    },
    MultiTermFacet: {
      component: MultiTermFacet,
      buildRequest: buildTermFacetAggregationRequest,
      buildFilter: getTermFilter,
      getValue: getValueFacet,
    },
    MultiTermListFacet: {
      component: MultiTermListFacet,
      buildRequest: buildTermFacetAggregationRequest,
      buildFilter: getTermFilter,
      getValue: getValueFacet,
    },
    HistogramFacet: {
      component: HistogramFacet,
      buildRequest: buildHistogramFacetAggregationRequest,
      buildFilter: getHistogramFilter,
      getValue: getRangeFacet,
    },
    MoreLikeThis: {
      buildFilter: buildMLTFilter, // ('like'),
    },
    LessLikeThis: {
      buildFilter: buildMLTFilter, // ('unlike'),
    },
    'Item.Group': {
      component: Item.Group,
    },
    'Card.Group': {
      component: (props) => (
        <Card.Group {...props} stackable itemsPerRow={4} doubling />
      ),
    },
    VerticalCardsGroup: {
      component: (props) => <Card.Group {...props} stackable itemsPerRow={1} />,
    },
    VerticalMenu: {
      component: (props) => <Menu vertical {...props} />,
    },
    'HorizontalCard.Group': {
      component: (props) => <div {...props} className="listing" />,
    },
    ListingViewItem: {
      component: ListingViewItem,
    },
    CardItem: {
      component: CardItem,
    },
    HorizontalCardItem: {
      component: HorizontalCardItem,
    },
    TableView: {
      component: TableView,
    },
    TableRowItem: {
      component: TableRowItem,
    },
    LeftColumnLayout: {
      component: LeftColumnLayout,
    },
    RightColumnLayout: {
      component: RightColumnLayout,
    },
    MoreLikeThisEntry: {
      component: MoreLikeThisEntry,
    },
    SimpleSearchInput: {
      component: SimpleSearchInput,
    },
    DefaultSearchInput: {
      component: SearchInput,
    },
    'searchui.SearchBox': {
      component: SearchBox,
    },
    AccordionFacetWrapper: {
      component: AccordionFacetWrapper,
    },
    ModalFacetWrapper: {
      component: ModalFacetWrapper,
    },
    VerticalCardsModalFacets: {
      component: TopFacetList,
    },
    FilterAsideLayout: {
      component: FilterAsideLayout,
    },
    TopFilterLayout: {
      component: TopFilterLayout,
    },
    DropdownFilterLayout: {},
    DefaultContentView: {
      component: DefaultContentView,
    },
    FilterAsideContentView: {
      component: FilterAsideContentView,
    },
    TilesLandingPage: {
      component: TilesLandingPage,
    },
    DefaultFacetsList: {
      component: DefaultFacetsList,
    },
    SecondaryFacetsList: {
      component: SecondaryFacetsList,
    },

    DefaultFilterValue: {
      component: DefaultFilterValue,
    },
    DummySUIFacetWrapper: {
      component: ({ view: ViewComponent, ...rest }) => (
        <ViewComponent {...rest} />
      ),
    },

    DropdownFacetWrapper: {
      component: DropdownFacetWrapper,
    },

    ResultModel,
    highlightQueryBuilder,
    defaultGetActiveFilters: getActiveFilters,
  },

  searchui: {
    default: {
      host: 'http://localhost:9200',
      elastic_index: '_all',
      title: 'Search catalogue', // the main search app headline
      headline: '', // main headline
      subheadline: '', // text under the headline
      demoquestion: '', // Question used as example under the search input

      // These are ElasticSearch driver options:
      // debug: true,
      // trackUrlState: false,

      hasA11yNotifications: true,

      // broad global layout (header, side, etc)
      layoutComponent: 'LeftColumnLayout', // The global layout component

      // the SearchBox is a wrapper over the SearcBoxInput component
      searchBoxInputComponent: 'DefaultSearchInput',

      // the "content" layout, everything below the search input
      contentBodyComponent: 'DefaultContentView',

      // disable search phrases for now, maybe it will be enabled in the future
      // but that requires further development
      // useSearchPhrases: true,

      // when entering in search view, this will be the default search text
      defaultSearchText: '',

      showLandingPage: true,
      onlyLandingPage: false,

      // Custom placeholder text for search input
      searchInputPlaceholder: '',

      showPromptQueries: true,
      defaultPromptQueries: [], // offered as possible queries, in a prompt below text input. One per line
      promptQueryInterval: 20000,
      alwaysSearchOnInitialLoad: false, // used in elastic search driver

      showFilters: true, // enables the filters interface, to allow falling back to just a simple results list
      showClusters: true, // enables the tab clusters
      showClusterAsIcons: false, // use icons instead of text in the tab clusters
      showSorting: true, // show the sorting controls
      showFacets: true, // show the facets dropdowns and sidebar facets

      getActiveFilters: 'defaultGetActiveFilters',

      // highlight: {
      //   queryParams: {
      //     fragment_size: 200,
      //     number_of_fragments: 3,
      //   },
      //   fields: ['description'],
      //   queryBuilder: {
      //     factory: 'highlightQueryBuilder',
      //   },
      // },

      facets: [
        //
      ], // interactive filtering components (facets)
      icons: {
        default: {
          // a registry of icons. An icon is like:
          // { name: 'some sui icon identifier', ...extraprops}
          // or: {url: 'http://webpack-resolved-path', ...extraprops}
        },
      },

      resultsPerPage: 10,
      availableResultsPerPage: [10, 25, 50],
      requestBodyModifiers: [addQAParams], // todo: use factory names
      stateModifiers: [extractAnswers], // todo: use factory names

      enableNLP: false, // enables NLP capabilities
      enableChatbotAnswer: false, // enables chatbot-powered AI answers
      chatbotAnswer: {
        personaId: null, // Required: Danswer persona ID
        fallbackToNLP: false, // Fall back to NLP AnswerBox if chatbot fails
        summaryPrompt:
          'You are a search query classifier and summarizer. Respond instantly without additional context.\n\nCLASSIFICATION RULES:\nReturn "NOT_A_QUESTION" for:\n- Single words (e.g., "hello", "water", "test")\n- Greetings or pleasantries\n- Navigation commands (e.g., "go back", "show more")\n- Gibberish or unintelligible input\n- Ambiguous single-term searches\n\nPROVIDE A 3-SENTENCE SUMMARY for:\n- Questions (who, what, when, where, why, how)\n- Multi-word topic searches\n- Data or information requests\n- Specific queries about subjects, concepts, or facts\n\nRESPONSE FORMAT:\n- If uncertain, return "NOT_A_QUESTION"\n- If answerable, provide exactly 3 concise sentences\n- No citations, sources, or disclaimers\n- No preamble or explanation',
        prompt:
          "You are an expert assistant providing detailed answers.\n\nINSTRUCTIONS:\n- Answer the user's question thoroughly and accurately\n- Structure your response with clear paragraphs for readability\n- Include relevant context, background information, and explanations\n- Use specific facts, data points, and examples when applicable\n- Address different aspects or perspectives of the topic if relevant\n- Keep language clear and accessible while maintaining depth\n\nFORMAT:\n- Start directly with the answer (no preamble)\n- Use bullet points or numbered lists for multiple items\n- Bold key terms or concepts for emphasis when helpful\n- Aim for 3-5 paragraphs depending on complexity\n\nCONSTRAINTS:\n- Stay focused on the question asked\n- Never ask clarifying questions or request feedback\n- Do not prompt the user for more information\n- Provide your best answer with the information given\n- If information is uncertain, acknowledge limitations briefly and continue\n- Do not fabricate statistics or sources\n- Do not include sources or references\n- Be as fast as possible",
      },
      nlp: {
        classifyQuestion: {
          servicePath: 'query-classifier',
        },
        qa: {
          servicePath: 'query',
          cutoffScore: 0.5,
        },
        similarity: {
          servicePath: 'similarity',
          cutoffScore: 0.9,
        },
        spacy: {
          servicePath: 'ner-spacy',
        },
        feedback: {
          servicePath: 'feedback',
        },
      },

      enableMatomoTracking: true,

      contentSectionsParams: {
        // This enables the content as section tabs
        enable: false,
        sectionFacetsField: 'objectProvides',
        icons: {
          News: '',
        },
      },

      resultItemModel: {
        // convert a ES hit to a usable result
        factory: 'ResultModel',
        urlField: 'about',
        titleField: 'title',
        metatypeField: 'objectProvides',
        descriptionField: 'description',
        tagsField: 'topic',
        issuedField: 'issued',
        getThumbnailUrl: 'getGlobalsearchThumbUrl',
        getIconUrl: 'getGlobalsearchIconUrl',
        fallbackThumbUrl:
          'https://react.semantic-ui.com/images/wireframe/white-image.png',
      },

      // Deprecated. No need for this, use facets with showInFacetsList: false
      // filters: {
      //   // registration of filter options
      //   // moreLikeThis: {
      //   //   enabled: true,
      //   //   fields: ['title', 'text'],
      //   //   factories: {
      //   //     registryConfig: 'MoreLikeThis',
      //   //     filterList: 'MoreLikeThisEntry',
      //   //   },
      //   // },
      //   // lessLikeThis: {
      //   //   enabled: true,
      //   //   fields: ['title', 'text'],
      //   //   factories: {
      //   //     registryConfig: 'LessLikeThis',
      //   //     filterList: 'FilterResultEntry',
      //   //   },
      //   // },
      // },

      autocomplete: {
        include_searchterm: false,
        hint_min_words: 3,
        results: {
          titleField: 'title',
          urlField: 'id',
          sectionTitle: 'Results',
          linkTarget: '_blank',
        },
        suggestions: {
          didYouMean: {
            sectionTitle: 'Did you mean...',
          },
          faq: {
            sectionTitle: 'Frequently asked questions',
          },
        },

        // {
        //   linkTarget: '_blank',
        //   sectionTitle: 'Results',
        //   titleField: 'title',
        //   urlField: 'id',
        //   shouldTrackClickThrough: true,
        //   clickThroughTags: ['test'],
        // }
      },

      initialView: {
        factory: null, // the "Landing page" component
      },
      noResultView: {
        factory: null, // Component used for "No results" view
      },
      resultViews: [
        {
          id: 'listing',
          title: 'Items',
          icon: null,
          render: null,
          isDefault: true,
          factories: {
            view: 'Item.Group',
            item: 'ListingViewItem',
          },
        },
        {
          id: 'table',
          title: 'Table',
          icon: 'table',
          render: null,
          isDefault: false,
          factories: {
            view: 'TableView',
            item: 'TableRowItem',
          },
        },
      ],

      // parameters for the 'listing' Listing View
      // The config will lookup for `${id}ViewParams` objects
      listingViewParams: {
        enabled: true,
      },

      cardViewParams: {
        enabled: true,
      },

      horizontalCardViewParams: {
        enabled: true,
      },
      tableViewParams: {
        enabled: true,
      },

      sortOptions: [
        // {
        //   name: 'Relevance',
        //   value: '',
        //   direction: '',
        // },
      ],
    },
  },
};

if (typeof window !== 'undefined') {
  window.searchUiConfig = config;
}

export default config;
