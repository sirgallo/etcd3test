import { env } from 'process';
import { IOptions } from 'etcd3';


/*
  for defaults, add hosts in environmental variable called ETCDHOSTS
  
  format:
    ETCDHOSTS=host1,host2,host3...
*/
export const DEFAULT_OPTS: IOptions = (() => {
  const hosts: string[] = ((): string[] => {
    const listAsString = env.ETCDHOSTS
    return listAsString.split(',');
  })();

  return { hosts };
})();