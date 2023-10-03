import { hostname } from 'os';
import { Election, Etcd3 } from 'etcd3';

import { LogProvider } from '@core/providers/LogProvider';
import { DEFAULT_OPTS } from '@etcdProviders/types/Common';
import { ElectionTypes } from '@etcdProviders/types/Election';


const NAME = 'Election Provider'


/*
  Election Provider
    starts leader election using etcd3. 
    
    Systems connect to the etcd3 cluster, where a single system is elected leader and will perform work. Each system that 
    connects to the cluster will heartbeat on a fixed interval, which by default will be 100ms but can be tuned for different 
    network environments. On failures, if a heartbeat is not received by the etcd3 cluster within the election timeout, a campaign 
    begins and a new system will be elected to take the place as the new leader.
*/
export class ElectionProvider {
  private election: Election;
  private zLog: LogProvider = new LogProvider(NAME);

  constructor(private electionName: string, private client = new Etcd3(DEFAULT_OPTS)) {
    this.election = this.client.election(this.electionName);
  }

  /*
    start:  
      start both the campaign and the leader observer methods
  */
  async start() {
    this.createCampaign();
    this.createObserver();
  }

  /*
    create Campaign:
      puts the current system as eligble for election
      
      On successful campaign, leader will perform work while the rest of the systems act as a fallback.
  */
  private async createCampaign() {
    const campaign = this.election.campaign(hostname());
    this.zLog.debug('campaign started');
    
    campaign.on('elected', () => {
      this.zLog.info('I am leader');
    });

    campaign.on('error', err => {
      this.zLog.error(`campaign error: ${err.message}`);
      setTimeout(() => this.createCampaign(), 5000);
    });
  }

  /*
    create Observer:
      observer for the campaign.

      On leader changes, an event will be emitted
  */
  private async createObserver() {
    const observer = await this.election.observe();
    
    this.zLog.debug('leader observer started');
    this.zLog.debug(`The current leader is ${observer.leader()}`);

    observer.on('change', leader => this.zLog.info(`The new leader is ${leader}`));
    
    observer.on('error', err => {
      this.zLog.error(`observer error: ${err.message}`);
      setTimeout(() => this.createObserver(), 5000);
    });
  }
}