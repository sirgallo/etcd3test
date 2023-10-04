import { BaseServer } from '@baseServer/core/BaseServer';
import { ElectionProvider } from '@etcdProviders/ElectionProvider';
import { TestWorkProvider } from '@etcd3api/providers/TestProvider';


export class InitEtcd3ApiService extends BaseServer {
  private electionProv: ElectionProvider;
  private testProv: TestWorkProvider;
  
  constructor(
    private basePath: string, 
    name: string, 
    port?: number, 
    version?: string, 
    numOfCpus?: number
  ) { 
    super(name, port, version, numOfCpus); 
    this.electionProv = new ElectionProvider('test');
    this.testProv = new TestWorkProvider();
  }

  async initService(): Promise<boolean> {
    this.zLog.info('leader election module starting...');
    this.electionProv.start();

    return true;
  }

  async startEventListeners(): Promise<void> {
    this.electionProv.on('promoted', async res => {
      if (res) await this.testProv.doWork();
    });
  }
}