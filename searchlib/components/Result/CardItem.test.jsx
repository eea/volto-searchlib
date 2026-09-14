import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Label } from 'semantic-ui-react';
import { DateTime } from 'luxon';
import config from '@plone/volto/registry';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import VisualizationCard from '@eeacms/volto-listing-block/blocks/Listing/item-templates/VisualizationCard';
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
jest.mock('@plone/volto/helpers/Blocks/Blocks', () => ({
  buildStyleClassNamesFromData: () => [],
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
      cardTemplates: [{ id: 'visualizationCard', template: VisualizationCard }],
    },
  };
  config.blocks.blocksConfig.teaser = {
    renderTag: (tag, index) => <Label key={index}>{tag}</Label>,
  };
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
    <Provider store={mockStore({ screen: { width: 1920 }, vocabularies: {} })}>
      <CardItem result={result}>{children}</CardItem>
    </Provider>,
  );
};

it('renders the shared visualization card with search metadata and preview', () => {
  const { container } = renderResult();

  expect(
    container.querySelector('.ui.card.u-card.title-max-4-lines'),
  ).toBeInTheDocument();
  expect(screen.getByText('Figure (chart/map)')).toHaveClass('content-type');
  expect(screen.getByText('04 Jun 2025').closest('time')).toHaveAttribute(
    'datetime',
    expect.stringMatching(/^2025-06-04T/),
  );
  expect(screen.getByRole('img')).toHaveAttribute('src', preview);
  expect(screen.getByRole('img')).toHaveAttribute(
    'alt',
    'Agricultural land use in Europe',
  );
  expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
  expect(screen.getByText('Search description')).toBeInTheDocument();
  expect(screen.getByText('Agriculture and food')).toBeInTheDocument();
  expect(container.querySelector('.card-item')).not.toBeInTheDocument();
});

it.each([
  '/en/analysis/maps-and-charts/example',
  'https://industry.eea.europa.eu/industrial-emissions/dashboard/example',
])('uses the same destination for title, image and CTA: %s', (about) => {
  renderResult({ about });

  const links = [
    screen.getByText('Agricultural land use in Europe').closest('a'),
    screen.getByRole('img').closest('a'),
    screen.getByRole('link', { name: 'Read more' }),
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
  renderResult({ objectProvides });
  expect(screen.getByText(label)).toHaveClass('content-type');
});

it.each([undefined, '', 'not-a-date'])(
  'omits an unavailable date: %s',
  (issued) => {
    const { container } = renderResult({ issued });
    expect(container.querySelector('time')).not.toBeInTheDocument();
    expect(container.querySelector('.publishing-date')).not.toBeInTheDocument();
  },
);

it.each([
  ['https://www.eea.europa.eu/en/example', 'www.eea.europa.eu'],
  ['https://industry.eea.europa.eu/example', 'industry.eea.europa.eu'],
  ['http://example.org/figure', 'example.org'],
])('retains the linked source website for %s', (about, source) => {
  renderResult({ about });
  const link = screen.getByRole('link', { name: source });
  expect(link).toHaveAttribute('href', about);
  expect(link).toHaveAttribute('target', '_blank');
  expect(link.parentElement).toHaveTextContent(`Source: ${source}`);
});

it.each([
  ['Agriculture and food'],
  [['Agriculture and food', 'Water', 'Pollution']],
])('retains all topic tags: %s', (topic) => {
  const { container } = renderResult({ topic });
  const expected = Array.isArray(topic) ? topic : [topic];
  expect(
    Array.from(container.querySelectorAll('.tags.labels > .label')).map(
      (tag) => tag.textContent,
    ),
  ).toEqual(expected);
});

it.each([undefined, []])('omits unavailable topics: %s', (topic) => {
  const { container } = renderResult({ topic });
  expect(container.querySelector('.tags.labels')).not.toBeInTheDocument();
});

it('retains the original description excerpt and text normalization', () => {
  const description = 'Agricultural land use across Europe. '.repeat(12);
  renderResult({ description: `<p>${description}</p>` });
  expect(screen.getByText(`${description.slice(0, 250)}…`)).toBeInTheDocument();
});

it('retains highlighted search excerpts', () => {
  const { container } = renderResult(
    {},
    { highlight: { description: ['Trends in <em>agriculture</em>.'] } },
  );
  expect(container.querySelector('.description em')).toHaveTextContent(
    'agriculture',
  );
  expect(screen.queryByText('Search description')).not.toBeInTheDocument();
});

it('retains a supplied result description', () => {
  renderResult({}, { children: <span>Custom result description</span> });
  expect(screen.getByText('Custom result description')).toBeInTheDocument();
  expect(screen.queryByText('Search description')).not.toBeInTheDocument();
});

it('marks recently published results as New', () => {
  renderResult({ issued: DateTime.local().minus({ days: 5 }).toISO() });
  expect(screen.getByText('New')).toHaveClass('label');
});

it('marks expired results as Archived', () => {
  renderResult({
    issued: DateTime.local().minus({ years: 1 }).toISO(),
    expires: DateTime.local().minus({ days: 1 }).toISO(),
  });
  expect(screen.getByText('Archived')).toHaveClass('label');
});

it('does not mark undated or current older results as New or Archived', () => {
  renderResult({ issued: undefined });
  expect(screen.queryByText('New')).not.toBeInTheDocument();
  expect(screen.queryByText('Archived')).not.toBeInTheDocument();
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
