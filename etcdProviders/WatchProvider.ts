import { IOptions, Watcher, IWatchResponse, IKeyValue } from 'etcd3';

import { BaseEtcdProvider } from '@etcdProviders/BaseEtcdProvider';
import { 
  InitWatchOpts, KeyWatchOpts, WatchEvent, ALLOWED_EVENTS,
  WatchListener, KeyValListener, WatchRespListener 
} from '@etcdProviders/types/Watch';
import { LeaseProvider } from '@etcdProviders/LeaseProvider';
import { CreateLeaseOptions } from '@etcdProviders/types/Lease';


const NAME = 'Watch Provider';


/**
 * Watch Provider
 * 
 * watchers provide a way to subscribe to either a key or a prefix for a range of keys
 * on changes, a watcher will emit events associated with the action taken on the key
 * 
 * @class
 */
export class WatchProvider extends BaseEtcdProvider {
  constructor(private clientOpts?: IOptions) {
    super(NAME, clientOpts);
  }

  /**
   * strictly typed event listener, where the callback can be implemented by any method that utilizes the 
   * Watch Provider
   *
   * @param {WatchEvent} event - the event to listen to (data, put, or delete)
   * @param {Function} listener - a callback to be triggered by the listener on new events
   * @returns {this}
   */
  on(event: WatchEvent, listener: WatchListener): this {
    if (event === 'data') return super.on(event, listener as WatchRespListener);
    return super.on(event, listener as KeyValListener);
  }

  /**
   * emit Event: strictly typed event emitter for key mutation operations
   *
   * @param {WatchEvent} event - the event to emit (data, put, or delete) 
   * @param {IWatchResponse | IKeyValue} data - responses from etcd watcher events
   * @returns {boolean}
   */
  private emitMutatedKeyEvent(event: WatchEvent, data: IWatchResponse | IKeyValue): boolean {
    return super.emit(event, data);
  }

  /**
   * start Watcher:
   * creates a new watcher for the specified key or prefix
   *
   * data, put, and delete events are passed through so that any method that utilizes the Watcher Provider
   * can implement how these events are handled
   *
   * @param {InitWatchOpts} opts - either the key or prefix to create the watcher with
   * @returns {Promise<Watcher>} - the watcher object
   */
  async startWatcher(opts: InitWatchOpts): Promise<Watcher> {
    const watcher = await (async (): Promise<Watcher> => {
      if ('prefix' in opts) return this.client.watch().prefix(opts.prefix).create();
      else return this.client.watch().key(opts.key).create();
    })();
    
    watcher.on('connected', () => this.zLog.info(`watcher successfully connected`));
    watcher.on('disconnected', () => this.zLog.info(`watcher disconnected`));
    watcher.on('error', err => this.zLog.error(`error on watcher: ${err.message}`));

    watcher.on('data', data => this.emitMutatedKeyEvent(ALLOWED_EVENTS.data, data as IWatchResponse));
    watcher.on('delete', res => this.emitMutatedKeyEvent(ALLOWED_EVENTS.delete, res as IKeyValue));
    watcher.on('put', res => this.emitMutatedKeyEvent(ALLOWED_EVENTS.put, res as IKeyValue));

    return watcher;
  }

  /**
   * start Watcher For Lease:
   *  creates a new watcher for a key that has a lease associated with it
   *
   *  if this is implemented, it is recommended to implement the delete event, since the delete event is associated
   *  with the lease expiring. When a lease expires in etcd, the associated key is removed from etcd. Creating a watcher
   *  for a leased key can be useful for when you want to trigger some sort of operation once a lease has finished.
   *
   * @param {KeyWatchOpts} watchOpts - for leases, only watch on keys and not prefixes
   * @param {leaseOpts} leaseOpts - the ttl and whether or not to keepAlive
   * @returns {Promise<Watcher>} - the etcd watcher object
   */
  async startWatcherForLease(watchOpts: KeyWatchOpts, leaseOpts: CreateLeaseOptions): Promise<Watcher> {
    const leaseProv = new LeaseProvider(this?.clientOpts);
    await leaseProv.createAssignedLease(watchOpts.key, leaseOpts);

    return this.startWatcher(watchOpts);
  }
}