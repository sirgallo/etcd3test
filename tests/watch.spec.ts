import { IKeyValue, IWatchResponse } from 'etcd3';

import { WatchProvider } from '@etcdProviders/WatchProvider';
import { QueryProvider } from '@etcdProviders/QueryProvider';
import { TEST_OPTIONS, TEST_PREFIX } from './utils/common';
import { MockData } from './utils/mockData';


let delay = (timeout: number) => new Promise(res => setTimeout(res, timeout))


describe('WatchProvider', () => {
  let watchProvider: WatchProvider;
  let queryProvider: QueryProvider;
  let queryProvForPrefix: QueryProvider;

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
  });

  afterEach(async () => {
    for(const { key, value } of MockData.dummyKeyValList()) {
      await queryProvider.delete(key);
      await queryProvForPrefix.delete(key);
    }
  });

  afterAll(async () => {
    watchProvider.removeAllListeners();
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
    const listener = jest.fn();

    const watcher = await watchProvider.startWatcher({ key });
    watcher.on('put', listener);

    await queryProvider.put(key, 'test value');

    await delay(1000)

    expect(expected).toMatchObject({ 
      key: listener.mock.calls[0][0].key.toString(), 
      value: listener.mock.calls[0][0].value.toString() 
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('track key data changes', async () => {
    const key = MockData.dummyKeyValList()[0].key;
    const expected = { key, value: 'test value again' }
    const listener = jest.fn();

    const watcher = await watchProvider.startWatcher({ key });
    watcher.on('data', listener);

    await queryProvider.put(key, 'test value again');
    await delay(1000)

    expect(expected).toMatchObject({ 
      key: listener.mock.calls[0][0].events[0].kv.key.toString(), 
      value: listener.mock.calls[0][0].events[0].kv.value.toString(), 
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('track key deletion', async () => {
    const key = MockData.dummyKeyValList()[0].key;
    const expected = { key, value: '' }
    const listener = jest.fn();

    const watcher = await watchProvider.startWatcher({ key });
    watcher.on('delete', listener);

    await queryProvider.delete(key);
    await delay(1000)

    expect(expected).toMatchObject({ 
      key: listener.mock.calls[0][0].key.toString(), 
      value: listener.mock.calls[0][0].value.toString() 
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});