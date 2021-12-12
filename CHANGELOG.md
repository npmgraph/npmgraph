# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.9.0](https://github.com/npmgraph/npmgraph/compare/v2.8.0...v2.9.0) (2021-12-12)


### Features

* shift-click modules to expand/collapse dependencies ([d255cb7](https://github.com/npmgraph/npmgraph/commit/d255cb7eaba62f5c30de148389bd46b3229c4e9b))
* shift-click modules to expand/collapse dependencies ([5aacc00](https://github.com/npmgraph/npmgraph/commit/5aacc00c3ae405ff78113ca60c1cad2fe82c9b16))
* shift-click modules to expand/collapse dependencies ([503e2fa](https://github.com/npmgraph/npmgraph/commit/503e2fa04fe25fbb57b2785e5be6d7dde2d914a6))


### Bug Fixes

* abort signal handling ([608ca64](https://github.com/npmgraph/npmgraph/commit/608ca641029ef7a1ef32d3847c595c2836389a1b))
* better shared state hook ([e5fe7c5](https://github.com/npmgraph/npmgraph/commit/e5fe7c56d20aa035d652cddecd05123b124403da))
* broken request error handling ([e8dc095](https://github.com/npmgraph/npmgraph/commit/e8dc0957f642410239d71df790b152abc31d94d2))
* center small graphs ([fd5a6b6](https://github.com/npmgraph/npmgraph/commit/fd5a6b608b4e1795dc4ea909b5b1871acddc689c))
* color-scheme on :root ([c5e0ec6](https://github.com/npmgraph/npmgraph/commit/c5e0ec6cc21021e4fd2a9ea4c0f95a3082fdfd2d))
* css var for tab text ([7ddee1d](https://github.com/npmgraph/npmgraph/commit/7ddee1d138dcd84b7604edef54e5e020bb37dd9d))
* empty query clears url params ([2ee57ff](https://github.com/npmgraph/npmgraph/commit/2ee57ff84b86f1e1c33ea733aac45f7fa2b6bbcf))
* ghost styling for peer dependencies ([2cdfdc3](https://github.com/npmgraph/npmgraph/commit/2cdfdc3f7a037ed5e3e50cee17db16749d802adb))
* graph nodes use theme colors ([a60f8f2](https://github.com/npmgraph/npmgraph/commit/a60f8f2826982b150c729ebf39ea593b15233ce5))
* improved graph rendering logic, fixes [#64](https://github.com/npmgraph/npmgraph/issues/64) ([a748976](https://github.com/npmgraph/npmgraph/commit/a7489766e4dcff9d1a30503c2ed876f349daf415))
* initial node selection ([17939c9](https://github.com/npmgraph/npmgraph/commit/17939c987cccf9e01734b371b92682d831cfbf83))
* less clunky expand/collapse ui ([8db56c9](https://github.com/npmgraph/npmgraph/commit/8db56c9ee785d5515c5c0bca8a782cd283d4bdf3))
* minor theme color issues ([c68a925](https://github.com/npmgraph/npmgraph/commit/c68a9258c5844cfa16e8e2c07f2e3a75cce18cf8))
* opacity ([27e87e4](https://github.com/npmgraph/npmgraph/commit/27e87e4a59743433c5fb1a5a900d2e610ed5ab8a))
* port to typescript ([c120d72](https://github.com/npmgraph/npmgraph/commit/c120d720503a926ae9060344162697f92ec53a4d))
* pr feedback ([1eb8a3e](https://github.com/npmgraph/npmgraph/commit/1eb8a3e66920701487e6256096f836b51441fc38))
* react hook errors, npmsio types ([630b349](https://github.com/npmgraph/npmgraph/commit/630b3499e7bf75fbd808983a0c603024c76809eb))
* remove theme-lite/theme-dark abstractions ([76670d4](https://github.com/npmgraph/npmgraph/commit/76670d44bcc1a5b756f6ac1837a1cc57f4c16d6c))
* restore :root background color ([fe8de7b](https://github.com/npmgraph/npmgraph/commit/fe8de7ba2e58bcdb6848b4658eb632f994b1eb4e))
* rm decodeURIComponent ([c55c37a](https://github.com/npmgraph/npmgraph/commit/c55c37a10c9c68c5ae2a557bb75d66b311ca62da))
* use Boolean to filter falsy values ([1ec4790](https://github.com/npmgraph/npmgraph/commit/1ec4790df140eff17bf310fa49259d60c9ad3f9b))

## [2.8.0](https://github.com/npmgraph/npmgraph/compare/v2.7.1...v2.8.0) (2021-04-15)

### Features

- add file picker for package.json ([#55](https://github.com/npmgraph/npmgraph/issues/55)) ([b6f9774](https://github.com/npmgraph/npmgraph/commit/b6f97745fd36f88ba3091898a8ad424fa67a7b05))
- CNAME for js.org domain config ([aa78254](https://github.com/npmgraph/npmgraph/commit/aa78254b8a185eba519269a48a7ae0537538f9db))

### Bug Fixes

- [#46](https://github.com/npmgraph/npmgraph/issues/46) ([f304873](https://github.com/npmgraph/npmgraph/commit/f304873234c780372c99cc426cec43f05fd4ad9e))
- fail gracefully if bugsnag fails to load ([4c92b06](https://github.com/npmgraph/npmgraph/commit/4c92b06415e28c6d181a1fae4c41dc921970497d))
- fix [#49](https://github.com/npmgraph/npmgraph/issues/49), plus misc. cleanup ([ccb63bd](https://github.com/npmgraph/npmgraph/commit/ccb63bdd17b96f424abb7d37272d367670736887))
- fix [#51](https://github.com/npmgraph/npmgraph/issues/51) ([d165fce](https://github.com/npmgraph/npmgraph/commit/d165fce4cd2bce4978602e457e3c7ca32b4cc99c))
- footer colors ([825c516](https://github.com/npmgraph/npmgraph/commit/825c51619335c5f755bf202edbe50c51630ab217))
- graph click handling ([832688d](https://github.com/npmgraph/npmgraph/commit/832688d215e213125fd0287864344a85427d4900))
- graph rendering working again ([eec0ce1](https://github.com/npmgraph/npmgraph/commit/eec0ce12f30165b4d7522a10a056de3673daf492))
- handle bugsnag load fail ([40a6f66](https://github.com/npmgraph/npmgraph/commit/40a6f6607c29247a3e491b35d21338ccd8a083b3))
- re-enable bugsnag reporting ([7a123ff](https://github.com/npmgraph/npmgraph/commit/7a123ff73c1c02f84a40bb5f4222e984078405c5))
- react import ([e7ea836](https://github.com/npmgraph/npmgraph/commit/e7ea836706af31b98cf916b420375ae372e5d4c9))
- search-field action ([04ba218](https://github.com/npmgraph/npmgraph/commit/04ba218cb5ddd82f8c8aee2ccd1ef6605fabd6c8))
- simplify x-component state sharing ([b9c2a8c](https://github.com/npmgraph/npmgraph/commit/b9c2a8c6c7d3ac52573727919508cd5020deaf5d))
- uncomment bugsnag script ([e3e1fb5](https://github.com/npmgraph/npmgraph/commit/e3e1fb551afa04a624a89bfae1a5d77fc4e36abe))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
