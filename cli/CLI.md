# CLI/Provider

`A command line tool for interacting with the ledger`
*performed within main project directory* [@root](../)


## Building

**currently using node 18**

```bash
  npm install
  npm run build:all
```


## Arguments

Command line arguments should be as follows:

```
  --operation=<getBalance | getTransactions | createTransaction | authenticate | register>
  --payload=<BalanceRequest | TransactionsRequest | CreateTransactionRequest | AuthenticateUserRequest | RegisterUserRequest>
  --userId=<userId> (required for Ledger Transactions, injected in header of request, not required for auth)
  --bypassSSLVerification=<boolean> (optional, only for self signed certs) --> this is required locally for testing
  --host=<host> (optional)  --> this will resolve to hostname of machine otherwise (where the load balancer is bound)
  --port=<port> (optional) --> for https, not needed since defaults to 443
  --https=<boolean> (optional) --> defaults to true
```

## Client Operations

`getBalance - get balance for current user`
```bash
  npm run cli -- --operation=getBalance --payload='{}' --userId=testuser --bypassSSLVerification=true
```

`getTransactions - get a list of transactions from past 30 days, in descending order`
```bash
  npm run cli -- --operation=getTransactions --payload='{}' --userId=testuser --bypassSSLVerification=true
```

`createTransaction - withdraw or deposit funds from the atm`
```bash
  npm run cli -- --operation=createTransaction --payload='{"operation": "deposit","transactionSize": 1000}' --userId=testuser --bypassSSLVerification=true
```

`authenticate - authenticate user`
```bash
  npm run cli -- --operation=authenticate --payload='{"email": "testemail","password": "testpass"}' --bypassSSLVerification=true
```

`register - register user`
```bash
  npm run cli -- --operation=register --payload='{"userId": "testuser","email": "testemail","password": "testpass","phone": "1234567890"}' --bypassSSLVerification=true
```


## Cert Gen

check out [CertGen](../certs/CertGen.md) to generate self signed certs.


## Auth

When a user is first registered, or the user is authenticating themselves, a json web token is written to storage locally so that passwords are not required on every operation.
This token does have a time span before needing to be refreshed, but contains a longer lasting refresh token stored server side so that, if needed, the token can be refreshed automatically on a request.

The value is currently hardcoded to 2 minutes on both the jwt and refresh token, but this can be changed.

If you become unauthenticated after that 2 minute period, just launch an `authenticate` request to re-authenticate your user


## Importing into Project

```ts
import { CLIProvider } from '@cli/providers/CLIProvider';

const resp = await this.cliProv[<method>](<payload>);
```

## Note on Endpoints (for use with Postman)

The endpoints are as follows (if you want to use Postman to test):

```
https://<hostname>/b_v1/auth/authenticate
 
https://<hostname>/b_v1/auth/register
 
https://<hostname>/b_v1/ledger/gettransactions

https://<hostname>/b_v1/ledger/createtransaction

https://<hostname>/b_v1/ledger/getbalance
```

for `ledger` endpoints, it is required to first authenticate using `/auth/authenticate` or when registering

then the following headers are required for `ledger`:

```
  accesstoken --> this will be the resp from `auth/authenticate` or `auth/register`, which is the json web token
  userId --> the userId of the registered user
```

payloads are the same as above, but for `gettransactions` and `getbalance`, the body can be empty since the userId is injected into the request on the service route from the headers once the token is verified

for system, which is not client facing, there are two endpoints:

```
https://<hostname>/b_v1/system/getbalance --> used for getting current system balance

https://<hostname>/b_v1/system/addfunds --> used for adding or removing funds from the system itself
```

all requests are `POST` requests