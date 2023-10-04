import { IOptions } from 'etcd3';

import { BaseEtcdProvider } from '@etcdProviders/BaseEtcdProvider';
import { GetAllResponse } from '@etcdProviders/types/Query';


const NAME = 'Query Provider';


/**
 * Query Provider
 *  perform operations on the etcd key-value store
 * 
 * etcd key-value store is implemented in BoltDb, which is a memory-mapped database that utilizes a B+tree
 * as the underlying data structure for storing data. BoltDb excels at read heavy operations, and write operation
 * performance is heavily impacted by the speed of the underlying system's disk.
 * 
 * @class
 */
export class QueryProvider extends BaseEtcdProvider {
  private prefix: string;

  constructor(private opts?: { clientOpts?: IOptions, prefix?: string }) {
    super(NAME, opts?.clientOpts);
    this.prefix = opts?.prefix;
  }

  /**
   * put:
   *  creates a key if it does not exist or updates the value of an existing key
   *
   * @param {string} key - the key to put in etcd key-val store
   * @param {string} value - the value to put in etcd key-val store
   * @returns {Promise<boolean>}
   */
  async put(key: string, value: string): Promise<boolean> {
    const prefixedKey = this.generatePrefixedKey(key);
    
    await this.client.put(prefixedKey).value(value);
    return true;
  }

  /**
   * get: 
   *  retrieves a value for a specified key from the etcd key-value store
   * @param {string} key - the key to retrieve
   * @returns {Promise<string>} - the value associated with the key -- will be null if not found
   */
  async get(key: string): Promise<string> {
    const prefixedKey = this.generatePrefixedKey(key);
    return this.client.get(prefixedKey).string();
  }

  /**
   * get All For Prefix:
   *  gets all key-value pairs associated with a prefix, which maps a substring to the start of a key
   *  when searching
   *
   * @param {string} overridePrefix - optionally, override the prefix in the class constructor
   * @returns {Promise<GetAllResponse>} - a map of key-value pairs from successful get -- will be null if no matches
   */
  async getAllForPrefix(overridePrefix?: string): Promise<GetAllResponse> {
    const prefix = overridePrefix ? overridePrefix : this.prefix
    if (! prefix) return null;

    return this.client.getAll().prefix(prefix).strings()
  }

  /**
   * delete:
   *   delete a key from the etcd key-value store
   *
   * @param {string} key - the key to remove from the key-value store
   * @returns {Promise<boolean>}
   */
  async delete(key: string): Promise<boolean> {
    const prefixedKey = this.generatePrefixedKey(key);
    await this.client.delete().key(prefixedKey);
    
    return true;
  }

  /**
   * generate Prefixed Key:
   *  when provided a prefix in the structure, generate a key with the following format: prefix/key
   * 
   * @param {string} key 
   * @returns {string}
   */
  private generatePrefixedKey = (key: string) => {
    if (this.prefix) return `${this.opts.prefix}/${key}`;
    return key;
  }
}