# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 2.x     | Yes       |
| 1.x     | No        |

## Reporting a vulnerability

Please do not report security issues through public GitHub issues.

Use GitHub's [private vulnerability
reporting](https://github.com/hasan-bekir-dogan/ChatApp/security/advisories/new)
instead. Include:

- a description of the problem and the impact you expect,
- the steps or a proof of concept needed to reproduce it,
- the affected version or commit.

You can expect an initial reply within seven days. Once the issue is confirmed,
a fix is prepared and released, and the report is credited in the release notes
unless you prefer otherwise.

## Scope

The application stores messages in plain text in MongoDB. It does not implement
end-to-end encryption, and that is a known design limitation rather than a
vulnerability. Reports about missing transport security on a deployment you do
not control are also out of scope.

## Hardening a deployment

- Set a long random `SESSION_SECRET`. The application refuses to start in
  production without one.
- Terminate TLS in front of the application and set `TRUST_PROXY=true` so that
  secure cookies and rate limiting work correctly.
- Restrict network access to MongoDB and enable authentication on it.
