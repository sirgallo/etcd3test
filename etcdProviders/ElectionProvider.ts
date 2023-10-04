import { hostname } from 'os';
import { Election, IOptions } from 'etcd3';

import { BaseEtcdProvider } from '@etcdProviders/BaseEtcdProvider';
import { 
  ElectionEvent, ElectionListener, 
  ERROR_TIMEOUT_IN_MS, ALLOWED_EVENTS 
} from '@etcdProviders/types/Election';


const NAME = 'Election Provider';


/**
 * Election Provider
 *  starts leader election using etcd3
 *   
 *  Systems connect to the etcd3 cluster, where a single system is elected leader and will perform work. Each system that 
 *  connects to the cluster will heartbeat on a fixed interval, which by default will be 100ms but can be tuned for different 
 *  network environments. On failures, if a heartbeat is not received by the etcd3 cluster within the election timeout, a campaign 
 *  begins and a new system will be elected to take the place as the new leader.
 * 
 * @class
 */
export class ElectionProvider extends BaseEtcdProvider {
  private election: Election;
  private hostname = hostname();
  private _isLeader = false;

  constructor(private electionName: string, clientOpts?: IOptions) {
    super(NAME, clientOpts);
    this.election = this.client.election(this.electionName);
  }

  /**
   * set Leader:
   *  set leadership status of the current host
   * 
   *  on leadership changes, emit an event to the promoted event stream
   * 
   * @param {string} leader - the hostname of the new leader
   */
  private setIsLeader(leader?: string) {
    if (leader) {
      if (leader !== this.hostname) {
        this.zLog.info(`The new leader is ${leader}`);
        
        this._isLeader = false;
        this.emit(ALLOWED_EVENTS.promoted, false);
      }
    } else { 
      this.zLog.info('I am the new leader');

      this._isLeader = true; 
      this.emit(ALLOWED_EVENTS.promoted, true);
    }
  }

  /**
   * get isLeader:
   * 
   * @returns {boolean} - current status
   */
  get isLeader(): boolean {
    return this._isLeader;
  }

  /**
   * on:
   *  strictly typed event listener, where the listener callback can be implemented by any method that utilizes the Election Provider
   * 
   * @param {ElectionEvent} event - the event for the event stream, in this case promoted
   * @param {ElectionListener} listener - callback that on event returns true if leader, false if not
   * @returns {this}
   */
  on(event: ElectionEvent, listener: ElectionListener): this {
    return super.on(event, listener);
  }

  /**
   * start:
   *  start both the campaign and the leader observer methods
   */
  async start() {
    this.createCampaign();
    this.createObserver();
  }

  /**
   * create Campaign:
   *  puts the current system as eligble for election
   *  
   * On successful campaign, leader will perform work while the rest of the systems act as a fallback.
   */
  private async createCampaign() {
    const campaign = this.election.campaign(hostname());
    this.zLog.debug(`campaign started for host ${hostname()}`);
    
    campaign.on('elected', () => this.setIsLeader());

    campaign.on('error', err => {
      this.zLog.error(`campaign error: ${err.message}`);
      setTimeout(() => this.createCampaign(), ERROR_TIMEOUT_IN_MS);
    });
  }

  /**
   * create Observer:
   *  observer for the campaign
   * 
   *  On leader changes, an event will be emitted. If leader, ignore, if not set the system to follower.
   */
  private async createObserver() {
    const observer = await this.election.observe();
    this.zLog.debug('leader observer started');

    observer.on('change', leader => this.setIsLeader(leader));
    
    observer.on('error', err => {
      this.zLog.error(`observer error: ${err.message}`);
      setTimeout(() => this.createObserver(), ERROR_TIMEOUT_IN_MS);
    });
  }
}