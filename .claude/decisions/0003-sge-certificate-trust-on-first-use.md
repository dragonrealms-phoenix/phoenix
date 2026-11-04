# SGE's certificate is trusted on first use each run

SGE presents a self-signed TLS certificate, which Node rejects by default.
Phoenix downloads that certificate without verification once per app run, then pins it for the real login connection.
Shipping the certificate with the app was rejected because it would break every installed copy when Simutronics replaces it.

## Consequences

- Don't "fix" the unverified download by turning verification on; the login will fail.
- Pinning only protects the connections after the first download in a run, not the download itself.
