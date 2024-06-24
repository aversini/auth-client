# Changelog

## [2.3.0](https://github.com/aversini/auth-client/compare/auth-provider-v2.2.0...auth-provider-v2.3.0) (2024-06-24)


### Features

* adding getIdTokenClaims ([#32](https://github.com/aversini/auth-client/issues/32)) ([bfaf502](https://github.com/aversini/auth-client/commit/bfaf502f83291b9eb03b0700c955fd80858afeca))

## [2.2.0](https://github.com/aversini/auth-client/compare/auth-provider-v2.1.2...auth-provider-v2.2.0) (2024-06-24)


### Features

* moving verifyAndExtractToken to common package ([#28](https://github.com/aversini/auth-client/issues/28)) ([015b6df](https://github.com/aversini/auth-client/commit/015b6dfada0b8ecd2018819c62bb76e42cc3721e))

## [2.1.2](https://github.com/aversini/auth-client/compare/auth-provider-v2.1.1...auth-provider-v2.1.2) (2024-06-24)


### Bug Fixes

* mark session as expired when JWT does not validate ([#26](https://github.com/aversini/auth-client/issues/26)) ([4c5fc6f](https://github.com/aversini/auth-client/commit/4c5fc6f41ee35973773371494a90cabe084958fb))

## [2.1.1](https://github.com/aversini/auth-client/compare/auth-provider-v2.1.0...auth-provider-v2.1.1) (2024-06-24)


### Bug Fixes

* audience is now a required JWT claim for idToken ([#24](https://github.com/aversini/auth-client/issues/24)) ([c1730e7](https://github.com/aversini/auth-client/commit/c1730e7815a73bee592b2171a0fd8360f2fd1f71))

## [2.1.0](https://github.com/aversini/auth-client/compare/auth-provider-v2.0.2...auth-provider-v2.1.0) (2024-06-24)


### Features

* stronger security level for JWT verification with RSA keys ([#21](https://github.com/aversini/auth-client/issues/21)) ([0750b75](https://github.com/aversini/auth-client/commit/0750b75026d4870e632e1cbca6dcef0f851d8d83))

## [2.0.2](https://github.com/aversini/auth-client/compare/auth-provider-v2.0.1...auth-provider-v2.0.2) (2024-06-20)


### Bug Fixes

* embed user id in JWT ([#17](https://github.com/aversini/auth-client/issues/17)) ([5518f58](https://github.com/aversini/auth-client/commit/5518f5861caf0195d6742b20798c4979bcbf8324))

## [2.0.1](https://github.com/aversini/auth-client/compare/auth-provider-v2.0.0...auth-provider-v2.0.1) (2024-06-18)


### Bug Fixes

* update API endpoint ([#14](https://github.com/aversini/auth-client/issues/14)) ([b853740](https://github.com/aversini/auth-client/commit/b853740aad3b9e36e661b622620d8ce2acee3e45))

## [2.0.0](https://github.com/aversini/auth-client/compare/auth-provider-v1.0.2...auth-provider-v2.0.0) (2024-06-17)


### ⚠ BREAKING CHANGES

* rename tenantId to clientId ([#12](https://github.com/aversini/auth-client/issues/12))

### Bug Fixes

* rename tenantId to clientId ([#12](https://github.com/aversini/auth-client/issues/12)) ([c340460](https://github.com/aversini/auth-client/commit/c3404604e21adc4cfdd062a6a0fb64415ba516bf))

## [1.0.2](https://github.com/aversini/auth-client/compare/auth-provider-v1.0.1...auth-provider-v1.0.2) (2024-06-17)


### Bug Fixes

* minor refactor ([#10](https://github.com/aversini/auth-client/issues/10)) ([e02c72c](https://github.com/aversini/auth-client/commit/e02c72c53141e9eec40f6c7e1779c8c40ec5b739))

## [1.0.1](https://github.com/aversini/auth-client/compare/auth-provider-v1.0.0...auth-provider-v1.0.1) (2024-06-15)


### Bug Fixes

* using auth-common to common constant ([#8](https://github.com/aversini/auth-client/issues/8)) ([da42e51](https://github.com/aversini/auth-client/commit/da42e51d63a8ac84c4a771e291189d979fef485c))

## 1.0.0 (2024-06-14)


### Features

* AuthProvider MVP ([486702b](https://github.com/aversini/auth-client/commit/486702bd3a6963622caf0b6429746d70668ea14a))
