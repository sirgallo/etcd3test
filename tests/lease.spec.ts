import { Etcd3, Lease } from 'etcd3';

import { LeaseProvider } from '@etcdProviders/LeaseProvider';
import { TEST_OPTIONS } from './utils/common';


describe('LeaseProvider', () => {
  let leaseProvider: LeaseProvider;
  let client: Etcd3;
  let lease: Lease;

  beforeAll(async () => {
    leaseProvider = new LeaseProvider(TEST_OPTIONS);
    client = new Etcd3(TEST_OPTIONS);
  });

  test('lease lifecycle', async () => {
    const testKey = 'testleasekey';
    
    lease = await leaseProvider.createAssignedLease(testKey, { ttl: 100 });
    
    const actualLease = (await client.get(testKey).exec()).kvs[0].lease;
    const leaseGrant = await lease.grant()

    expect(actualLease).toBe(leaseGrant);
    
    await leaseProvider.revokeLease(lease);
    const val = await client.get(testKey);
    
    expect(val).toBeNull();
  });

  test('renew lease once', async () => {
    const testKey = 'testleasekey';
    
    lease = await leaseProvider.createAssignedLease(testKey, { ttl: 100 });
    const leaseGrant = await lease.grant();

    const { ID, TTL } = await leaseProvider.renewLeaseOnce(lease)
    
    expect({ ID, TTL }).toMatchObject({ ID: leaseGrant, TTL: '100' });
  });

  afterEach(async () => {
    await lease.revoke();
  });
});