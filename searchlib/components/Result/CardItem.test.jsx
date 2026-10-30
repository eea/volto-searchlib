import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { DateTime } from 'luxon';
import config from '@plone/volto/registry';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import CardTemplate from '@eeacms/volto-listing-block/blocks/Listing/item-templates/CardTemplate';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { ResultModel } from '@eeacms/search/lib/models';
import CardItem from './CardItem';

jest.mock('@eeacms/search/lib/hocs', () => ({
  useAppConfig: jest.fn(),
}));
jest.mock('@eeacms/search/lib/getRegistry', () => () => ({
  resolve: {
    getThumbnail: (result) => result.preview?.raw,
  },
}));
// the style classes as Volto builds them: `:noprefix` values and the names
// of the `:bool` fields that are on
jest.mock('@plone/volto/helpers/Blocks/Blocks', () => ({
  buildStyleClassNamesFromData: (styles = {}) =>
    Object.entries(styles)
      .filter(([, value]) => value)
      .map(([key, value]) =>
        key.endsWith(':noprefix') ? value : key.replace(/:bool$/, ''),
      ),
}));
jest.mock('@eeacms/volto-listing-block/components/UniversalCard/schema', () =>
  jest.fn(),
);
jest.mock(
  '@eeacms/volto-listing-block/components/UniversalCard/fragments/RenderBlocksWrapper',
  () => () => <div data-testid="popup-content" />,
);
jest.mock(
  '@eeacms/volto-listing-block/default-image.svg',
  () => '/default-image.svg',
);

const mockStore = configureStore([]);
const preview = 'https://www.eea.europa.eu/example/@@images/preview.png';
const appConfig = {
  resultItemModel: {
    getThumbnailUrl: 'getThumbnail',
    descriptionField: 'description',
    tagsField: 'topic',
  },
};

beforeEach(() => {
  config.settings.dateLocale = 'en-gb';
  config.blocks.blocksConfig.listing = {
    extensions: {
      cardTemplates: [{ id: 'card', isDefault: true, template: CardTemplate }],
    },
  };
  config.blocks.blocksConfig.teaser = { renderTag: (tag) => tag };
  useAppConfig.mockReturnValue({
    registry: { resolve: { UniversalCard: { component: UniversalCard } } },
  });
});

const renderResult = (overrides = {}, { highlight, children } = {}) => {
  const result = new ResultModel(
    {
      _id: 'example',
      ...(highlight && { highlight }),
      _source: {
        about: '/en/analysis/maps-and-charts/example',
        title: 'Agricultural land use in Europe',
        objectProvides: 'Figure (chart/map)',
        issued: '2025-06-04T12:00:00Z',
        description: 'Search description',
        topic: ['Agriculture and food'],
        preview,
        ...overrides,
      },
    },
    appConfig,
  );

  return render(
    <Provider
      store={mockStore({
        screen: { width: 1920 },
        vocabularies: {},
        userSession: { token: null },
        search: { subrequests: {} },
      })}
    >
      <MemoryRouter>
        <CardItem result={result}>{children}</CardItem>
      </MemoryRouter>
    </Provider>,
  );
};

it('renders the shared visualization card layout', () => {
  const { container } = renderResult({
    about: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/example',
  });

  expect(
    container.querySelector('.ui.card.u-card.title-max-4-lines.drop-shadow'),
  ).toBeInTheDocument();
  const content = container.querySelector('.content');
  // content type and date in one row above the title, then the preview and
  // the source
  const kinds = ['meta', 'header', 'image', 'card-source'];
  // the source is a `.meta` too: look for the specific classes first
  const lookup = ['card-source', 'meta', 'header', 'image'];
  expect(
    Array.from(content.children).map((el) =>
      lookup.find((kind) => el.classList.contains(kind)),
    ),
  ).toEqual(kinds);
  const meta = content.querySelector(':scope > .meta');
  expect(meta.querySelector('.text-left')).toHaveTextContent(
    'Figure (chart/map)',
  );
  expect(meta.querySelector('.date')).toHaveTextContent('04 Jun 2025');
  // the source stays below, it does not replace the content type
  expect(meta).not.toHaveTextContent('Source');
  expect(content.querySelector('.card-source')).toHaveTextContent(
    'Source: www.eea.europa.eu',
  );
  expect(screen.getByRole('img')).toHaveAttribute('src', preview);
  expect(screen.getByRole('img')).toHaveAttribute(
    'alt',
    'Agricultural land use in Europe',
  );
});

