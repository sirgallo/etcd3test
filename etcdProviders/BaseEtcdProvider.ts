import { EventEmitter } from 'events';
import { Etcd3, IOptions } from 'etcd3';

import { LogProvider } from '@core/providers/LogProvider';
import { ClientProvider} from '@etcdProviders/ClientProvider';


/*
  Base Etcd Provider:
    initialze the etcd client and the log provider for each etcd provider
*/
export class BaseEtcdProvider extends EventEmitter {
  protected client: Etcd3;
  protected zLog: LogProvider;

  constructor(protected name: string, clientOpts?: IOptions) {
    super();
    
    this.client = ClientProvider.getInstance(clientOpts);
    this.zLog = new LogProvider(this.name);
  }
}