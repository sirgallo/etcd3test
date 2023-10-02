import { hostname } from 'os';
import { env } from 'process'
import { Election, Etcd3, IOptions } from 'etcd3';

import { LogProvider } from '@core/providers/LogProvider';


const NAME = 'Election Provider'

const HOSTS: string[] = ((): string[] => {
  const listAsString = env.ETCDHOSTS
  return listAsString.split(',');
})();

const DEFAULT_OPTS: IOptions = {
  hosts: HOSTS
}


export class ElectionProvider {
  private election: Election;
  private zLog: LogProvider = new LogProvider(NAME);

  constructor(private client = new Etcd3(DEFAULT_OPTS)) {
    this.election = this.client.election('singleton-job');
  }

  runCampaign() {
    const campaign = this.election.campaign(hostname());
    
    campaign.on('elected', () => {
      this.zLog.info('I am leader');
    });

    campaign.on('error', error => {
      this.zLog.error(error);
      setTimeout(this.runCampaign, 5000);
    });
  }

  async observeLeader() {
    const observer = await this.election.observe();
    this.zLog.debug(`The current leader is ${observer.leader()}`);

    observer.on('change', leader => this.zLog.info(`The new leader is ${leader}`));
    
    observer.on('error', () => {
      // Something happened that fatally interrupted observation.
      setTimeout(this.observeLeader, 5000);
    });
  }
}