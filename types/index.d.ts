import { FastifyPluginCallback } from 'fastify';
import { IDocumentSession, IDocumentStore, IStoreAuthOptions } from 'ravendb'

type IOptions = {
  /**
   * Specific name for the DocumentStore instance
   */
  name?: string;

  /**
   * RavenDB server URL
   */
  url: string;

  /**
   * Database name
   */
  databaseName: string;

  /**
   * Authentication options (i.e. certificate and password)
   */
  authOptions?: IStoreAuthOptions;

  /**
   * A function to extract the target collection from an object literal entity
   */
  findCollectionNameForObjectLiteral?: (entity: object) => string;
}

type IRouteOptions = {
  autoSession?: boolean | string | string[];
}

declare const plugin: FastifyPluginCallback<IOptions>;

declare module 'fastify' {
  export interface FastifyInstance {
    rvn: IDocumentStore & Record<string, IDocumentStore>;
  }

  export interface FastifyRequest {
    rvn?: IDocumentSession & Record<string, IDocumentSession>;
  }

  export interface RouteShorthandOptions {
    rvn?: IRouteOptions;
  }
}

export { plugin, IOptions, IRouteOptions };

export default plugin;
