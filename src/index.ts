

import {APIApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
export {APIApplication, PackageInfo, PackageKey} from './application';

export async function main(options?: ApplicationConfig) {
  const app = new APIApplication(options);

  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  return app;
}
