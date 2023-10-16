import tls from 'node:tls';

export type SelfSignedCertConnectOptions = Pick<
  tls.ConnectionOptions,
  'ca' | 'checkServerIdentity' | 'requestCert'
>;