it('shows no description, tags, label or Read more button', () => {
  const { container } = renderResult({
    issued: DateTime.local().minus({ days: 5 }).toISO(),
  });
  expect(screen.queryByText('Search description')).not.toBeInTheDocument();
  expect(container.querySelector('.description')).not.toBeInTheDocument();
  expect(screen.queryByText('Agriculture and food')).not.toBeInTheDocument();
  expect(container.querySelector('.tags')).not.toBeInTheDocument();
  expect(screen.queryByText('New')).not.toBeInTheDocument();
  expect(screen.queryByText('Read more')).not.toBeInTheDocument();
  expect(container.querySelector('.extra.content')).not.toBeInTheDocument();
});

it('shows no Archived label for expired results', () => {
  renderResult({
    issued: DateTime.local().minus({ years: 1 }).toISO(),
    expires: DateTime.local().minus({ days: 1 }).toISO(),
  });
  expect(screen.queryByText('Archived')).not.toBeInTheDocument();
});

it('ignores highlighted excerpts and supplied descriptions', () => {
  renderResult(
    { description: 'Trends in agriculture.' },
    {
      highlight: { description: ['Trends in <em>agriculture</em>.'] },
      children: <span>Custom result description</span>,
    },
  );
  expect(
    screen.queryByText('Custom result description'),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/Trends in/)).not.toBeInTheDocument();
});

it.each([
  '/en/analysis/maps-and-charts/example',
  'https://industry.eea.europa.eu/industrial-emissions/dashboard/example',
])('links the title and the image to the result: %s', (about) => {
  renderResult({ about });

  const links = [
    screen.getByText('Agricultural land use in Europe').closest('a'),
    screen.getByRole('img').closest('a'),
  ];
  links.forEach((link) => {
    expect(link).toHaveAttribute('href', about);
    expect(link).not.toHaveAttribute('target');
    fireEvent.click(link);
  });
  expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();
});

it.each([
  ['a string', 'Dashboard', 'Dashboard'],
  [
    'an array',
    ['Dashboard', 'Map (interactive)'],
    'Dashboard, Map (interactive)',
  ],
  ['an empty array', [], 'Other'],
  ['a missing type', undefined, 'Other'],
])('supports content types supplied as %s', (_, objectProvides, label) => {
  const { container } = renderResult({ objectProvides });
  expect(container.querySelector('.meta .text-left')).toHaveTextContent(label);
});

it.each([undefined, '', 'not-a-date'])(
  'omits an unavailable date: %s',
  (issued) => {
    const { container } = renderResult({ issued });
    expect(container.querySelector('.meta .date')).not.toBeInTheDocument();
    // the content type keeps its row
    expect(container.querySelector('.meta .text-left')).toHaveTextContent(
      'Figure (chart/map)',
    );
  },
);

it.each([
  ['https://www.eea.europa.eu/en/example', 'www.eea.europa.eu'],
  ['https://industry.eea.europa.eu/example', 'industry.eea.europa.eu'],
  ['http://example.org/figure', 'example.org'],
])('shows the linked source website for %s', (about, source) => {
  renderResult({ about });
  const link = screen.getByRole('link', { name: source });
  expect(link).toHaveAttribute('href', about);
  expect(link).toHaveAttribute('target', '_blank');
  // shown with a small font, below the card content
  expect(link.closest('.meta')).toHaveClass('card-source');
  expect(link.closest('.meta')).toHaveTextContent(`Source: ${source}`);
});

it.each([undefined, '', 'https://www.eea.europa.eu/example/portal_depiction'])(
  'uses the shared placeholder for a missing preview: %s',
  (preview) => {
    renderResult({ preview });
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/default-image.svg');
    expect(image.closest('a')).toHaveAttribute(
      'href',
      '/en/analysis/maps-and-charts/example',
    );
  },
);
