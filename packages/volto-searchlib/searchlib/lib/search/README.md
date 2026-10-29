In this folder you'll find:

- `state` - modules to compose the application state based on response from ES
- `query` - modules to create the request query DSL for ES

There are several cases that we want to cover:

- (query folder) building a "filtering query" that will filter the results.
- (query folder) building an "aggregation query" that will create statistics with the results
  and will bin them into "baskets", to show facets and statistics
- next is
