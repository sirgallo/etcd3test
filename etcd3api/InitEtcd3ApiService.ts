import { BaseServer } from '@baseServer/core/BaseServer';

import { ElectionProvider } from '@etcd3api/providers/ElectionProvider';


export class InitEtcd3ApiService extends BaseServer {
  constructor(private basePath: string, name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async initService(): Promise<boolean> {
    try {
      const electionProv = new ElectionProvider();
      this.zLog.info("etcd3 client initialized");

      electionProv.runCampaign()
      electionProv.observeLeader()

      return true;
    } catch (err) {
      this.zLog.error(err);
      throw err;
    }
  }
}