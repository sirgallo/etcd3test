import { IKeyValue, IWatchResponse } from 'etcd3';


/*
  Watch Opts:
    when initializing a watcher, provider either a specific key to watch, or a prefix
    value to watch a set of keys with the same prefix
*/
export type KeyWatchOpts = { key: string };
export type PrefixWatchOpts = { prefix: string };
export type InitWatchOpts = KeyWatchOpts | PrefixWatchOpts;

/*
  Events:
    strictly type the event listeners and events output by the watch provider
  
    data --> on data changes
    delete --> on key deletion changes (not applicable to prefix)
    put --> on put key changes (not applicable to prefix)
*/
export type WatchEvent = 'data' | 'delete' | 'put';
export type KeyValListener = (keyVal: IKeyValue) => void;
export type WatchRespListener = (watchResp: IWatchResponse) => void;
export type WatchListener = KeyValListener | WatchRespListener;

export const ALLOWED_EVENTS: Record<WatchEvent, WatchEvent> = {
  data: 'data',
  delete: 'delete',
  put: 'put'
};