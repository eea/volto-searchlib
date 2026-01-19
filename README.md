# volto-searchlib

[![Releases](https://img.shields.io/github/v/release/eea/volto-searchlib)](https://github.com/eea/volto-searchlib/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-searchlib%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-searchlib/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib-master&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib-master)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib-master&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib-master)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib-master&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib-master)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib-master&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib-master)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-searchlib%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-searchlib/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib-develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib-develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib-develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib-develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib-develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib-develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-searchlib-develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-searchlib-develop)

[Volto](https://github.com/plone/volto) add-on

## Features

![Searchlib](https://raw.githubusercontent.com/eea/volto-searchlib/master/docs/volto-searchlib.gif)

### Elasticsearch middleware

You can configure the proxied Elasticsearch with the env var:

`RAZZLE_PROXY_ES_DSN_${appName}`, so for example `RAZZLE_PROXY_ES_DSN_datahub`.

If you use only one ES server, you can simply set `RAZZLE_PROXY_ES_DSN`.

## Getting started

### Try volto-searchlib with Docker

      git clone https://github.com/eea/volto-searchlib.git
      cd volto-searchlib
      make
      make start

Go to http://localhost:3000

### Add volto-searchlib to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

* If you already have a volto project, just update `package.json`:

   ```JSON
   "addons": [
       "@eeacms/volto-searchlib"
   ],

   "dependencies": {
       "@eeacms/volto-searchlib": "*"
   }
   ```

* If not, create one:

   ```
   npm install -g yo @plone/generator-volto
   yo @plone/volto my-volto-project --canary --addon @eeacms/volto-searchlib
   cd my-volto-project
   ```

1. Install new add-ons and restart Volto:

   ```
   yarn
   yarn start
   ```

1. Go to http://localhost:3000

1. Happy editing!

## Release

See [RELEASE.md](https://github.com/eea/volto-searchlib/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-searchlib/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-searchlib/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
