# Changelog

## [5.1.2](https://github.com/aversini/auth-client/compare/auth-provider-v5.1.1...auth-provider-v5.1.2) (2024-07-09)


### Bug Fixes

* bump dependencies to latest ([#91](https://github.com/aversini/auth-client/issues/91)) ([8dc7158](https://github.com/aversini/auth-client/commit/8dc7158bc463c91d919991e5df91a35be8ef7999))
* on failed login, isLading is never reset ([#89](https://github.com/aversini/auth-client/issues/89)) ([a8f52e7](https://github.com/aversini/auth-client/commit/a8f52e77b8813273cccb27bc32af36f3fafe7825))

## [5.1.1](https://github.com/aversini/auth-client/compare/auth-provider-v5.1.0...auth-provider-v5.1.1) (2024-07-07)


### Bug Fixes

* use domain and rely on the server to setup the cookie ([#81](https://github.com/aversini/auth-client/issues/81)) ([75f5569](https://github.com/aversini/auth-client/commit/75f55691b6acf2f7f701c09e4e1601939419a52b))

## [5.1.0](https://github.com/aversini/auth-client/compare/auth-provider-v5.0.6...auth-provider-v5.1.0) (2024-07-07)


### Features

* enabling access token fallback via secure cookie ([#79](https://github.com/aversini/auth-client/issues/79)) ([fc64e50](https://github.com/aversini/auth-client/commit/fc64e509c8cf149a14ae63354547d15fbd92bd0b))

## [5.0.6](https://github.com/aversini/auth-client/compare/auth-provider-v5.0.5...auth-provider-v5.0.6) (2024-07-06)


### Bug Fixes

* remove existing tokens on login if any ([#77](https://github.com/aversini/auth-client/issues/77)) ([b1f7df9](https://github.com/aversini/auth-client/commit/b1f7df9eb09ec7702e6e5b3ccacd95c6c8adaef4))

## [5.0.5](https://github.com/aversini/auth-client/compare/auth-provider-v5.0.4...auth-provider-v5.0.5) (2024-07-05)


### Bug Fixes

* refactor to catch token error and invalidate session consistently ([#75](https://github.com/aversini/auth-client/issues/75)) ([d02c421](https://github.com/aversini/auth-client/commit/d02c421f0db973302c962a4273cba8b45a716170))

## [5.0.4](https://github.com/aversini/auth-client/compare/auth-provider-v5.0.3...auth-provider-v5.0.4) (2024-07-05)


### Bug Fixes

* session should invalidate if refreshing access token fails ([#73](https://github.com/aversini/auth-client/issues/73)) ([5096258](https://github.com/aversini/auth-client/commit/509625898ef2e045144fe6c9301706b6f56524a3))

## [5.0.3](https://github.com/aversini/auth-client/compare/auth-provider-v5.0.2...auth-provider-v5.0.3) (2024-07-05)


### Bug Fixes

* reset isLoading between state changes (login, logout) ([#71](https://github.com/aversini/auth-client/issues/71)) ([a994408](https://github.com/aversini/auth-client/commit/a994408afc916690c19a645d566aa5f30cd66ba6))

## [5.0.2](https://github.com/aversini/auth-client/compare/auth-provider-v5.0.1...auth-provider-v5.0.2) (2024-07-05)


### Bug Fixes

* refactor getAccessToken to prevent async issues ([#69](https://github.com/aversini/auth-client/issues/69)) ([7edb48b](https://github.com/aversini/auth-client/commit/7edb48b66d9a1a1c55bbab377de11cbbbade787f))

## [5.0.1](https://github.com/aversini/auth-client/compare/auth-provider-v5.0.0...auth-provider-v5.0.1) (2024-07-03)


### Bug Fixes

* try to get access token with refresh token even with no access t… ([#65](https://github.com/aversini/auth-client/issues/65)) ([f746456](https://github.com/aversini/auth-client/commit/f746456f32c021127791dba32a239754eea6ed9d))

## [5.0.0](https://github.com/aversini/auth-client/compare/auth-provider-v4.4.0...auth-provider-v5.0.0) (2024-06-29)


### ⚠ BREAKING CHANGES

* useAuth now return user object instead of just userId ([#61](https://github.com/aversini/auth-client/issues/61))

### Features

* useAuth now return user object instead of just userId ([#61](https://github.com/aversini/auth-client/issues/61)) ([d5ac71e](https://github.com/aversini/auth-client/commit/d5ac71e41440f3b07ab7a471e764326d5366ba1e))

## [4.4.0](https://github.com/aversini/auth-client/compare/auth-provider-v4.3.0...auth-provider-v4.4.0) (2024-06-29)


### Features

* adding decodeToken ([#57](https://github.com/aversini/auth-client/issues/57)) ([3d03af9](https://github.com/aversini/auth-client/commit/3d03af988be13eab5d9cdf6bd124fa0a6530786e))

## [4.3.0](https://github.com/aversini/auth-client/compare/auth-provider-v4.2.0...auth-provider-v4.3.0) (2024-06-28)


### Features

* enabling access token renewal via refresh token ([#55](https://github.com/aversini/auth-client/issues/55)) ([b23f003](https://github.com/aversini/auth-client/commit/b23f0031c9bd77514c6377f1aa3a12232b100087))

## [4.2.0](https://github.com/aversini/auth-client/compare/auth-provider-v4.1.0...auth-provider-v4.2.0) (2024-06-27)


### Features

* adding support for refresh tokens ([#51](https://github.com/aversini/auth-client/issues/51)) ([93c70b5](https://github.com/aversini/auth-client/commit/93c70b580b88db813ae2338c9d6f781e4f5ab07b))

## [4.1.0](https://github.com/aversini/auth-client/compare/auth-provider-v4.0.0...auth-provider-v4.1.0) (2024-06-26)


### Features

* using the new logout endpoint ([#44](https://github.com/aversini/auth-client/issues/44)) ([9d23bd1](https://github.com/aversini/auth-client/commit/9d23bd19f2c37fbdc52b39adf1b58a51f5dfd7c6))

## [4.0.0](https://github.com/aversini/auth-client/compare/auth-provider-v3.1.0...auth-provider-v4.0.0) (2024-06-26)


### ⚠ BREAKING CHANGES

* moving nonce to JWT custom claims ([#42](https://github.com/aversini/auth-client/issues/42))

### Bug Fixes

* moving nonce to JWT custom claims ([#42](https://github.com/aversini/auth-client/issues/42)) ([c68cf06](https://github.com/aversini/auth-client/commit/c68cf06f539cb7a026556e04bcce98527d5aa0ff))

## [3.1.0](https://github.com/aversini/auth-client/compare/auth-provider-v3.0.0...auth-provider-v3.1.0) (2024-06-25)


### Features

* adding MVP support for access token ([#38](https://github.com/aversini/auth-client/issues/38)) ([a5a85fd](https://github.com/aversini/auth-client/commit/a5a85fda878670da64c7bb17aa39d36c333c6b06))

## [3.0.0](https://github.com/aversini/auth-client/compare/auth-provider-v2.3.0...auth-provider-v3.0.0) (2024-06-25)


### ⚠ BREAKING CHANGES

* replacing `getIdTokenClaims()` with claims in state ([#34](https://github.com/aversini/auth-client/issues/34))

### Features

* replacing `getIdTokenClaims()` with claims in state ([#34](https://github.com/aversini/auth-client/issues/34)) ([b092e40](https://github.com/aversini/auth-client/commit/b092e409dbc06a912ef1e46d6b2f7bf41c389abc))

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
