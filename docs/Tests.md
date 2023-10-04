# Tests


## Test Suite
  
  - jest
  - ts-jest


## Before running tests

In test, a `docker-compose` exists that will create a standalone etcd3 node. Ensure that no other services are using port `2379` on your system, and then start the test node using the following, in [@root](../):

```bash
docker-compose -f ./tests/etcd3/docker-compose.etcd3standalone.yml up --build
```

to stop the service once complete:

```bash
docker-compose -f ./tests/etcd3/docker-compose.etcd3standalone.yml down
```


## To run the tests

In the `root` of the folder (once an `npm install` or `npm ci` is performed):

`1.) build the project`
```bash
npm run build:all
```

`2.) run the tests`
```bash
npm run test
```

The scripts are defined in the `package.json` at the root of the folder.


tests can be run individually as well, again, from the root of the project:
```bash
npm run test tests/<test-to-run>.spec.ts
```


## Mock Data

[mock data](../tests/utils/mockData.ts)

just a set of key-value pairs to insert/delete/get from etcd.


## Issues

1.) needed a work around for path aliases
2.) needed a work around for es modules (jest normally is using commonJs)

Fix: update the `jest.config.cjs` with following:

```js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/'}),
};
```