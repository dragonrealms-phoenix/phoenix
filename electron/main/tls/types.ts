import type * as tls from 'node:tls';

export type SelfSignedConnectOptions = Required<
  Pick<tls.ConnectionOptions, 'ca' | 'checkServerIdentity' | 'requestCert'>
>;
