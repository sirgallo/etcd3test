import { ElectionProvider } from '@etcdProviders/ElectionProvider';
import { ALLOWED_EVENTS } from '@etcdProviders/types/Election';
import { TEST_OPTIONS, TEST_PREFIX } from './utils/common';
import { onceEvent } from 'etcd3/lib/util';

describe('ElectionProvider', () => {
  let electionProvider1: ElectionProvider;
  let electionProvider2: ElectionProvider;
  let electionProvider3: ElectionProvider;

  beforeEach(async () => {
    electionProvider1 = new ElectionProvider('testelection', TEST_OPTIONS);
    electionProvider2 = new ElectionProvider('testelection', TEST_OPTIONS);
    electionProvider3 = new ElectionProvider('testelection', TEST_OPTIONS);
  });

  it('elect single leader', async () => {
    electionProvider1.start();

    const promoted: boolean = await onceEvent(electionProvider2, ALLOWED_EVENTS.promoted)
    expect(promoted).toBe(true)
  });

  it('elect single leader from many')
});