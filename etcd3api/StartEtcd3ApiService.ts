import { InitEtcd3ApiService } from '@etcd3api/InitEtcd3ApiService';
import { serverConfiguration } from '../ServerConfigurations';

const server = new InitEtcd3ApiService(
  serverConfiguration.basePath,
  serverConfiguration.systems.etcd3api.name,
  serverConfiguration.systems.etcd3api.port,
  serverConfiguration.systems.etcd3api.version,
  serverConfiguration.systems.etcd3api.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }