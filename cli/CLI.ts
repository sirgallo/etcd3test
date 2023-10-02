import { join } from 'path';
import { cwd } from 'process';
import { Headers } from 'got';
import lodash from 'lodash';
const { some, every } = lodash;

import { LogProvider } from '@core/providers/LogProvider';
import { CLIProvider, ClientLedgerEndpoints } from '@cli/providers/CLIProvider';
import { FileOpProvider } from '@core/providers/filesystem/FileOpProvider';


interface ArgsMap {
  host?: string;
  port?: string;
  https?: boolean;
  operation: keyof ClientLedgerEndpoints;
  payload: string;
  userId: string;
  bypassSSLVerification?: boolean;
}

const NAME = 'Client Ledger CLI';
const JWT_FILE_NAME = join(cwd(), 'cli/token/jsonWebTokenLocalStorage');
const DEFAULT_HEADERS: Headers = {
  'Content-Type': 'application/json'
  //Accept: '*/*',
  //Connection: 'keep-alive',
  //'Accept-Encoding': 'gzip, deflate, br'
};


export class CLI {
  private argsMap: ArgsMap;
  private cliProv: CLIProvider;
  private zLog: LogProvider = new LogProvider(NAME);
  private fileOpProv = new FileOpProvider()

  constructor(args: string[]) {
    this.verifyArgs(args);
    this.init();
  }

  verifyArgs(args: string[]) {
    this.argsMap = (args.slice(1).reduce( (acc, curr) => {
      const splits = curr.split('=');
      acc[splits[0].replace('--', '')] = splits[1];

      return acc;
    }, {}) || {}) as any;

    if (! this.argsMap.operation) this.exitCli('missing endpoint operation to perform.');
    if (! this.argsMap.payload) this.exitCli('missing endpoint operation payload.');
    
    const ledgerOpDeterminant = some([
      this.argsMap.operation === 'getBalance',
      this.argsMap.operation === 'getTransactions',
      this.argsMap.operation === 'createTransaction'
    ]);
    if (every([ ledgerOpDeterminant, !this.argsMap.userId ])) this.exitCli('missing userId for Ledger Operations.');
  }

  init() {
    this.cliProv = new CLIProvider(this.argsMap?.host, this.argsMap?.port, this.argsMap?.https);
  }

  async run(): Promise<boolean> {
    try {
      const jwt = await this.authenticateUser();
      if (every([ this.argsMap.operation !== 'register', this.argsMap.operation !== 'authenticate' ])) {
        const headers = this.initHeaders(jwt);
        const resp = await this.cliProv[this.argsMap.operation](JSON.parse(this.argsMap.payload), headers, this.argsMap?.bypassSSLVerification);
      
        this.zLog.info(`Current response object for method ${this.argsMap.operation}`);
        this.zLog.debug(JSON.stringify(resp, null, 2));
      }

      return true;
    } catch (err) {
      this.exitCli((err as Error).message);
    }
  }

  async authenticateUser(): Promise<string> {
    if (some([ this.argsMap.operation === 'register', this.argsMap.operation === 'authenticate' ])) {
      const jwt = await this.cliProv[this.argsMap.operation](JSON.parse(this.argsMap.payload), DEFAULT_HEADERS, this.argsMap?.bypassSSLVerification) as string;
      await this.fileOpProv.writeFile(JWT_FILE_NAME, jwt);
      return jwt;
    }

    const buffer = await this.fileOpProv.readFile(JWT_FILE_NAME);
    return buffer.toString();
  }

  private initHeaders(jwt: string): Headers {
    return { 
      ...DEFAULT_HEADERS,
      accesstoken: jwt,
      userId: this.argsMap.userId
    };
  }

  private exitCli(message: string) {
    this.zLog.debug(message);
    process.exit(1);
  }
}

const c = new CLI(process.argv.slice(2));
c.run()
  .then(resp => { 
    console.log(resp);
    process.exit(0);
  })
  .catch(err => { 
    console.log(err);
    process.exit(1)
  });