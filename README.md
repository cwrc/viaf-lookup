![Picture](http://cwrc.ca/logos/CWRC_logos_2016_versions/CWRCLogo-Horz-FullColour.png)

[![Travis](https://img.shields.io/travis/cwrc/viaf-entity-lookup.svg)](https://travis-ci.org/cwrc/viaf-entity-lookup)
[![version](https://img.shields.io/npm/v/viaf-entity-lookup.svg)](http://npm.im/viaf-entity-lookup)
[![downloads](https://img.shields.io/npm/dm/viaf-entity-lookup.svg)](http://npm-stat.com/charts.html?package=viaf-entity-lookup&from=2015-08-01)
[![GPL-2.0](https://img.shields.io/npm/l/viaf-entity-lookup.svg)](http://opensource.org/licenses/GPL-2.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# viaf-entity-lookup

1. [Overview](#overview)
1. [Installation](#installation)
1. [Use](#use)
1. [API](#api)
1. [Development](#development)

### Overview

Finds entities (people, places, organizations) in VIAF.  Meant to be used with [cwrc-public-entity-dialogs](https://github.com/cwrc-public-entity-dialogs)

### Installation

npm i viaf-entity-lookup -S

### Use

let viafLookup = require('viaf-entity-lookup');

### API

###### findPerson(query)

###### findPlace(query)

###### findOrganization(query)


where the 'query' argument is an object:

```
{
    entity:  The name of the thing the user wants to find.
    options: TBD
}
```

and all the methods return promises that resolve to the following object:

```
{
    name: a string - the name of the entity to display,
    uri: uri to be used as the Linked Data URI for the entity,
    id: same as uri
}
```

### Development

See [CWRC-Writer-Dev-Docs](https://github.com/jchartrand/CWRC-Writer-Dev-Docs) for extensive information about developing with CWRC-Writer GitHub repositories, including this one.

