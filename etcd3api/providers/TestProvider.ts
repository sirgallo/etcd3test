import { LogProvider } from '@core/providers/LogProvider';


const NAME = 'Test Work Provider';


export class TestWorkProvider {
  private zLog = new LogProvider(NAME);

  constructor() {}

  async doWork() {
    while(true) {
      this.zLog.debug('doing work!');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}