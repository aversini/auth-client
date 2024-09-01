# Changelog

## [4.1.0](https://github.com/versini-org/auth-client/compare/auth-common-v4.0.0...auth-common-v4.1.0) (2024-09-01)


### Features

* adding email key to idToken ([#177](https://github.com/versini-org/auth-client/issues/177)) ([f8f0ee1](https://github.com/versini-org/auth-client/commit/f8f0ee19abbee9b07ea5317611fed52fb2039474))

## [4.0.0](https://github.com/aversini/auth-client/compare/auth-common-v3.4.0...auth-common-v4.0.0) (2024-08-19)


### ⚠ BREAKING CHANGES

* this is dependent on auth-server v8+

### Features

* refactor login processes ([#162](https://github.com/aversini/auth-client/issues/162)) ([5902888](https://github.com/aversini/auth-client/commit/5902888efbea88b25d8ea29bd7a309ab45dcb94f))

## [3.4.0](https://github.com/aversini/auth-client/compare/auth-common-v3.3.1...auth-common-v3.4.0) (2024-08-19)


### Features

* **common:** adding getSession method ([#160](https://github.com/aversini/auth-client/issues/160)) ([2454df2](https://github.com/aversini/auth-client/commit/2454df2e97f11291170a999b178d24187c017399))

## [3.3.1](https://github.com/aversini/auth-client/compare/auth-common-v3.3.0...auth-common-v3.3.1) (2024-08-01)


### Bug Fixes

* adding missing client id (audience) key ([#154](https://github.com/aversini/auth-client/issues/154)) ([13aa8e5](https://github.com/aversini/auth-client/commit/13aa8e593a7611aec67256b75584fb18a3aa4520))

## [3.3.0](https://github.com/aversini/auth-client/compare/auth-common-v3.2.0...auth-common-v3.3.0) (2024-07-21)


### Features

* allowing AND or OR operations for isGranted ([#127](https://github.com/aversini/auth-client/issues/127)) ([97ff81b](https://github.com/aversini/auth-client/commit/97ff81b488a68115d7b3abc8e2522a8ccf2b738b))

## [3.2.0](https://github.com/aversini/auth-client/compare/auth-common-v3.1.0...auth-common-v3.2.0) (2024-07-21)


### Features

* adding isGranted to check for scopes ([#123](https://github.com/aversini/auth-client/issues/123)) ([7521e24](https://github.com/aversini/auth-client/commit/7521e246bfcb4066418ba37acdf78baf20c89f46))

## [3.1.0](https://github.com/aversini/auth-client/compare/auth-common-v3.0.1...auth-common-v3.1.0) (2024-07-21)


### Features

* adding JWT scopes key ([#121](https://github.com/aversini/auth-client/issues/121)) ([3c1bb1f](https://github.com/aversini/auth-client/commit/3c1bb1f7dbaf25f9c268ff25c10fa73a7658efab))

## [3.0.1](https://github.com/aversini/auth-client/compare/auth-common-v3.0.0...auth-common-v3.0.1) (2024-07-20)


### Bug Fixes

* slightly more error prone getToken + new JWT constant keys ([#119](https://github.com/aversini/auth-client/issues/119)) ([e84bb76](https://github.com/aversini/auth-client/commit/e84bb764c6233ae31017b0453a416ac7838f438b))

## [3.0.0](https://github.com/aversini/auth-client/compare/auth-common-v2.12.1...auth-common-v3.0.0) (2024-07-19)


### ⚠ BREAKING CHANGES

* the params are now an object

### Features

* adding body as a possible option for getting token ([#117](https://github.com/aversini/auth-client/issues/117)) ([768a977](https://github.com/aversini/auth-client/commit/768a97751f94af2744e00dda40b8eff028e0a0c8))

## [2.12.1](https://github.com/aversini/auth-client/compare/auth-common-v2.12.0...auth-common-v2.12.1) (2024-07-15)


### Bug Fixes

* adding missing AUTH_TYPE_KEY to JWT constant ([#103](https://github.com/aversini/auth-client/issues/103)) ([6de762b](https://github.com/aversini/auth-client/commit/6de762bdbab1f6982508d17eb921bebcc349a8af))

## [2.12.0](https://github.com/aversini/auth-client/compare/auth-common-v2.11.0...auth-common-v2.12.0) (2024-07-15)


### Features

* adding new auth types ([#101](https://github.com/aversini/auth-client/issues/101)) ([688a3c1](https://github.com/aversini/auth-client/commit/688a3c1bd4136572d20574e26cf44ea1d6646612))

## [2.11.0](https://github.com/aversini/auth-client/compare/auth-common-v2.10.1...auth-common-v2.11.0) (2024-07-07)


### Features

* enabling access token fallback via secure cookie ([#79](https://github.com/aversini/auth-client/issues/79)) ([fc64e50](https://github.com/aversini/auth-client/commit/fc64e509c8cf149a14ae63354547d15fbd92bd0b))

## [2.10.1](https://github.com/aversini/auth-client/compare/auth-common-v2.10.0...auth-common-v2.10.1) (2024-06-29)


### Bug Fixes

* adding missing username key to common constants ([#59](https://github.com/aversini/auth-client/issues/59)) ([613ba8f](https://github.com/aversini/auth-client/commit/613ba8f926fa6b0ca36469d1a50b8580dcdd95e0))

## [2.10.0](https://github.com/aversini/auth-client/compare/auth-common-v2.9.0...auth-common-v2.10.0) (2024-06-29)


### Features

* adding decodeToken ([#57](https://github.com/aversini/auth-client/issues/57)) ([3d03af9](https://github.com/aversini/auth-client/commit/3d03af988be13eab5d9cdf6bd124fa0a6530786e))

## [2.9.0](https://github.com/aversini/auth-client/compare/auth-common-v2.8.0...auth-common-v2.9.0) (2024-06-28)


### Features

* adding common constant for refresh token ([#53](https://github.com/aversini/auth-client/issues/53)) ([600af2f](https://github.com/aversini/auth-client/commit/600af2fe835a3e486dd1a984af8e083eb0d7f2ec))

## [2.8.0](https://github.com/aversini/auth-client/compare/auth-common-v2.7.1...auth-common-v2.8.0) (2024-06-27)


### Features

* adding support for refresh tokens ([#51](https://github.com/aversini/auth-client/issues/51)) ([93c70b5](https://github.com/aversini/auth-client/commit/93c70b580b88db813ae2338c9d6f781e4f5ab07b))

## [2.7.1](https://github.com/aversini/auth-client/compare/auth-common-v2.7.0...auth-common-v2.7.1) (2024-06-27)


### Bug Fixes

* adding code request type and api type to common ([#49](https://github.com/aversini/auth-client/issues/49)) ([7a31f63](https://github.com/aversini/auth-client/commit/7a31f63e3420f50113d8be625e38c62f54e33075))

## [2.7.0](https://github.com/aversini/auth-client/compare/auth-common-v2.6.0...auth-common-v2.7.0) (2024-06-27)


### Features

* adding PKCE code challenge support ([#47](https://github.com/aversini/auth-client/issues/47)) ([3d28250](https://github.com/aversini/auth-client/commit/3d28250210ab254fefb93146577ab322b3c785e5))

## [2.6.0](https://github.com/aversini/auth-client/compare/auth-common-v2.5.0...auth-common-v2.6.0) (2024-06-26)


### Features

* adding common nonce custom JWT claim ([#40](https://github.com/aversini/auth-client/issues/40)) ([1beff57](https://github.com/aversini/auth-client/commit/1beff579f6e074063d2db5f4b06e5f01276293c6))

## [2.5.0](https://github.com/aversini/auth-client/compare/auth-common-v2.4.0...auth-common-v2.5.0) (2024-06-25)


### Features

* adding MVP support for access token ([#38](https://github.com/aversini/auth-client/issues/38)) ([a5a85fd](https://github.com/aversini/auth-client/commit/a5a85fda878670da64c7bb17aa39d36c333c6b06))

## [2.4.0](https://github.com/aversini/auth-client/compare/auth-common-v2.3.0...auth-common-v2.4.0) (2024-06-25)


### Features

* adding access and id token request type ([#36](https://github.com/aversini/auth-client/issues/36)) ([2c19bc3](https://github.com/aversini/auth-client/commit/2c19bc3da6d95898ec4a20a7f5452a6fb601d53f))

## [2.3.0](https://github.com/aversini/auth-client/compare/auth-common-v2.2.0...auth-common-v2.3.0) (2024-06-24)


### Features

* adding common constant for tokenId claims ([#30](https://github.com/aversini/auth-client/issues/30)) ([131aa70](https://github.com/aversini/auth-client/commit/131aa70b74bc4a2f6739cae5c1ef0ff2abcc9fa9))

## [2.2.0](https://github.com/aversini/auth-client/compare/auth-common-v2.1.0...auth-common-v2.2.0) (2024-06-24)


### Features

* moving verifyAndExtractToken to common package ([#28](https://github.com/aversini/auth-client/issues/28)) ([015b6df](https://github.com/aversini/auth-client/commit/015b6dfada0b8ecd2018819c62bb76e42cc3721e))

## [2.1.0](https://github.com/aversini/auth-client/compare/auth-common-v2.0.0...auth-common-v2.1.0) (2024-06-21)


### Features

* common JWT constants ([#19](https://github.com/aversini/auth-client/issues/19)) ([fccea00](https://github.com/aversini/auth-client/commit/fccea00a22abf9156676eb3cf2229c38f62ab82d))

## [2.0.0](https://github.com/aversini/auth-client/compare/auth-common-v1.0.1...auth-common-v2.0.0) (2024-06-17)


### ⚠ BREAKING CHANGES

* rename tenantId to clientId ([#12](https://github.com/aversini/auth-client/issues/12))

### Bug Fixes

* rename tenantId to clientId ([#12](https://github.com/aversini/auth-client/issues/12)) ([c340460](https://github.com/aversini/auth-client/commit/c3404604e21adc4cfdd062a6a0fb64415ba516bf))

## [1.0.1](https://github.com/aversini/auth-client/compare/auth-common-v1.0.0...auth-common-v1.0.1) (2024-06-17)


### Bug Fixes

* minor refactor ([#10](https://github.com/aversini/auth-client/issues/10)) ([e02c72c](https://github.com/aversini/auth-client/commit/e02c72c53141e9eec40f6c7e1779c8c40ec5b739))

## 1.0.0 (2024-06-15)


### Features

* adding auth-common to monorepo ([#6](https://github.com/aversini/auth-client/issues/6)) ([055844a](https://github.com/aversini/auth-client/commit/055844a27f8cac8cb88bb9fd6901c38acdbda5ec))
