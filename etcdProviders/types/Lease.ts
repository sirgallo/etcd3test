import { ILeaseOptions } from 'etcd3';


/**
 * @typedef {Object}
 * @property {string} ttl - time to live in seconds for a key
 * @property {ILeaseOptions }opts - etcd3 lease options --> { autoKeepAlive: boolean --> keep key alive indefinitely }
 */
export interface CreateLeaseOptions {
  ttl: number;
  opts?: ILeaseOptions
}