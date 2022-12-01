# JADite

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)

## About <a name = "about"></a>

It is a library where you can use JSON files as databases, you can get, save, update or delete the information you want in the collection `property that contains an array in the JSON file` that is in the JSON file `the database`

## Getting Started <a name = "getting_started"></a>

Is easy, you just have to install the library and follow the next steps

### Installing

A step by step series of examples that tell you how to get a development env running.

Say what the step will be

```
$ npm i jadite
```

with yarn

```
$ yarn add jadite
```

with pnpm

```
$ pnpm i jadite
```

## Usage <a name = "usage"></a>

```js
import JADClient from 'jadite'

// the file will be created in this path
const client = new JADClient('./src/data')
// this will be the name of the file. all files ends with .db.json
const db = await client.database('')
// this will be the collection or the table
const products = await db.collection('products')
```

each collection will have the following methods:

- find
- findOne
- insertOne
- insertMany
- updateOne
- updateMany
- deleteOne
- deleteMany
