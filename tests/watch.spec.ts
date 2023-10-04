import { Watcher } from 'etcd3';

import { WatchProvider } from '@etcdProviders/WatchProvider';
import { QueryProvider } from '@etcdProviders/QueryProvider';
import { TEST_OPTIONS, TEST_PREFIX } from './utils/common';
import { MockData } from './utils/mockData';


const delay = (timeout: number) => new Promise(res => setTimeout(res, timeout))

describe('WatchProvider', () => {
  let watchProvider: WatchProvider;
  let queryProvider: QueryProvider;
  let queryProvForPrefix: QueryProvider;
  let watcher: Watcher;
  let listener: jest.Mock<any, any, any>;
  let events = {};

  beforeAll(async () => {
    watchProvider = new WatchProvider(TEST_OPTIONS);
    queryProvider = new QueryProvider({ clientOpts: TEST_OPTIONS });
    queryProvForPrefix = new QueryProvider({ clientOpts: TEST_OPTIONS, prefix: TEST_PREFIX });
  });

  beforeEach(async () => {
    for(const { key, value } of MockData.dummyKeyValList()) {
      await queryProvider.put(key, value);
      await queryProvForPrefix.put(key, value);
    }

    const key = MockData.dummyKeyValList()[0].key;
    watcher = await watchProvider.startWatcher({ key });
    listener = jest.fn((event, callback) => {
      events[event] = callback;
    });
  });

  afterEach(async () => {
    for(const { key, value } of MockData.dummyKeyValList()) {
      await queryProvider.delete(key);
      await queryProvForPrefix.delete(key);
    }
    
    watcher.cancel()
    watchProvider.removeAllListeners();
    listener.mockReset();
  });

  it('create instance of watch provider', () => {
    expect(watchProvider).toBeInstanceOf(WatchProvider);
  });

  it('start watcher', async () => {
    const key = MockData.dummyKeyValList()[0].key;
    await watchProvider.startWatcher({ key });
  });

  it('track key update', async () => {
    const key = MockData.dummyKeyValList()[0].key;
    const expected = { key, value: 'test value' }
    watchProvider.on('put', listener);

    await delay(2000);
    await queryProvider.put(key, 'test value');

    console.log('listener mock calls,', listener.mock.calls)

    expect(expected).toMatchObject({ 
      key: listener.mock.calls[0][0].key.toString(), 
      value: listener.mock.calls[0][0].value.toString() 
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('track key data changes', async () => {
    const key = MockData.dummyKeyValList()[0].key;
    const expected = { key, value: 'test value again' }

    watchProvider.on('data', listener);

    await delay(2000);
    await queryProvider.put(key, 'test value again');

    console.log('listener mock calls,', listener.mock.calls)

    expect(expected).toMatchObject({ 
      key: listener.mock.calls[0][0].events[0].kv.key.toString(), 
      value: listener.mock.calls[0][0].events[0].kv.value.toString(), 
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('track key deletion', async () => {
    const key = MockData.dummyKeyValList()[0].key;
    const expected = { key, value: '' }

    watchProvider.on('delete', listener);

    await delay(2000);
    await queryProvider.delete(key);

    console.log('listener mock calls,', listener.mock.calls)

    expect(expected).toMatchObject({ 
      key: listener.mock.calls[0][0].key.toString(), 
      value: listener.mock.calls[0][0].value.toString() 
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});