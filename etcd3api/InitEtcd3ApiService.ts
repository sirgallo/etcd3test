import { BaseServer } from '@baseServer/core/BaseServer';
import { ElectionProvider } from '@etcdProviders/ElectionProvider';


export class InitEtcd3ApiService extends BaseServer {
  private electionProv: ElectionProvider;

  constructor(
    private basePath: string, 
    name: string, 
    port?: number, 
    version?: string, 
    numOfCpus?: number
  ) { 
    super(name, port, version, numOfCpus); 
    this.electionProv = new ElectionProvider('test');
  }

  async initService(): Promise<boolean> {
    try {
      this.zLog.info('leader election module starting...');
      this.electionProv.start();

      return true;
    } catch (err) {
      this.zLog.error(err);
      throw err;
    }
  }
}