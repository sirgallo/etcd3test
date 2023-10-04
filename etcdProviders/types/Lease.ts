import { ILeaseOptions } from 'etcd3';


/*
  Create Lease Options:
    ttl: time to live in seconds for a key
    opts: etcd3 lease options --> {
      autoKeepAlive: boolean --> keep key alive indefinitely
    }
*/
export interface CreateLeaseOptions {
  ttl: number;
  opts: ILeaseOptions
}