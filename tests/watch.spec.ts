import { Watcher, IKeyValue, IWatchResponse } from 'etcd3';

import { WatchProvider } from '@etcdProviders/WatchProvider';
import { QueryProvider } from '@etcdProviders/QueryProvider';
import { TEST_OPTIONS, TEST_PREFIX } from './utils/common';
import { MockData } from './utils/mockData';
import { onceEvent } from 'etcd3/lib/util';
import { WatchEvent } from '@etcdProviders/types/Watch';


describe('WatchProvider', () => {
  let watchProvider: WatchProvider;
  let queryProvider: QueryProvider;
  let queryProvForPrefix: QueryProvider;
  let key: string;
  let watcher: Watcher;

  const expectWatching = async (key: string, val: string, event: WatchEvent, qProv: QueryProvider) => {
    const qProvPromise = (() => {
      if (event === 'put' || event === 'data') return qProv.put(key, val);
      return qProv.delete(key);
    })();

    return Promise.all([
      qProvPromise,
      onceEvent(watchProvider, event).then((res: IWatchResponse | IKeyValue) => {
        switch (event) {
          case 'data': 
            const watchResp = res as IWatchResponse;
            const incomingKey = watchResp.events[0].kv.key.toString();
            const incomingValue = watchResp.events[0].kv.value.toString();
            console.log('incoming key:', incomingKey, 'incoming value:', incomingValue);

            expect(incomingKey).toBe(key);
            expect(incomingValue).toBe(val);
          default:
            const kvResp = res as IKeyValue;
            expect(kvResp.key.toString()).toBe(key);
            expect(kvResp.value.toString()).toBe(val);
        }
      })
    ]);
  }

  beforeAll(async () => {
    watchProvider = new WatchProvider(TEST_OPTIONS);
    queryProvider = new QueryProvider({ clientOpts: TEST_OPTIONS });
    queryProvForPrefix = new QueryProvider({ clientOpts: TEST_OPTIONS, prefix: TEST_PREFIX });
  })

  beforeEach(async () => {
    for(const { key, value } of MockData.dummyKeyValList()) {
      await queryProvider.put(key, value);
      await queryProvForPrefix.put(key, value);
    }

    key = MockData.dummyKeyValList()[0].key;
    watcher = await watchProvider.startWatcher({ key });
  });

  afterEach(async () => {
    for(const { key, value } of MockData.dummyKeyValList()) {
      await queryProvider.delete(key);
      await queryProvForPrefix.delete(key);
    }

    await watcher.cancel();
    watchProvider.removeAllListeners();
  });

  it('create instance of watch provider', () => {
    expect(watchProvider).toBeInstanceOf(WatchProvider);
  });

  it('test watch key update', async () => {
    await expectWatching(key, 'update1', 'put', queryProvider);
  });

  it('test watch key data changes', async () => {
    await expectWatching(key, 'update2', 'data', queryProvider);
  });

  it('test watch key deletion', async () => {
    await expectWatching(key, '', 'delete', queryProvider);
  });
});