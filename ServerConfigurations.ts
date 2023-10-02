import { 
  ServerConfigMapping, ServerConfigurations,ServerConfiguration 
} from '@core/baseServer/core/models/ServerConfiguration';


export const systems: ServerConfigurations<Record<string, ServerConfiguration>> = {
  etcd3api: {
    port: 1234,
    name: 'etcd3 API',
    numOfCpus: 1,
    version: '0.0.1-dev'
  }
};

export const serverConfiguration: ServerConfigMapping = {
  basePath: '/b_v1',
  systems
};