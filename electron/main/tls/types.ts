import type tls from 'node:tls';

export type SelfSignedConnectOptions = Pick<
  tls.ConnectionOptions,
  'ca' | 'checkServerIdentity' | 'requestCert'
>;
