import { Lease, IOptions, ILeaseKeepAliveResponse } from 'etcd3';

import { BaseEtcdProvider } from '@etcdProviders/BaseEtcdProvider';
import { CreateLeaseOptions } from '@etcdProviders/types/Lease';


const NAME = 'Lease Provider';


/**
 * Lease Provider
 * 
 * leases in etcd are essentially a way to provide a lifecycle and expiration for keys stored in etcd
 * 
 * @class
 */
export class LeaseProvider extends BaseEtcdProvider {
  constructor(clientOpts?: IOptions) {
    super(NAME, clientOpts);
  }

  /**
   * associate Assigned Lease:
   *  associates a new lease with a specific existing key
   * 
   * @param {string} existingKey - a key from an existing key-value pair to assign a lease to
   * @param {CreateLeaseOptions} opts - includes time to live and optional keepAlive
   * @returns {Promise<Lease>} - the Lease object returned from etcd on creation
   */
  async createAssignedLease(existingKey: string, opts: CreateLeaseOptions): Promise<Lease> {
    const lease = this.createLease(opts);
    await lease.put(existingKey).exec()

    return lease;
  }

  /**
   * renew Lease Once:
   *  renews a lease one time
   * 
   * @param {Lease} lease - the lease object to keep alive
   * @returns {Promise<ILeaseKeepAliveResponse>}
   */
  async renewLeaseOnce(lease: Lease): Promise<ILeaseKeepAliveResponse> {
    return lease.keepaliveOnce();
  }

  /**
   * revoke Lease:
   *  revokes a lease, essentially terminating the lease from etcd cluster. This will
   *  also evict any keys associated with the lease
   * 
   * @param {Lease} lease - the lease object to revoke
   * @returns {Promise<boolean>}
   */
  async revokeLease(lease: Lease): Promise<boolean> {
    await lease.revoke();
    return true;
  }
  
  /**
   * create Lease:
   *  creates a new lease, with the provided time to live and any additional options
   * 
   * @param {CreateLeaseOptions} opts - ttl and optional keepAlive
   * @returns {Lease} - the newly created Lease object
   */
  private createLease(opts: CreateLeaseOptions): Lease {
    return this.client.lease(opts.ttl, opts.opts);
  }
}