# @eeacms/volto-searchlib

[![Releases](https://img.shields.io/github/v/release/eea/volto-searchlib)](https://github.com/eea/volto-searchlib/releases)
[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-searchlib%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-searchlib/job/master/display/redirect)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib)

[Volto](https://github.com/plone/volto) add-on

## Features

![Searchlib](https://raw.githubusercontent.com/eea/volto-searchlib/master/docs/volto-searchlib.gif)

### Elasticsearch middleware

You can configure the proxied Elasticsearch with the env var:

`PROXY_ES_DSN_${appName}`, so for example `PROXY_ES_DSN_datahub`.

If you use only one ES server, you can simply set `PROXY_ES_DSN`.

#### Upgrading from 4.x to 5.x

The `RAZZLE_` prefix has been removed from the Elasticsearch middleware environment variables. Update your deployment configuration:

- `RAZZLE_PROXY_ES_DSN` → `PROXY_ES_DSN`
- `RAZZLE_PROXY_ES_DSN_${appName}` → `PROXY_ES_DSN_${appName}`

### Query intent service middleware

When AI summaries are enabled on a search block, the frontend asks a
query-intent classifier service whether a search term warrants an AI
summary before any LLM call. The browser only ever calls the same-origin
proxy paths `POST /_qi/classify` and `GET /_qi/health`;
the middleware forwards them to the service configured with the env var:

- `QUERY_INTENT_SERVICE_URL` — the service **origin only**
  (e.g. `http://eea-query-intent:8100`). The middleware appends
  `/v1/classify` and `/health` itself, so a value with a path prefix
  will not work. When unset, `/_qi/classify` returns 503 and the
  search page works normally without AI summaries (fail closed).
- `QUERY_INTENT_TIMEOUT_MS` — optional upstream request timeout in
  milliseconds (default `2000`); invalid values fall back to the
  default. The browser client gives up after 2000 ms regardless.

Note: the `/_qi/*` proxy routes only exist in the SSR Node process
(`src/index.js`, `__SERVER__` block). A static export has no proxy, so
the AI summary fails closed on such deployments. Upstream error details
stay in the server log; the browser only receives fixed error messages.

### AI Summary analytics

With `enableMatomoTracking` enabled, AI Summary uses `trackEvent` from
`@eeacms/volto-matomo/utils` with category **Search - AI summary**:

| Action | When counted |
| --- | --- |
| `Summary enabled` / `Summary disabled` | Explicit in-box button activation, not preference synchronization |
| `Response copied` | Clipboard write succeeds |
| `Sources opened` | The cited-document area is expanded, not collapsed |
| `Source clicked` | A cited-document link is activated |
| `"Continue conversation" clicked` | The continuation link is activated (primary or middle button), not destination-page load |
| `Summary displayed` | Completed, fully rendered answer enters the viewport |
| `Disabled box displayed` | Disabled explanation enters the viewport after a search completes |
| `Disclaimer opened` | The AI disclosure dialog is opened |

A view requires at least 1% of the respective content to intersect the viewport.
Each summary/disabled state is counted once per completed search, not on rerenders,
scrolling back into view, or toggling the same state again. Browsers without
`IntersectionObserver` omit view events rather than treating renders as views.
Exposure events supply denominators for feature-usage analysis; raw click/view
ratios are not unique-user percentages. Use Matomo visitor/visit reporting for
people-based percentages, accounting for consent and tracking opt-out.

The added event fields do not include queries, answer text, document URLs, or
message IDs. Matomo's standard page URL/title context and existing site-search
tracking are unchanged. Existing feedback analytics is unchanged. The full chatbot retains its own
Chatbot/persona categories, separate from this summary context. No manual outlink
tracking is added alongside Matomo's existing automatic link tracking.

## Upgrade

### Upgrading from 7.x to 8.x

> This version requires `Volto 18` or `Volto 19` and Node.js 22.

No API change: the extension points, the facet widget ids, the templates and the stored block data are
the same as 7.x, so an upgrade renders the same search app. The release adds Volto 19 support and
moves the repository to the Volto 19 layout, where the published package lives in
`packages/volto-searchlib`, with the library next to it in `packages/volto-searchlib/searchlib`.

#### Fixes

- `Icon` and `SearchInput` render images through Volto's `@plone/volto/components/theme/Image`
  instead of the Semantic UI `Image`, so Volto's image handling applies to repository icons and to
  the search input. `MoreLikeThisEntry` keeps the Semantic UI `Image`, because its thumbnail is a
  link: Volto's `Image` renders an `<img>` and would drop the `as`/`href` wrapper.
- The Elasticsearch middleware always answers the client. When the upstream call comes back without a
  response, it now returns `502` with an error body instead of leaving the request open until it
  times out.

#### Breaking changes

- **Node.js 22 or newer is required** (`engines.node >= 22`), 7.x declared no engine.
- **React 18 is required.** The package declares `react` and `react-dom` as `^18.2.0` peers, 7.x
  declared no peers.
- **The package no longer ships the repository tooling.** The Cypress specs and the Jest setup are
  gone and the unit tests moved to Vitest next to the add-on, so nothing a site imports was removed.

### Upgrading from 6.x to 7.x

The cards of the search results now use the `UniversalCard` of
[volto-listing-block](https://github.com/eea/volto-listing-block) 11.x, the
same card as the Grid layout of the Listing block. The results look like the
listing cards: the content type and the date in one row above the title, then
the preview image and the source of the result below.

#### What changed

- `CardItem` renders a `UniversalCard` with a fixed card model (`@type: card`)
  instead of its own Semantic UI card:
  - the elements order puts the content type and the date above the title and
    the preview image below it;
  - `headTitleBelow` shows the source ("Source: <domain>") below the content,
    instead of in the metadata row;
  - the title is limited to 4 lines and the card has a drop shadow;
  - the description (highlights), the tags, the call to action and the
    New / Archived labels are not shown anymore.
- The `Card.Group` of the card view is wrapped in a `div.cardsVisualization`,
  so the results grid gets the styles of the listing cards.
- `CardItem` reads the result model (`href`, `title`, `metaTypes`, `issued`,
  `hasImage`, `thumbUrl`). The `urlField` and `metatypeField` props and
  `cardViewParams.getThumbnailUrl` are not used by the card anymore: the
  thumbnail comes from `resultItemModel.getThumbnailUrl`. Results without an
  image get the placeholder of the listing cards.
- The card does not render the `.card-item` class anymore.

#### How to upgrade

1. Update the add-ons in your project's `package.json` and run `yarn`. The
   cards need `@eeacms/volto-listing-block` 11.x:

   ```JSON
   "dependencies": {
       "@eeacms/volto-searchlib": "^7.0.0",
       "@eeacms/volto-listing-block": "^11.0.0"
   }
   ```

   volto-searchlib depends on `@eeacms/volto-listing-block` `^11.0.0` and
   loads it as an add-on.

2. Register the `UniversalCard` in the search app registry, as
   [volto-globalsearch](https://github.com/eea/volto-globalsearch) does. The
   horizontal cards already needed it, now the card view needs it too:

   ```js
   import { UniversalCard } from '@eeacms/volto-listing-block';

   config.resolve.UniversalCard = { component: UniversalCard };
   ```

3. If your app sets `cardViewParams.getThumbnailUrl`, move it to
   `resultItemModel.getThumbnailUrl`.

4. Update the CSS customizations that target `.card-item` (e.g.
   `.ui.card.card-item`), they don't match the new cards. Style the listing
   cards inside `.cardsVisualization` instead.

5. Check the search pages in the card view: the content type, the date, the
   preview image and the source of the results.

## Requirements

### Backend

- [Plone](https://plone.org/download)
- [plone.restapi](https://pypi.org/project/plone.restapi/)

### Frontend

- Node.js: `>=22.0.0`

## Installation

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

* If you already have a volto project, just update `package.json`:

   ```JSON
   "dependencies": {
       "@eeacms/volto-searchlib": "*"
   }
   ```

   and `volto.config.js`:

   ```JavaScript
   const addons = ['@eeacms/volto-searchlib'];
   ```

* If not, create one with Cookieplone, as recommended by the official Plone documentation for Volto 18+:

   ```
   uvx cookieplone project
   cd project-title
   ```

1. Install or update dependencies, then start the project:

   ```
   make install
   ```

   For a Cookieplone project, start the backend and frontend in separate terminals:

   ```
   make backend-start
   make frontend-start
   ```

1. Go to http://localhost:3000

1. Happy editing!

## License

See [LICENSE.md](LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
