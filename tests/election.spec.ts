import { ElectionProvider } from '@etcdProviders/ElectionProvider';
import { TEST_OPTIONS, TEST_PREFIX } from './utils/common';


describe('ElectionProvider', () => {
  let electionProvider: ElectionProvider;

  beforeAll(async () => {
    electionProvider = new ElectionProvider('testelection', TEST_OPTIONS);
  });
});