import { QueryProvider } from '@etcdProviders/QueryProvider';
import { TEST_OPTIONS, TEST_PREFIX } from './utils/common';
import { MockData } from './utils/mockData';


describe('WatchProvider', () => {
  let queryProvider: QueryProvider;
  let queryProvForPrefix: QueryProvider;

  beforeAll(async () => {
    queryProvider = new QueryProvider({ clientOpts: TEST_OPTIONS });
    queryProvForPrefix = new QueryProvider({ clientOpts: TEST_OPTIONS, prefix: TEST_PREFIX });
  });

  beforeEach(async () => {
    for(const { key, value } of MockData.dummyKeyValList()) {
      await queryProvider.put(key, value);
      await queryProvForPrefix.put(key, value);
    }
  })

  afterEach(async () => {
    for(const { key, value } of MockData.dummyKeyValList()) {
      await queryProvider.delete(key);
      await queryProvForPrefix.delete(key);
    }

    const testKey = 'key4';
    await queryProvider.delete(testKey);
    await queryProvForPrefix.delete(testKey);
  });

  test('instance of query provider', () => {
    expect(queryProvider).toBeInstanceOf(QueryProvider);
    expect(queryProvForPrefix).toBeInstanceOf(QueryProvider);
  });

  test('get key', async () => {
    const { key, value } = MockData.dummyKeyValList()[0];
    const receivedValue = await queryProvider.get(key);

    expect(receivedValue).toBe(value);
  });

  test('put key', async () => {
    const key = 'key4';
    const value = 'value4';
    
    await queryProvider.put(key, value);
    const receivedValue = await queryProvider.get(key);

    expect(receivedValue).toBe(value);
  });

  test('delete key', async () => {
    const key = 'key4';
    
    await queryProvider.delete(key);
    const receivedValue = await queryProvider.get(key);

    expect(receivedValue).toBeNull();
  });

  test('get key with prefix', async () => {
    const { key, value } = MockData.dummyKeyValList()[0];
    const receivedValue = await queryProvForPrefix.get(key);

    expect(receivedValue).toBe(value);
  });

  test('get all keys for prefix', async () => {
    const keyValMap = await queryProvForPrefix.getAllForPrefix();

    let index = 0;
    for (const key of Object.keys(keyValMap)) {
      expect(keyValMap[key]).toBe(MockData.dummyKeyValList()[index].value);
      index++;
    }
  });

  test('put key with prefix', async () => {
    const key = 'key4';
    const value = 'value4';
    
    await queryProvForPrefix.put(key, value);
    const receivedValue = await queryProvForPrefix.get(key);

    expect(receivedValue).toBe(value);
  });

  test('delete key with prefix', async () => {
    const key = 'key4';
    
    await queryProvForPrefix.delete(key);
    const receivedValue = await queryProvForPrefix.get(key);

    expect(receivedValue).toBeNull();
  });
});