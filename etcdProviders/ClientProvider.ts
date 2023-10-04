import { Etcd3, IOptions } from 'etcd3';

import { LogProvider } from '@core/providers/LogProvider';
import { DEFAULT_OPTS } from '@etcdProviders/types/Common';


const NAME = 'Client Provider';


/**
 * Client Provider:
 *  instantiate a single client for each service, which reduces the number of connections to the etcd cluster
 *  
 * @class
 */
export class ClientProvider {
  private static client: Etcd3;
  private static zLog = new LogProvider(NAME);

  private constructor(opts = DEFAULT_OPTS) {
    ClientProvider.client = new Etcd3(opts);
  }

  public static getInstance(opts?: IOptions) {
    if (! ClientProvider.client) { 
      ClientProvider.zLog.debug('first time etcd3 client instantiation');
      new ClientProvider(opts); 
    }

    ClientProvider.zLog.debug('returning etcd3 client');
    return this.client;
  }
}