import { hostname } from 'os';
import { join } from 'path';
import { readFileSync } from 'fs';
import { cwd } from 'process';
import { Headers } from 'got';
import lodash from 'lodash';
const { merge } = lodash;

import { asyncExponentialBackoff } from '@core/utils/AsyncExponentialBackoff';
import { LedgerEndpoints, AuthEndpoints } from '@ledger/models/Endpoints';
import { 
  BalanceRequest, TransactionsRequest, CreateTransactionRequest,
  BalanceResponse, TransactionsResponse
} from '@ledger/models/LedgerRequest';
import { AuthenticateUserRequest, RegisterUserRequest } from '@ledger/models/AuthRequest';
import { ILedgerEntry } from '@db/models/Ledger';
import { serverConfiguration } from '../../ServerConfigurations';
import { authRouteMapping } from '@ledger/configs/AuthRouteMapping';
import { ledgerRouteMapping } from '@ledger/configs/LedgerRouteMapping';


type EndpointMapping<T> = { [ K in keyof T ]: string };
export interface ClientLedgerEndpoints extends LedgerEndpoints, AuthEndpoints {}
export type ClientLedgerRequests = BalanceRequest 
  | TransactionsRequest 
  | CreateTransactionRequest
  | AuthenticateUserRequest
  | RegisterUserRequest;

const HOSTNAME = hostname();

export class CLIProvider implements ClientLedgerEndpoints { 
  private endpoints: EndpointMapping<ClientLedgerEndpoints>;
  private selfSignedCert: Buffer;

  constructor(private host = HOSTNAME, private port?: string, private https = true) {
    this.parseUrl(); 
    this.setEndpoints();
    this.selfSignedCert = this.getSelfSignedCert();
  }

  async getBalance(opts: BalanceRequest, headers?: Headers, bypassSSLVerification?: boolean): Promise<BalanceResponse> {
    const req = { json: opts, headers, responseType: 'json' };
    if (bypassSSLVerification) {
      const https = { certificate: this.selfSignedCert, rejectUnauthorized: false }
      merge(req, { https });
    }

    return asyncExponentialBackoff(this.endpoints.getBalance, 5, 500, req);
  }

  async getTransactions(opts: TransactionsRequest, headers?: Headers, bypassSSLVerification?: boolean): Promise<TransactionsResponse> {
    const req = { json: opts, headers, responseType: 'json' };
    if (bypassSSLVerification) {
      const https = { certificate: this.selfSignedCert, rejectUnauthorized: false }
      merge(req, { https });
    }

    return asyncExponentialBackoff(this.endpoints.getTransactions, 5, 500, req);
  }

  async createTransaction(opts: CreateTransactionRequest, headers?: Headers, bypassSSLVerification?: boolean): Promise<ILedgerEntry> {
    const req = { json: opts, headers, responseType: 'json' };
    if (bypassSSLVerification) {
      const https = { certificate: this.selfSignedCert, rejectUnauthorized: false }
      merge(req, { https });
    }

    return asyncExponentialBackoff(this.endpoints.createTransaction, 5, 500, req);
  }

  async authenticate(opts: AuthenticateUserRequest, headers?: Headers, bypassSSLVerification?: boolean): Promise<string> {
    const req = { json: opts, headers, responseType: 'json' };
    if (bypassSSLVerification) {
      const https = { certificate: this.selfSignedCert, rejectUnauthorized: false }
      merge(req, { https });
    }

    const resp = await asyncExponentialBackoff(this.endpoints.authenticate, 5, 500, req);
    return resp['resp'];
  }

  async register(opts: RegisterUserRequest, headers?: Headers, bypassSSLVerification?: boolean): Promise<string> {
    const req = { json: opts, headers, responseType: 'json' };
    if (bypassSSLVerification) {
      const https = { certificate: this.selfSignedCert, rejectUnauthorized: false }
      merge(req, { https });
    }

    const resp = await asyncExponentialBackoff(this.endpoints.register, 5, 500, req);
    return resp['resp'];
  }

  private parseUrl() {
    const port = `${ this.port ? ':' + this.port : this.port }`

    if (! this.https) {
      this.host = !this.host.includes('http://') 
        ? `http://${this.host}${port}` 
        : this.host + port;
    } else {
      this.host = !this.host.includes('https://') 
        ? `https://${this.host}`
        : this.host;
    }
  }

  private getSelfSignedCert(): Buffer {
    const crt = join(cwd(), 'certs', `${HOSTNAME}.crt`);
    return readFileSync(crt);
  }

  private setEndpoints() { 
    const basePath = serverConfiguration.basePath;

    const { getBalance, getTransactions, createTransaction } = ledgerRouteMapping.ledger.subRouteMappings;
    const { authenticate, register } = authRouteMapping.auth.subRouteMappings

    this.endpoints = {
      getBalance: `${this.host}${join(basePath, ledgerRouteMapping.ledger.name, getBalance.name)}`,
      getTransactions: `${this.host}${join(basePath, ledgerRouteMapping.ledger.name, getTransactions.name)}`,
      createTransaction: `${this.host}${join(basePath, ledgerRouteMapping.ledger.name, createTransaction.name)}`,
      authenticate: `${this.host}${join(basePath, authRouteMapping.auth.name, authenticate.name)}`,
      register: `${this.host}${join(basePath, authRouteMapping.auth.name, register.name)}`,
    };
  }
}