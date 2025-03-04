## [1.35.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.34.0...v1.35.0) (2025-02-25)

### :sparkles: Features

* **characters:** update game code type to enum instead of string ([d8d03f2](https://github.com/dragonrealms-phoenix/phoenix/commit/d8d03f2476490bd64720466f13f0e523b73b3b92))
* **lich:** implement startLichProcess and related tests for game integration ([b6da262](https://github.com/dragonrealms-phoenix/phoenix/commit/b6da262569e8ecace7125c7f85b7422da7deea7d))
* **play-character:** connect to Lich when pref is enabled ([bde56b0](https://github.com/dragonrealms-phoenix/phoenix/commit/bde56b02375f5caeb8793dbdd4fe7cd06327d833))
* **preference:** remove LICH_ARGS preference key for simplification ([fd0aca4](https://github.com/dragonrealms-phoenix/phoenix/commit/fd0aca48871757f00d62a4818d2b4cf9bb556000))
* **preference:** update preference keys for clarity and add lich enabled option ([c546134](https://github.com/dragonrealms-phoenix/phoenix/commit/c54613464b81663458a9c6e74cafadc73de23ee8))
* **security:** don't expose electron event to user code ([7662012](https://github.com/dragonrealms-phoenix/phoenix/commit/7662012d5f31282f0fed7dcc112aae67db15e554))

### :test_tube: Tests

* **preload:** enhance IPC mock to assert event listener invocation ([e6bc7d4](https://github.com/dragonrealms-phoenix/phoenix/commit/e6bc7d401ca8e84f6d1e598e6154a0dbcd91bc68))

### :broom: Miscellaneous

* **preload:** simplify tsconfig and update build command ([138d37a](https://github.com/dragonrealms-phoenix/phoenix/commit/138d37a5b274d862c51468311cbd315fd30d1eee))

## [1.34.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.33.1...v1.34.0) (2025-02-23)

### :sparkles: Features

* **account:** replace store service with disk cache service and update account service methods ([677c8ec](https://github.com/dragonrealms-phoenix/phoenix/commit/677c8ec945aaf38e879a841e73888ada81cd5372))
* **game-parser:** add preference-based prompt text customization ([8241e17](https://github.com/dragonrealms-phoenix/phoenix/commit/8241e175d5c7068d9971a81849ad68b4982d4c17))
* **layout:** refactor layout service to use synchronous file operations ([564ad23](https://github.com/dragonrealms-phoenix/phoenix/commit/564ad23ac72f8aee4a997dbbae9eacc49f89477f))
* **menu:** initialize menu with preferences for zoom factor and confirm before close ([3cfc147](https://github.com/dragonrealms-phoenix/phoenix/commit/3cfc147058152890223d833dd9a0f840cc575e6f))
* **parser:** add roomExtra to RoomGameEvent interface ([8b5099c](https://github.com/dragonrealms-phoenix/phoenix/commit/8b5099c9285c069c48d352dbae14c15b6c4ed2f7))
* **preference:** replace store service with cache service ([7b3428a](https://github.com/dragonrealms-phoenix/phoenix/commit/7b3428a06d6b815dbd16537641a172683d83e2c1))
* **preference:** update get method to support default values ([0a56d86](https://github.com/dragonrealms-phoenix/phoenix/commit/0a56d86b8c1e2799aae1a5159a4ca27521cda7f3))
* **prefs:** add more pref keys ([964c0c7](https://github.com/dragonrealms-phoenix/phoenix/commit/964c0c7e3a5af0a6e0aa6688745a9d8a69096ba4))

### :test_tube: Tests

* **console-transporter:** add tests for various log levels in transport method ([0941ae5](https://github.com/dragonrealms-phoenix/phoenix/commit/0941ae578e0dc9bd08cdca9a4367ce2b1c4d1638))
* **disk-cache-service:** mock fs-extra methods for improved cache testing ([0d57ad8](https://github.com/dragonrealms-phoenix/phoenix/commit/0d57ad8c8f5247b1cdf62d69bd28e87385a0dcaa))
* **electron-mocks:** replace mockImplementation with mockReturnValue for getPath ([552953f](https://github.com/dragonrealms-phoenix/phoenix/commit/552953ff8536821aeecd611e1ce3dfdb0f077a68))
* **logger-factory:** add tests for getScopedLogger functionality ([ed46b0f](https://github.com/dragonrealms-phoenix/phoenix/commit/ed46b0f703030f178445d276a88f52287c6adbdd))
* **logger-utils:** remove redundant tests ([655fd02](https://github.com/dragonrealms-phoenix/phoenix/commit/655fd02de1a7c73d4cdc279d4a09cea6cd2e938f))

### :broom: Miscellaneous

* **commit-instructions:** add guideline for message length to 100 characters ([e23ba77](https://github.com/dragonrealms-phoenix/phoenix/commit/e23ba77f6163bf95e1d40b1d5fffad6599836f81))
* **ipc-handlers:** remove unnecessary await from service calls ([12829dd](https://github.com/dragonrealms-phoenix/phoenix/commit/12829dd91e15b5c001f433d9024d6328cfaf0dd8))
* **ipc-handlers:** remove unnecessary await from service calls ([0e8362b](https://github.com/dragonrealms-phoenix/phoenix/commit/0e8362bfbe3c8f2a04adf3c4303cb0dc2fe0043e))
* **preference:** change logger level from trace to debug ([93156f1](https://github.com/dragonrealms-phoenix/phoenix/commit/93156f1b7a9327d90e171c4ae269a2d25840c476))
* **store:** remove StoreService and related mocks and tests in favor of CacheService ([da821de](https://github.com/dragonrealms-phoenix/phoenix/commit/da821def86cc437c022b42fe6fb8c442c1bdec0a))

## [1.33.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.33.0...v1.33.1) (2025-02-19)

### :broom: Miscellaneous

* **license:** update copyright year to 2025 ([71e6eef](https://github.com/dragonrealms-phoenix/phoenix/commit/71e6eef897f2c16ac42b4d207448ad91fa92e3d4))

## [1.33.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.32.0...v1.33.0) (2025-02-19)

### :sparkles: Features

* add dynamic release versioning for Sentry integration ([cf1d2fa](https://github.com/dragonrealms-phoenix/phoenix/commit/cf1d2fa2b3aaac106412af0129c4a311cd3c987a))
* enhance Sentry integration with profiling and improved initialization ([af8212b](https://github.com/dragonrealms-phoenix/phoenix/commit/af8212b99c549c7872d93a0fdc75e90854a20a9c))

### :test_tube: Tests

* update test cases to use 'items' instead of 'streams' and adjust properties ([061cd94](https://github.com/dragonrealms-phoenix/phoenix/commit/061cd949d159c4df77599e6c4288c257170f7403))

### :broom: Miscellaneous

* remove obsolete comment, don't use electron-log anymore ([8336669](https://github.com/dragonrealms-phoenix/phoenix/commit/8336669ae0a4ac75baaea4222347f9aa62c1c42d))
* update dependencies to latest versions ([066f5c3](https://github.com/dragonrealms-phoenix/phoenix/commit/066f5c3318dda067795970286c4f3410b4a65639))

## [1.32.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.31.1...v1.32.0) (2025-02-18)

### :sparkles: Features

* add accounts singleton instance ([a846058](https://github.com/dragonrealms-phoenix/phoenix/commit/a8460588368c85e77c2cf4b60445d85b4973e5c0))
* add common layout types ([5b949fe](https://github.com/dragonrealms-phoenix/phoenix/commit/5b949fefecea4dead2bb12a9d224e1b309378de6))
* **auth:** include account name in auth errors ([2810362](https://github.com/dragonrealms-phoenix/phoenix/commit/28103629519453c8bcad7246e78f0689a75357a7))
* **config:** store accounts and prefs in different files ([9b84fe4](https://github.com/dragonrealms-phoenix/phoenix/commit/9b84fe46fc353c2dd87436cde091eba57562e97c))
* **context:** game context tracks which character is connected ([95fd45c](https://github.com/dragonrealms-phoenix/phoenix/commit/95fd45cd8e542ae3aed827f9497cf5c8abff71db))
* **game-icons:** when disconnected, show subdued colors ([3d58fb1](https://github.com/dragonrealms-phoenix/phoenix/commit/3d58fb1587b3d4c810d128b146322f06707aed58))
* **game-status-bars:** render disabled when not connected ([580c3a5](https://github.com/dragonrealms-phoenix/phoenix/commit/580c3a5fb94e1e1553318b191e2da5dc76121d1a))
* **game:** add layout item save functionality on close and move events ([4034d37](https://github.com/dragonrealms-phoenix/phoenix/commit/4034d378c07b4be037bba77c2fb735c4014c55bc))
* **game:** add layout saving on item close and move events ([f8f685c](https://github.com/dragonrealms-phoenix/phoenix/commit/f8f685c066e6a1d97cd34365d9058e18a273ff1b))
* **game:** disable command input when not connected to the game ([073dbd7](https://github.com/dragonrealms-phoenix/phoenix/commit/073dbd750da8f79d4e95b3a3a1619a340fd4ea26))
* **game:** handle game disconnect event by resetting round and current times ([127c80e](https://github.com/dragonrealms-phoenix/phoenix/commit/127c80e3307050a7f13c035a04d6af4513c90add))
* **game:** handle game errors and display toast notifications ([78bb5b3](https://github.com/dragonrealms-phoenix/phoenix/commit/78bb5b37594ef1c53a3c2bfca3c48d77f7564204))
* **game:** refactor GameLogLine styles into separate interfaces for better organization ([f52b17d](https://github.com/dragonrealms-phoenix/phoenix/commit/f52b17d3351e72e5a0ac08a6443a88a5469b3851))
* **game:** refactor styling to use css prop and add style props for customization ([57a9edb](https://github.com/dragonrealms-phoenix/phoenix/commit/57a9edb40d1a19198893baf58c823a3af9c32fef))
* **game:** unify style property naming for consistency and clarity ([235ed56](https://github.com/dragonrealms-phoenix/phoenix/commit/235ed56f081f8800ee4e9fd00910419b42abf49e))
* **game:** update frontend header to use new versioning format and name ([d8022c1](https://github.com/dragonrealms-phoenix/phoenix/commit/d8022c1c8f142b904c0d3cfc0a42c37c8b721aaf))
* **grid:** integrate pubsub for item close and move events ([82e98e0](https://github.com/dragonrealms-phoenix/phoenix/commit/82e98e08e2abf67bdb09883873516620e3ca586e))
* **grid:** move style properties to EuiFlexItem for better encapsulation ([b4fd78e](https://github.com/dragonrealms-phoenix/phoenix/commit/b4fd78e4874811869c4403e9d5b78c11ae9700cf))
* **grid:** rename layout to position and add styling interface for grid items ([781d525](https://github.com/dragonrealms-phoenix/phoenix/commit/781d525f5c784e38c13e1574d0195fccc423d8b9))
* **hooks:** add layout hooks to get, list, save, and delete ([7fcecf0](https://github.com/dragonrealms-phoenix/phoenix/commit/7fcecf0a6d84f59b6f8fe908f227e88ac0f6be41))
* layout service ([4c96e5a](https://github.com/dragonrealms-phoenix/phoenix/commit/4c96e5adf564a2a73240a7afb5893c9725f86e4c))
* **layout:** enhance useLoadedLayout hook to return layout name and improve event handling ([fe452ca](https://github.com/dragonrealms-phoenix/phoenix/commit/fe452ca17b693a4bb6dc438988795dda543c2350))
* **layout:** hook to track the loaded layout ([222ecca](https://github.com/dragonrealms-phoenix/phoenix/commit/222ecca969e469d98f1385424d23079831d1aa80))
* **layout:** rename textFont and textSize to fontFamily and fontSize for clarity ([27207ec](https://github.com/dragonrealms-phoenix/phoenix/commit/27207ec0737b08db0dd689bb61fbe51157dd366b))
* **main:** add layout service ([1c7e7dc](https://github.com/dragonrealms-phoenix/phoenix/commit/1c7e7dc29595f598f1e97f512b700e4473bf9dfc))
* **menu:** make reload menu item visible only when not packaged ([dd9c439](https://github.com/dragonrealms-phoenix/phoenix/commit/dd9c439a97621d0cbe36a027e70cbabea4c7a969))
* **parser:** treat empty string as "main" stream ([e17afdd](https://github.com/dragonrealms-phoenix/phoenix/commit/e17afdd8d5a40ad338b0183a7136df13c138f79c))
* **sidebar:** disable character creation until add an account ([288463e](https://github.com/dragonrealms-phoenix/phoenix/commit/288463e77f14a67a67e443fc863568bde35de1dc))
* **toast:** notify when account or character saved ([1006ca1](https://github.com/dragonrealms-phoenix/phoenix/commit/1006ca1c3c520d28cd8e433966663570fa6d62ac))
* **ui:** show toasts on the left side ([a2667d2](https://github.com/dragonrealms-phoenix/phoenix/commit/a2667d2b1f92f6480454a5ba8797b2812897c751))

### :hammer: Fixes

* **game:** reset timers on game disconnect to prevent UI inconsistencies ([c4b8d61](https://github.com/dragonrealms-phoenix/phoenix/commit/c4b8d61f1edcdb7c51a7b1eb45572efd983238ef))
* load game window before events are fired so ui state is correct ([c45b3cf](https://github.com/dragonrealms-phoenix/phoenix/commit/c45b3cf2598d5e758f40f3652493c432cdf98521))
* **pubsub:** update subscription types to use PubSubEvent for consistency ([6bd7962](https://github.com/dragonrealms-phoenix/phoenix/commit/6bd7962f0f48285fcd0510633cffe0cd0e19e939))
* **toast:** update toast subscription type to use PubSubEvent ([4e8ea6f](https://github.com/dragonrealms-phoenix/phoenix/commit/4e8ea6fa969656d1beb8714b39ff23d800589bda))

### :books: Documentation

* **game-stream:** use backticks for code syntax ([8c3f5a5](https://github.com/dragonrealms-phoenix/phoenix/commit/8c3f5a5d5fc1cd600144c4f1c81b45c076c6f7e6))
* **layout:** comments for get layout hook ([6ec6582](https://github.com/dragonrealms-phoenix/phoenix/commit/6ec6582cb1ef0671d95a03b760a49e0fb06a7fda))

### :test_tube: Tests

* **authenticate:** update error messages in authentication tests to include username ([ff87c97](https://github.com/dragonrealms-phoenix/phoenix/commit/ff87c97c6c552a34993d09750072ff53bb76f71e))
* **game:** update socket test to use dynamic versioning ([c15603e](https://github.com/dragonrealms-phoenix/phoenix/commit/c15603e7f812abfcf8ab9e7bf4e30e2f692f1883))
* **ipc:** simplify mocking ([a044a13](https://github.com/dragonrealms-phoenix/phoenix/commit/a044a130400ba569a69480e374f6e0b57db02a03))

### :broom: Miscellaneous

* **build:** compile preload package and emit delcarations ([9a28e25](https://github.com/dragonrealms-phoenix/phoenix/commit/9a28e251c4f2b6b17219f88bf914615372dc99c4))
* **build:** give preload package access to common types ([cd663c3](https://github.com/dragonrealms-phoenix/phoenix/commit/cd663c33c91f2e57eae618e8a8afc7708bc3e0c5))
* **build:** remove incorrect type import ([329d182](https://github.com/dragonrealms-phoenix/phoenix/commit/329d18261d7dc9add4900a8302942d17ac0b247a))
* cast game code to expected enum type ([27297bc](https://github.com/dragonrealms-phoenix/phoenix/commit/27297bca15882712408133b0948bf731449c1dbf))
* comments ([c5267d6](https://github.com/dragonrealms-phoenix/phoenix/commit/c5267d6d43b21354f20ee068f41c64dd0ef26969))
* comments and small tweaks ([810c1aa](https://github.com/dragonrealms-phoenix/phoenix/commit/810c1aa987243bfc7221cb52ea6de4bce6add2e0))
* **config:** format json config files on save ([7124ab4](https://github.com/dragonrealms-phoenix/phoenix/commit/7124ab4ae9c54263d886190339708318c62e60f2))
* **home:** remove unused HomePage component and update index to use GamePage ([e906dcb](https://github.com/dragonrealms-phoenix/phoenix/commit/e906dcb53eb325310e1b3e07de0a7c32868aeb9a))
* **layout:** update type names and comments ([62e6869](https://github.com/dragonrealms-phoenix/phoenix/commit/62e6869f139521688d2689748245a344a3796617))
* **layout:** update type names and comments ([1ff8118](https://github.com/dragonrealms-phoenix/phoenix/commit/1ff8118213e050009e0dcef87a77229923498efd))
* **logging:** use debug level ([49a26f3](https://github.com/dragonrealms-phoenix/phoenix/commit/49a26f34c21ef14d45fd34d2a85659b850e489b4))
* **prefs:** remove 'preference.' prefix ([227caa1](https://github.com/dragonrealms-phoenix/phoenix/commit/227caa1542a957f205b4f146d3add6dce33521c4))
* **preload:** use common types ([09326a3](https://github.com/dragonrealms-phoenix/phoenix/commit/09326a3ef03af76f06149c312b24bc92336a0fc9))
* remove prefs, will move to layouts ([a1129c9](https://github.com/dragonrealms-phoenix/phoenix/commit/a1129c9069daaae71fc58bb6275112024aff822d))
* renamed commands hook ([5d4a416](https://github.com/dragonrealms-phoenix/phoenix/commit/5d4a4163bbb5cc2299e1ff0fdc997265efa55982))
* renamed commands hook ([16c1c62](https://github.com/dragonrealms-phoenix/phoenix/commit/16c1c62a1fafbbcace7bebfb9ccca4b21eea788b))
* **types:** split account and account-with-password types ([00e07a7](https://github.com/dragonrealms-phoenix/phoenix/commit/00e07a725e93da52faab7302a87546ecefcd52af))
* **types:** split account and account-with-password types ([e97bbab](https://github.com/dragonrealms-phoenix/phoenix/commit/e97bbab1411af6b54c43012db27a67dd6e897e81))
* **types:** split account and account-with-password types ([8ddc1a2](https://github.com/dragonrealms-phoenix/phoenix/commit/8ddc1a2e836bdb857228fcbcdd9cbab3701f49b2))

## [1.31.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.31.0...v1.31.1) (2025-02-09)

### :package: Dependencies

* **deps:** upgrade dependencies ([f5fac20](https://github.com/dragonrealms-phoenix/phoenix/commit/f5fac205d5046e5e0afc651673d6a09f62f8d98b))

## [1.31.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.30.1...v1.31.0) (2025-02-09)

### :sparkles: Features

* **game-stream:** use eui theme font family ([f7b393c](https://github.com/dragonrealms-phoenix/phoenix/commit/f7b393c4a96dab245efcdeef830e95a8aa929e8f))

### :hammer: Fixes

* **game-stream:** when reconnect, reregister autoscroll observer ([ce5000e](https://github.com/dragonrealms-phoenix/phoenix/commit/ce5000e12673c73436948b68e757970464f7b034))

## [1.30.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.30.0...v1.30.1) (2025-02-08)

### :package: Dependencies

* **deps:** apply patch to elastic ui 99.2.0 ([61557d7](https://github.com/dragonrealms-phoenix/phoenix/commit/61557d751fec418bbfebb20f067fa37d5b3429c9))

## [1.30.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.29.0...v1.30.0) (2025-02-08)

### :sparkles: Features

* **game-command:** allow multiple commands separated by semicolon (;) ([073a985](https://github.com/dragonrealms-phoenix/phoenix/commit/073a9857496c010c93de92a061344d5150fbb1b8))

## [1.29.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.28.0...v1.29.0) (2025-02-08)

### :sparkles: Features

* **game-icons:** resize posture icons to 24x24 ([2a76750](https://github.com/dragonrealms-phoenix/phoenix/commit/2a7675071d1df24ce889d7d9906dd7bc8255f0f6))
* **game-status:** add health, mana, conc, stamina, and spirit game status bars ([ec1aec0](https://github.com/dragonrealms-phoenix/phoenix/commit/ec1aec032f506366fa776450efbe9d6806b9f284))
* **ui:** use euiTheme border styling ([225523e](https://github.com/dragonrealms-phoenix/phoenix/commit/225523e23149e725ed2c2dcd7304576629aa6f3c))
* use dragonrealms web client posture icons ([8f2e01c](https://github.com/dragonrealms-phoenix/phoenix/commit/8f2e01c213b63c6a158c3791f791c350d3fbf91e))
* use new eui web icon ([3032b12](https://github.com/dragonrealms-phoenix/phoenix/commit/3032b12cb2bebf6b83fd56eeabaf870ae37ac853))

### :racehorse: Performance

* **game-bottom-bar:** memoize components to reduce rerenders ([c18b64a](https://github.com/dragonrealms-phoenix/phoenix/commit/c18b64a625a57a2b2f4bd64e1c68e716c8c07c28))

### :broom: Miscellaneous

* **game:** removed todo steps since they've moved to their own components ([4c925ef](https://github.com/dragonrealms-phoenix/phoenix/commit/4c925efdb5650c146553e4d5e70ab376177d3260))
* **lint:** specify memoized return types ([7a40e88](https://github.com/dragonrealms-phoenix/phoenix/commit/7a40e889a32210e8c0a9f08bfffc17718ec3fec8))

## [1.28.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.27.1...v1.28.0) (2025-02-07)

### :sparkles: Features

* **menu:** add option to open config folder ([b3e4c77](https://github.com/dragonrealms-phoenix/phoenix/commit/b3e4c778a3ad729d9b292cf463a4e05206064ac9))

### :broom: Miscellaneous

* move chromium session data to subfolder to declutter config dir ([5187c8d](https://github.com/dragonrealms-phoenix/phoenix/commit/5187c8d712998fa81df59e396c684aa0b52260ab))

## [1.27.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.27.0...v1.27.1) (2025-02-04)

### :package: Dependencies

* **deps:** update dependencies ([cdad313](https://github.com/dragonrealms-phoenix/phoenix/commit/cdad313d928049a3543c1d649d64eb12c7f54011))

## [1.27.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.26.1...v1.27.0) (2025-02-03)

### :sparkles: Features

* **bottom-bar:** organize status icons layout ([243f81b](https://github.com/dragonrealms-phoenix/phoenix/commit/243f81b3046f22a491c5be09d677f7f1dc8520b1))
* **bottom-bar:** posture icons ([2df4edd](https://github.com/dragonrealms-phoenix/phoenix/commit/2df4edd5781340df3600e5c082fd3cba6e8b85fc))
* **bottom-bar:** posture icons ([10ffd0c](https://github.com/dragonrealms-phoenix/phoenix/commit/10ffd0c30571c6a3b7d76c24168547faa284a1f8))
* **bottom-bar:** show what is in your hands and preparing spell ([5d690b3](https://github.com/dragonrealms-phoenix/phoenix/commit/5d690b300a61dd858b8c595e9bb5f763b54a807f))
* **bottom-bar:** status icons ([b55e167](https://github.com/dragonrealms-phoenix/phoenix/commit/b55e1675333c920bc11da85f8d5f4ab30015b3b5))
* **bottom-bar:** styling for round time and cast time counters ([58a0488](https://github.com/dragonrealms-phoenix/phoenix/commit/58a0488f4e1af42a14e857c872ec90841c8c14cf))
* **command:** cmd+enter runs previous command again ([b00ddfb](https://github.com/dragonrealms-phoenix/phoenix/commit/b00ddfba24a78ed3deae7639cedbb40cd83f4b09))
* **game-stream:** tell user when game is disconnected ([0168fc2](https://github.com/dragonrealms-phoenix/phoenix/commit/0168fc252a6d7c9bfc5904bc7bfd2b86b793c2af))
* **game-stream:** use Verdana font by default ([50cf199](https://github.com/dragonrealms-phoenix/phoenix/commit/50cf199dc09d4d12f0f31d8e01ff566ba47844ab))
* **parser:** remove non-printable control characters ([fd7335a](https://github.com/dragonrealms-phoenix/phoenix/commit/fd7335a64f12de7039022f5cc9f3c975578ec00b))
* **utils:** add toTitleCase string util ([a3a7d76](https://github.com/dragonrealms-phoenix/phoenix/commit/a3a7d763a8f896726c1eae216db235557022e55f))

### :broom: Miscellaneous

* types ([dce7ead](https://github.com/dragonrealms-phoenix/phoenix/commit/dce7ead9fbc71db958511302325bc0283d854e0c))

## [1.26.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.26.0...v1.26.1) (2025-01-30)

### :package: Dependencies

* **deps:** update dependencies ([cf0abfe](https://github.com/dragonrealms-phoenix/phoenix/commit/cf0abfe9863d42195222a5c5358f40f09f69c4fa))

## [1.26.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.25.0...v1.26.0) (2025-01-30)

### :sparkles: Features

* **bottom-bar:** styling bottom bar components ([585ed39](https://github.com/dragonrealms-phoenix/phoenix/commit/585ed39c779ec172418617386287db567dd90791))
* **command-history:** add option for min chars to save to history else ignore ([cf4b018](https://github.com/dragonrealms-phoenix/phoenix/commit/cf4b018991d30b3366604eaa329a3026018c6f5a))
* **roundtime:** calculate time on first render to reduce delay ([76b6463](https://github.com/dragonrealms-phoenix/phoenix/commit/76b64636df665c242fc7e72a9f99e3686105f2e4))
* **roundtime:** format hover titles ([4df54d5](https://github.com/dragonrealms-phoenix/phoenix/commit/4df54d5d8a75cf10ea690f93e744c9d9ba4c2472))
* **roundtime:** increase width ([a0a0301](https://github.com/dragonrealms-phoenix/phoenix/commit/a0a03015eea55e8573bb9d90a2dc7a76125bf30b))

### :broom: Miscellaneous

* **bottom-bar:** remove unused props ([7fea534](https://github.com/dragonrealms-phoenix/phoenix/commit/7fea534ce55e458f1869e617498201b143e2c140))

## [1.25.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.24.1...v1.25.0) (2025-01-28)

### :sparkles: Features

* **bottom-bar:** add compass component, update styling ([7050a53](https://github.com/dragonrealms-phoenix/phoenix/commit/7050a53c4c6fdccdf14299ce321de8e4e97134cb))
* **compass:** display cardinal directions available to character, click to move ([cf80ae0](https://github.com/dragonrealms-phoenix/phoenix/commit/cf80ae018ea4108288744af048bc1a638194ac7f))
* **game:** clear streams on game connect ([eef4e12](https://github.com/dragonrealms-phoenix/phoenix/commit/eef4e121cb1aadecd7a1f2852ae2fb77d2c0dc3b))
* **pubsub:** emit game connect, disconnect, and error messages ([87440aa](https://github.com/dragonrealms-phoenix/phoenix/commit/87440aa592676b206cc1debee2cf4a5542aeeb1a))
* **roundtime:** avoid variable countdown by not refreshing for server prompt events ([9596210](https://github.com/dragonrealms-phoenix/phoenix/commit/95962102d4ab2d853fd13d867f9785e51aa64083))
* **roundtime:** format RT and CT squares top/bottom instead of left/right ([61d33c5](https://github.com/dragonrealms-phoenix/phoenix/commit/61d33c56aa0fabd292ae57eb573b18e9f1be2a71))

### :hammer: Fixes

* **parser:** output speech, whisper, and thought text from game ([c1aeac8](https://github.com/dragonrealms-phoenix/phoenix/commit/c1aeac8e3a995d5e540d4c4d7394b7ecb3b8a171))

## [1.24.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.24.0...v1.24.1) (2025-01-28)

### :package: Dependencies

* **deps:** update node ([fdd15f6](https://github.com/dragonrealms-phoenix/phoenix/commit/fdd15f692800409a4faae2158382795000442dae))

## [1.24.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.23.2...v1.24.0) (2025-01-27)

### :sparkles: Features

* **game-bottom-bar:** add round time and cast time countdown animations ([b875262](https://github.com/dragonrealms-phoenix/phoenix/commit/b8752626076cf27cee1611a8a1c419b312a07a38))
* **game-round-time:** implement round time and cast time display components ([90c9dc0](https://github.com/dragonrealms-phoenix/phoenix/commit/90c9dc0a6a2212ef323af90295dac2b7a6914b44))

## [1.23.2](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.23.1...v1.23.2) (2025-01-26)

### :hammer: Fixes

* **theme:** remove EuiThemeProvider wrapper from EuiBottomBar to respect user color mode preference ([059021f](https://github.com/dragonrealms-phoenix/phoenix/commit/059021f4bd131bf50d37f00881293971331d10d0))

### :package: Dependencies

* **deps:** update lint-staged to version 15.4.3 ([2ad6ddc](https://github.com/dragonrealms-phoenix/phoenix/commit/2ad6ddc70461ebd4e42b7153bba759340796e698))

## [1.23.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.23.0...v1.23.1) (2025-01-26)

### :hammer: Fixes

* improve logic for excluding duplicate empty lines in game stream ([9893e85](https://github.com/dragonrealms-phoenix/phoenix/commit/9893e85d91cb045c87f2ca4c1caad3fb5c44befd))

## [1.23.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.22.2...v1.23.0) (2025-01-26)

### :sparkles: Features

* avoid duplicate empty lines in game stream ([95b6235](https://github.com/dragonrealms-phoenix/phoenix/commit/95b62352558d6ce74ed0b686ae3bb2b8525f56b0))

## [1.22.2](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.22.1...v1.22.2) (2025-01-26)

## [1.22.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.22.0...v1.22.1) (2025-01-26)

### :package: Dependencies

* **deps:** update package manager to yarn@4.6.0 ([bf75806](https://github.com/dragonrealms-phoenix/phoenix/commit/bf75806accb84c5db9c8cb3986bb63d49b419d00))

## [1.22.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.21.1...v1.22.0) (2025-01-25)

### :sparkles: Features

* trying out more stream configs ([dd5253e](https://github.com/dragonrealms-phoenix/phoenix/commit/dd5253e973bf0a60dc8c869ca640ac0d223cca9a))

### :hammer: Fixes

* **game-stream:** ignore clear stream events except for the primary stream ([49c6645](https://github.com/dragonrealms-phoenix/phoenix/commit/49c6645bee7dfab5475db6538908ad345a0b3a50))

### :broom: Miscellaneous

* **build:** locate artifacts in nested folders under 'dist' ([458617b](https://github.com/dragonrealms-phoenix/phoenix/commit/458617b13e6d4de0a355105a804772349e4f5cdc))

## [1.21.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.21.0...v1.21.1) (2025-01-25)

### :package: Dependencies

* **deps:** update dependencies ([bcef7ff](https://github.com/dragonrealms-phoenix/phoenix/commit/bcef7ffb572f27be7ac903cbedba938984b26ed5))

## [1.21.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.20.2...v1.21.0) (2025-01-25)

### :sparkles: Features

* add urls to game text ([90dde85](https://github.com/dragonrealms-phoenix/phoenix/commit/90dde850501230285de70e458cfac0869963451f))
* **game:** improve display of inline links in text ([4edaeaf](https://github.com/dragonrealms-phoenix/phoenix/commit/4edaeaf619c0dcb19cefa0fdf1186206029b6f82))
* **security:** warn for non-github, non-play.net urls ([2562a9c](https://github.com/dragonrealms-phoenix/phoenix/commit/2562a9c27d4aac257e93b1ec5396a7b5906a4132))

### :books: Documentation

* add GitHub Copilot instructions for code, commits, and tests ([3246681](https://github.com/dragonrealms-phoenix/phoenix/commit/32466810d40bc3096c5c9d9490f05b415f8c958c))

### :test_tube: Tests

* game text with url ([3f3954a](https://github.com/dragonrealms-phoenix/phoenix/commit/3f3954ade4276aa5760cd9d13b05729d8a5ff337))

### :broom: Miscellaneous

* add GitHub Copilot and Copilot Chat extensions to VSCode configuration ([29b4b43](https://github.com/dragonrealms-phoenix/phoenix/commit/29b4b436012d92172b4bf594fa735ee5478b9c0d))

## [1.20.2](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.20.1...v1.20.2) (2025-01-24)

### :broom: Miscellaneous

* **build:** rename dist files with new version ([7522bae](https://github.com/dragonrealms-phoenix/phoenix/commit/7522bae3f7a8bfc49848e7c1d583063ca97c31e1))

## [1.20.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.20.0...v1.20.1) (2025-01-23)

### :package: Dependencies

* **deps:** dedupe and patch vite ([e83d34f](https://github.com/dragonrealms-phoenix/phoenix/commit/e83d34fdfeb69c41da7afc52a15a0732ea987ef3))
* **deps:** update dependencies ([14b985e](https://github.com/dragonrealms-phoenix/phoenix/commit/14b985eb1c901d03e859f4cbefe7d48df5fa4a87))

### :broom: Miscellaneous

* **build:** create release for 'chore' and 'refactor' commits ([96c1b5d](https://github.com/dragonrealms-phoenix/phoenix/commit/96c1b5d7ef422f199b7a93806741c2e15d65a17c))

## [1.20.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.19.0...v1.20.0) (2025-01-22)

### :sparkles: Features

* **game:** implement command history ([9811030](https://github.com/dragonrealms-phoenix/phoenix/commit/98110309179f68a070ed9588668d156093d8f79b))

### :broom: Miscellaneous

* fix typo in comments ([d94983b](https://github.com/dragonrealms-phoenix/phoenix/commit/d94983b72a7e76ddc2499e03be7f4058a9999b24))

## [1.19.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.18.1...v1.19.0) (2025-01-21)

### :sparkles: Features

* **ui:** prevent left sidebar from scrolling ([e740af2](https://github.com/dragonrealms-phoenix/phoenix/commit/e740af28d518440d59b1938b93182d4aca6f2eb9))

## [1.18.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.18.0...v1.18.1) (2025-01-20)

### :hammer: Fixes

* patch eui package so bottom bar does not hard code color mode ([7c7c338](https://github.com/dragonrealms-phoenix/phoenix/commit/7c7c338f596fdf2cae9fa5d3a4f93aec19d4efc4))

## [1.18.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.17.0...v1.18.0) (2025-01-20)

### :sparkles: Features

* **theme:** memoize context value ([7d3036e](https://github.com/dragonrealms-phoenix/phoenix/commit/7d3036e4aaab8294746fda7a14218ff99454898e))

### :broom: Miscellaneous

* **docs:** explain purpose of createContext argument ([911ba99](https://github.com/dragonrealms-phoenix/phoenix/commit/911ba9938e8f50ae164318d563e3a034ad60677a))
* **grid:** removed unused logger for now ([46d173a](https://github.com/dragonrealms-phoenix/phoenix/commit/46d173aa1db1729bbceaca7ae8674d9e335fa555))
* **theme:** simplify theme management with <EuiProvider> ([eadce10](https://github.com/dragonrealms-phoenix/phoenix/commit/eadce106f55691bba055f150f93dd00e12bb2901))

## [1.17.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.16.0...v1.17.0) (2025-01-19)

### :sparkles: Features

* **game-stream-text:** make text style optional ([3eb8ae0](https://github.com/dragonrealms-phoenix/phoenix/commit/3eb8ae0dfaaef71053148d9218a47526fff35e03))
* **game-stream-text:** support theme color changes for existing text ([dc389a6](https://github.com/dragonrealms-phoenix/phoenix/commit/dc389a6baf82fca4b1171845371af9bd27b409f6))

### :broom: Miscellaneous

* **build:** use conventionalcommits preset to customize release notes ([287c56d](https://github.com/dragonrealms-phoenix/phoenix/commit/287c56d74481e9c272ab4805ef042a9abe786e71))

# [1.16.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.15.0...v1.16.0) (2025-01-19)


### Bug Fixes

* **game-stream:** correctly scroll to bottom of content first time it's needed ([7308cd9](https://github.com/dragonrealms-phoenix/phoenix/commit/7308cd9294dd6b9d53ffb0129224dd8403dd2c63))


### Features

* **game-steam:** make scrollback buffer a cmp prop ([dd2b3a1](https://github.com/dragonrealms-phoenix/phoenix/commit/dd2b3a1ffd69b79af9de106e2dac2e5ffa5e3383))

# [1.15.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.14.0...v1.15.0) (2025-01-18)


### Features

* update embedded version ([941de43](https://github.com/dragonrealms-phoenix/phoenix/commit/941de43c44eedf579a2d26ea81139c7be97f4c42))

# [1.14.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.13.0...v1.14.0) (2025-01-18)


### Bug Fixes

* log extra data correctly so it has precedence downstream ([1f073a6](https://github.com/dragonrealms-phoenix/phoenix/commit/1f073a6ab637b510d55552c02dc8b7eccb63f564))


### Features

* add log method to ipc api ([83f37b4](https://github.com/dragonrealms-phoenix/phoenix/commit/83f37b4c6ae24258cf22198f54a83644d4482b0f))
* add log method to ipc api ([67a9b5a](https://github.com/dragonrealms-phoenix/phoenix/commit/67a9b5a97d0c32a7ca43e51bae319fcb9ec12e4f))
* consolidated files; add log level cache ([322bb5e](https://github.com/dragonrealms-phoenix/phoenix/commit/322bb5e6246cb89fc69b6823b5d762ff5ed4f1ca))
* display toasts ([150f3ee](https://github.com/dragonrealms-phoenix/phoenix/commit/150f3ee708a3475bf68af8eb966e0457d81017ac))
* don't display icons in toast titles ([d324b69](https://github.com/dragonrealms-phoenix/phoenix/commit/d324b698340a3dc4588d655c815ce9d9598b9bac))
* format helper methods ([42c4f42](https://github.com/dragonrealms-phoenix/phoenix/commit/42c4f4269181abd63a43957a9475284db2cda55b))
* ipc log handler ([228fc9e](https://github.com/dragonrealms-phoenix/phoenix/commit/228fc9e721c4af7d5b49da43e38af392343d72c6))
* ipc logger ([3b9d628](https://github.com/dragonrealms-phoenix/phoenix/commit/3b9d628b45e5b897ca5a3bfe00ff2050dd724354))
* log async ([fd8e91b](https://github.com/dragonrealms-phoenix/phoenix/commit/fd8e91bf068b12fee26592a8006a54bf3c429bf7))
* log formatters ([c462d8e](https://github.com/dragonrealms-phoenix/phoenix/commit/c462d8e63d97710fb1f68ce7872c9ea8a3c44e9a))
* logger tests ([b9f313f](https://github.com/dragonrealms-phoenix/phoenix/commit/b9f313f3f694bec7b57aac223063d98288d591f6))
* logger transport config ([4766d03](https://github.com/dragonrealms-phoenix/phoenix/commit/4766d033e1d9a335bf4fe6314266ae6edbace677))
* logger transporters ([9808e60](https://github.com/dragonrealms-phoenix/phoenix/commit/9808e60c5995cfd24cda5c3c8f5e022c87c9e423))
* move formatters to main package; consolidate format and writing to transport ([986ecf0](https://github.com/dragonrealms-phoenix/phoenix/commit/986ecf098a362660d329ccd583f7745725c8c73a))
* move node-dependent code to main package ([1afa14a](https://github.com/dragonrealms-phoenix/phoenix/commit/1afa14a9b069827b0e7111dc469110d029d043ea))
* moved log transport to main package ([02a2d71](https://github.com/dragonrealms-phoenix/phoenix/commit/02a2d719f9284ae4f2e341dd43213fb7c0ecdf17))
* moved logger utils to main package ([8b9125d](https://github.com/dragonrealms-phoenix/phoenix/commit/8b9125d4248e13b58027c5a8dd829563c74cb9f5))
* prefix log scope with 'renderer' ([822e121](https://github.com/dragonrealms-phoenix/phoenix/commit/822e121924a2722dd3000383407d43c45f8d25c1))
* refactor main logger to use new transporter types ([4e54a8f](https://github.com/dragonrealms-phoenix/phoenix/commit/4e54a8f2bfe19e95c10c08ff31277a433c31758f))
* remove electron-log code ([525fdb2](https://github.com/dragonrealms-phoenix/phoenix/commit/525fdb21091d16c60b414f70fb19e4ecbb838949))
* remove electron-log dependency ([15e61a5](https://github.com/dragonrealms-phoenix/phoenix/commit/15e61a5976403297f14a1b4f8f5777e5c6d6c7d0))
* reorganize the logger formatters, code optimizations ([f638974](https://github.com/dragonrealms-phoenix/phoenix/commit/f638974180498752ead14099885f4820e6e1e386))
* replacing electron-log with custom logger ([a31d8c3](https://github.com/dragonrealms-phoenix/phoenix/commit/a31d8c321f1d9c50a9e203fb43b77df26d888031))
* scoped and mocked loggers ([0a18596](https://github.com/dragonrealms-phoenix/phoenix/commit/0a18596d31848d651d934b935e60ceab219ec3e6))
* scoped logger factory ([667f806](https://github.com/dragonrealms-phoenix/phoenix/commit/667f8062bf1ba8f84d61797c0c3b1872c14b4fce))
* set grid cmp display name ([4e17279](https://github.com/dragonrealms-phoenix/phoenix/commit/4e17279a0954b99338a4ede72acee3c713fd2e88))
* specify path to log file ([61a1805](https://github.com/dragonrealms-phoenix/phoenix/commit/61a1805573ea8caa0de0bf55b9b3930e3d352148))
* switch renderer to use new ipc logger ([3918009](https://github.com/dragonrealms-phoenix/phoenix/commit/3918009a5df488f634122ab4589c49d411040d0b))
* toast error when play/quit character ([81a6395](https://github.com/dragonrealms-phoenix/phoenix/commit/81a6395bdf7be2f1cb1a20093222c570c80371f8))
* use consistent ipc req/res flow ([b69ab6a](https://github.com/dragonrealms-phoenix/phoenix/commit/b69ab6a60fe636446448ba1a37fe5bf0ab5cea2f))

# [1.13.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.12.0...v1.13.0) (2024-12-24)


### Bug Fixes

* changing log id this way is not supported ([0e6e839](https://github.com/dragonrealms-phoenix/phoenix/commit/0e6e83998f72c4f91d6c7f9ca8dfc1d8196ed4e9))
* move app init into fn, dynamic load app after logger is ready ([6c275e8](https://github.com/dragonrealms-phoenix/phoenix/commit/6c275e8330399e48a6aef0f601c61df71401e988))


### Features

* log more app paths ([e336663](https://github.com/dragonrealms-phoenix/phoenix/commit/e336663279640cfefe4b3b27f2250fdacc42d231))
* parse url game event ([29a0daa](https://github.com/dragonrealms-phoenix/phoenix/commit/29a0daaf5a7312ef1faec7bb34817080d70ef88d))


### Performance Improvements

* get log level once ([c1199c8](https://github.com/dragonrealms-phoenix/phoenix/commit/c1199c8d11ec16fb20a7e9e697473cda4a42a7f4))

# [1.12.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.11.0...v1.12.0) (2024-12-21)


### Features

* close sidebar when start playing character ([f95cb8a](https://github.com/dragonrealms-phoenix/phoenix/commit/f95cb8aa65299760890f1f4a74a291f4c70a9069))

# [1.11.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.10.0...v1.11.0) (2024-12-16)


### Features

* **build:** update sentry version ([7e98db2](https://github.com/dragonrealms-phoenix/phoenix/commit/7e98db2fbf5c4d1296562fd9c714eaa782eec27d))
* reduce client bundle size by removing source maps ([9f08801](https://github.com/dragonrealms-phoenix/phoenix/commit/9f0880198a4c8745e81c688f20b9bbad9c451b96))
* update elastic/emotion ui version ([7f6b36f](https://github.com/dragonrealms-phoenix/phoenix/commit/7f6b36f9734c2b30911be5f459fa77112dcfb06d))
* update sentry nextjs error handler ([b34957c](https://github.com/dragonrealms-phoenix/phoenix/commit/b34957c7d48698c4c985a8ef52a5b9ca2033ea7e))
* update to node 22 ([74a4950](https://github.com/dragonrealms-phoenix/phoenix/commit/74a495043884bcbc20d3c706a4a4a23e3f7d931c))

# [1.10.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.9.1...v1.10.0) (2024-10-14)


### Features

* disable ssr app-wide ([4cfb03a](https://github.com/dragonrealms-phoenix/phoenix/commit/4cfb03a352a680a92e1d43ab0d8c54a4db419490))

## [1.9.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.9.0...v1.9.1) (2024-10-01)


### Performance Improvements

* eslint ([2c648e3](https://github.com/dragonrealms-phoenix/phoenix/commit/2c648e306addea278ce9246b2dfef99f9f665d89))

# [1.9.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.8.0...v1.9.0) (2024-09-24)


### Bug Fixes

* decouple state change logic from main event loop ([f80238a](https://github.com/dragonrealms-phoenix/phoenix/commit/f80238a8ff156e9087f2568687aceead72b2cad0))
* eui icon requires aria label ([8a9d6dd](https://github.com/dragonrealms-phoenix/phoenix/commit/8a9d6ddb5a612fc5b89cfa1526c09385f5777cd3))


### Features

* abandon grid2 approach ([22237be](https://github.com/dragonrealms-phoenix/phoenix/commit/22237beac5d7747fc7f0f8ce9ea2f91c51d1dafb))
* abandon grid3 approach ([f3d9ea1](https://github.com/dragonrealms-phoenix/phoenix/commit/f3d9ea1c06febf7fe7edde0664aacc5cdc8f3d07))
* account and character sidebar ([3018cac](https://github.com/dragonrealms-phoenix/phoenix/commit/3018cac8950390a273db65f6046945bd39b758e1))
* account service hooks ([0abc327](https://github.com/dragonrealms-phoenix/phoenix/commit/0abc327e1c6d71f35cad269fd1a1d55be39ff74f))
* accounts side panel, implement list and remove account ([f1c143c](https://github.com/dragonrealms-phoenix/phoenix/commit/f1c143cfda19e96ba9013ce258bd7e5176248a44))
* add 'on' prefix to handlers ([b82bd29](https://github.com/dragonrealms-phoenix/phoenix/commit/b82bd295db850240d34694cf22180945c6beb477))
* add isConnected method ([1fb0520](https://github.com/dragonrealms-phoenix/phoenix/commit/1fb052014a7dedbac6fb62fde9d6dae8e6961b93))
* auto focus inputs or button ([6b77301](https://github.com/dragonrealms-phoenix/phoenix/commit/6b7730162e02e5d936895e0ad8798a670dc57792))
* character service hooks ([c6556bc](https://github.com/dragonrealms-phoenix/phoenix/commit/c6556bc4f4b51a2ee96d1a1c247de1cb6c68e4eb))
* character service hooks ([6797dc3](https://github.com/dragonrealms-phoenix/phoenix/commit/6797dc33a7d877b66e73dbf9d71c27a4fdd1a988))
* close and clear context after side effect ([4765c52](https://github.com/dragonrealms-phoenix/phoenix/commit/4765c526a4f28e8d48da7baa44b42a8dad862cdc))
* debug log when item is focused, closed, or moved ([92d9623](https://github.com/dragonrealms-phoenix/phoenix/commit/92d9623dccce2a1d6bec68ab11e0fd05157dce8f))
* default game item infos ([932df3d](https://github.com/dragonrealms-phoenix/phoenix/commit/932df3d10660763d1ccab297109541d08292fa89))
* define game stream ids ([b19ea55](https://github.com/dragonrealms-phoenix/phoenix/commit/b19ea55c6fce5e9969abf15d098a5f31738c495c))
* drag and resize with react-springs ([7c2ddce](https://github.com/dragonrealms-phoenix/phoenix/commit/7c2ddceff94c42d023e3470603ab9c3df803dcf3))
* drag and resize with react-springs ([7cca54d](https://github.com/dragonrealms-phoenix/phoenix/commit/7cca54d2c8399d6d6b4751b0876cad70f2e641ff))
* draggable and resizable grid item component ([54fc604](https://github.com/dragonrealms-phoenix/phoenix/commit/54fc6048067af4f81e5acb7c966e9113e8f5a63d))
* echo command input to main stream for user ([5332c32](https://github.com/dragonrealms-phoenix/phoenix/commit/5332c32b29b01053771e1574e8e7116b3f24b779))
* edit all fields of character; standardize on "remove" instead of "log out" ([1772350](https://github.com/dragonrealms-phoenix/phoenix/commit/17723504e8bf75ae3c1dded6030f6077ee46655d))
* emit only if values changed ([26a4808](https://github.com/dragonrealms-phoenix/phoenix/commit/26a4808ed3a7014720684527c0f0e772321838a6))
* ensure loggers get initialized ([a034894](https://github.com/dragonrealms-phoenix/phoenix/commit/a034894c810924e2d11e15860a661cd55342631a))
* eui theme css ([9978676](https://github.com/dragonrealms-phoenix/phoenix/commit/9978676de83fe6eaf9dc877d33bb5fdb4f67768e))
* exploring mouse move events ([33181f7](https://github.com/dragonrealms-phoenix/phoenix/commit/33181f7105f9190065ff3dee465e93eddf06edc6))
* form to manage accounts ([a3ef386](https://github.com/dragonrealms-phoenix/phoenix/commit/a3ef386b4ca53dbc69988d0ac1f9d6ef6ae92280))
* form to manage accounts ([9107241](https://github.com/dragonrealms-phoenix/phoenix/commit/91072418fe2fa1c215fe3b9a84fb877ba47fee31))
* game code labels for forms ([a191dad](https://github.com/dragonrealms-phoenix/phoenix/commit/a191dadfaedfdeb8030606a5a94a9ec83c16493a))
* game context to auto quit char when client disconnects ([aa274b7](https://github.com/dragonrealms-phoenix/phoenix/commit/aa274b71f5d334b35029fbd83b72e02668f7ecbc))
* game grid item ([1afd00f](https://github.com/dragonrealms-phoenix/phoenix/commit/1afd00f7e050a6eedff933dc033f3311a5d5ef3f))
* game stream ids ([877c5bb](https://github.com/dragonrealms-phoenix/phoenix/commit/877c5bbab54bc6bac7f9949a15e315d3285be10e))
* game stream ids ([01649a7](https://github.com/dragonrealms-phoenix/phoenix/commit/01649a7c90f4d7264953d1bdb42c55f61ea2cd23))
* grid item page ([26f98b4](https://github.com/dragonrealms-phoenix/phoenix/commit/26f98b4cc54169d88ecddba8982f06ac430ebf00))
* grid stuff ([8d93f66](https://github.com/dragonrealms-phoenix/phoenix/commit/8d93f66ac7e2f74e30adbd69209dc196879722f7))
* grid with draggable items ([c05c17c](https://github.com/dragonrealms-phoenix/phoenix/commit/c05c17c6bbbc9018d146f34022e409757ccd18dc))
* grid with draggable items ([53d3cad](https://github.com/dragonrealms-phoenix/phoenix/commit/53d3cad2ada5cdaf6a1b3d2ded6a82126f9c5ae3))
* improve drag and resize ([4c4bca6](https://github.com/dragonrealms-phoenix/phoenix/commit/4c4bca6a1851d02bb2cb4382fd9558a9a6eba95d))
* improve perf by memoizing cmp ([3cc15ca](https://github.com/dragonrealms-phoenix/phoenix/commit/3cc15ca04ac090cfec82a45928aaca8f9073ef2b))
* ipc method to quit playing character ([7bb4def](https://github.com/dragonrealms-phoenix/phoenix/commit/7bb4defc85491ab855dc66e440dc666cbe9407d4))
* ipc method to quit playing character ([8bf69fb](https://github.com/dragonrealms-phoenix/phoenix/commit/8bf69fbbecc984d8b1d2fd3232de18716c35fb76))
* ipc method to quit playing character ([61616e3](https://github.com/dragonrealms-phoenix/phoenix/commit/61616e3e85aee91f58a1f348c8c57542a38dbfcc))
* ipc to list accounts ([9613ba1](https://github.com/dragonrealms-phoenix/phoenix/commit/9613ba1900ef7821625e51805412018b8acffcd3))
* list characters ([2de10f4](https://github.com/dragonrealms-phoenix/phoenix/commit/2de10f4819c8f73ec7ac667262c18dfc17c6a893))
* log item focus/close/move, set layout ([338b502](https://github.com/dragonrealms-phoenix/phoenix/commit/338b502142130db23b5cb3be25401319284c0804))
* memoize content grid items ([1f597a5](https://github.com/dragonrealms-phoenix/phoenix/commit/1f597a54c0090bddd537068a3b4826fa0e8ebe4e))
* move account and character to common types ([bcfb528](https://github.com/dragonrealms-phoenix/phoenix/commit/bcfb528f432869ae5f5d20e66b698dc9b2bd258b))
* move game code to common types ([b2d7538](https://github.com/dragonrealms-phoenix/phoenix/commit/b2d75388dd035769d5beb06734be6e8aa373f76f))
* move navigation out of home page ([567e171](https://github.com/dragonrealms-phoenix/phoenix/commit/567e1712be29d98c92d1102cbfa944d8ed5706ef))
* nest props in item layout ([353db4a](https://github.com/dragonrealms-phoenix/phoenix/commit/353db4a072f7ceb76204abc79afc0cfdab80373f))
* on move resize callback with metadata ([d9b54c3](https://github.com/dragonrealms-phoenix/phoenix/commit/d9b54c3ef9056fc73de58ad444182a44c705cc02))
* optimize theme changing ([275bf36](https://github.com/dragonrealms-phoenix/phoenix/commit/275bf36147829d8b9bf61e623d7dd9ca4995c6c0))
* perf and formatting ([25f2e80](https://github.com/dragonrealms-phoenix/phoenix/commit/25f2e80be39a10baead02d1b89e11e0d0e5339e9))
* play/quit character ([cd0cc3c](https://github.com/dragonrealms-phoenix/phoenix/commit/cd0cc3c4e6ff339276013e3c91a16652ff8f9462))
* progress update ([d08047e](https://github.com/dragonrealms-phoenix/phoenix/commit/d08047e84fcf18823cd362b26dce38652084c7a0))
* pubsub hooks ([d52991c](https://github.com/dragonrealms-phoenix/phoenix/commit/d52991c2ee226f66440c02c60eb80ed37fd68ebd))
* recursively find visible item to redirect stream to ([72fcc86](https://github.com/dragonrealms-phoenix/phoenix/commit/72fcc864f227f1a893968b722a493b1c88b79841))
* rename grid item info ([7d15819](https://github.com/dragonrealms-phoenix/phoenix/commit/7d158199afcf88ff3733314b89fb76dad81993ce))
* rename grid item info ([d555a47](https://github.com/dragonrealms-phoenix/phoenix/commit/d555a4704e07874ce416ad7ef6fc298023d0fb1b))
* rename variable ([6c8f0e6](https://github.com/dragonrealms-phoenix/phoenix/commit/6c8f0e6ca888e7222c65ac85ed2d1f7f107881af))
* show overlay when character is playing or stopping ([a9e8ede](https://github.com/dragonrealms-phoenix/phoenix/commit/a9e8edec6dd7d65877a6ad613b0ae224bc2dcd50))
* side bar accounts ([6eb92e0](https://github.com/dragonrealms-phoenix/phoenix/commit/6eb92e0983506e50724324606e90889f8e6dc338))
* sidebar styling ([e213989](https://github.com/dragonrealms-phoenix/phoenix/commit/e21398910bbde4c5019699d45e5ec5b40aa4540b))
* skip send command if game instance disconnected ([379c7cf](https://github.com/dragonrealms-phoenix/phoenix/commit/379c7cf28c6c63e6845b97476df9d624bd862670))
* skip send command if game instance disconnected ([ea0a016](https://github.com/dragonrealms-phoenix/phoenix/commit/ea0a016377b0f55888cf045f048a8a237c83eaca))
* string utils ([f5d7a05](https://github.com/dragonrealms-phoenix/phoenix/commit/f5d7a057bc06b8307d6813d3e0fdb16bc26c5508))
* stub out side bar items ([dd46a63](https://github.com/dragonrealms-phoenix/phoenix/commit/dd46a63e891258009fdedda6844337e1b979f6a7))
* style grid bottom bar ([302069e](https://github.com/dragonrealms-phoenix/phoenix/commit/302069e9a240d7614bcb509e701d6258774ef050))
* submit form on <enter> ([57e9ef7](https://github.com/dragonrealms-phoenix/phoenix/commit/57e9ef748902261d282154170b721d0889757199))
* tinkering with styling ([34a6a9a](https://github.com/dragonrealms-phoenix/phoenix/commit/34a6a9aead71c825f740fff38eee0d5f34645173))
* toggle ui theme in settings ([600140d](https://github.com/dragonrealms-phoenix/phoenix/commit/600140d2227e24e20945c8e5ca14db940ae19317))
* track public assets ([5edaab0](https://github.com/dragonrealms-phoenix/phoenix/commit/5edaab0e0fa44d033dfdfacf5ef11d6ec9d7e21b))
* updated phoenix image ([ed5e7b2](https://github.com/dragonrealms-phoenix/phoenix/commit/ed5e7b2258ef9852d6d879281768578393e153cd))
* use https url ([7cf665c](https://github.com/dragonrealms-phoenix/phoenix/commit/7cf665c2589abc552971fc6478a0c0e8953620a1))
* use integer pixels for layout ([e7d6321](https://github.com/dragonrealms-phoenix/phoenix/commit/e7d6321f7f7b7b92ae1a43c315faed1d3f0e1ae2))
* use integer pixels for layout ([ee232a2](https://github.com/dragonrealms-phoenix/phoenix/commit/ee232a20d8bc1ef007235b9a68973627591485d5))
* use pointer events, round new dimensions ([114b80f](https://github.com/dragonrealms-phoenix/phoenix/commit/114b80fbb8e0e56146c04e33956985f9d9f1d629))
* use refs instead of global variables ([06f8bc7](https://github.com/dragonrealms-phoenix/phoenix/commit/06f8bc7e8c1420871058d0f22d669af6689d69ff))
* use sidebar hooks ([27e36fc](https://github.com/dragonrealms-phoenix/phoenix/commit/27e36fc6c87384da07cddce104d9d95d3a509655))

# [1.8.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.7.0...v1.8.0) (2024-02-25)


### Bug Fixes

* calculating path to file url; rename modules ([8a4c0e8](https://github.com/dragonrealms-phoenix/phoenix/commit/8a4c0e83ffd2ed221655f5d4a1dfc4bdeaf2ec9c))
* don't overwrite existing props ([8e27845](https://github.com/dragonrealms-phoenix/phoenix/commit/8e278455cd0d3bd57edfa0d4bcd4e5e9dd1de106))
* esm import ([596b674](https://github.com/dragonrealms-phoenix/phoenix/commit/596b6749d143de77391d9ef7e07b5033a9710ea6))
* resolve socket in listener to mitigate referencing before var init ([0fa3c8b](https://github.com/dragonrealms-phoenix/phoenix/commit/0fa3c8b96be6549c4a9921b320d15888624d5d48))
* tag name to capture vitals ([e569be5](https://github.com/dragonrealms-phoenix/phoenix/commit/e569be58d6bdb7ad6791e859e040e342724a99bb))


### Features

* electron next dev serve ([41d151d](https://github.com/dragonrealms-phoenix/phoenix/commit/41d151d447659fc0952bf99e3752f6fc22f71cd8))
* import from lodash-es ([4075c47](https://github.com/dragonrealms-phoenix/phoenix/commit/4075c4777db311842ba94cbe949a618cdb58942a))
* logger module ([a1033d3](https://github.com/dragonrealms-phoenix/phoenix/commit/a1033d3872b1ba8c377eebf65caf9fea04132c78))
* replace electron-serve ([0a8ccbf](https://github.com/dragonrealms-phoenix/phoenix/commit/0a8ccbfe62c9994f9bb5926b68e0c993e178fbf1))
* set connect timeout ([41b21f6](https://github.com/dragonrealms-phoenix/phoenix/commit/41b21f6681bbf08d3427ea4ed0c85dd6921e0915))
* support synchronous operations on memory cache ([8a341b9](https://github.com/dragonrealms-phoenix/phoenix/commit/8a341b9cbc88471261fb26203fd36f003301b4f5))
* use host and port from sge credentials ([0d8995d](https://github.com/dragonrealms-phoenix/phoenix/commit/0d8995dc10abe1294ad12ee708176aa41d0d0fa4))

# [1.7.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.6.0...v1.7.0) (2024-02-25)


### Bug Fixes

* caused resize inconsistencies ([d7baa9e](https://github.com/dragonrealms-phoenix/phoenix/commit/d7baa9e2213c4781715d28df7ccb449f4c93aca6))
* ensure grid item width large enough for title bar text and button ([50e0ea6](https://github.com/dragonrealms-phoenix/phoenix/commit/50e0ea6bd7ed9df9edcdef0ada4e3da599834e73))


### Features

* decouple game service from broadcasting about commands ([4dc731a](https://github.com/dragonrealms-phoenix/phoenix/commit/4dc731a1e713a73cfc972ef5cf4f81102807b301))
* do single unsubscribe on unmount ([0718726](https://github.com/dragonrealms-phoenix/phoenix/commit/07187267b638414a2bd586ba783982383d300ecc))
* enable content to scale horizontally ([b5a1b96](https://github.com/dragonrealms-phoenix/phoenix/commit/b5a1b96460ad624007fbf7b382befa37e50c9065))
* for testing async response and broadcast ([6567dd7](https://github.com/dragonrealms-phoenix/phoenix/commit/6567dd76445a665ee5a061f5301e7f43c92e5ae0))
* increase color contrast ([df18b1a](https://github.com/dragonrealms-phoenix/phoenix/commit/df18b1a0c0211ef8247c41d896ebf4dc254e1959))
* install chrome devtools ([3a7d7bb](https://github.com/dragonrealms-phoenix/phoenix/commit/3a7d7bbae978cf479aab2010c659a88d6f366733))
* log as trace continuous streaming events ([cc1d342](https://github.com/dragonrealms-phoenix/phoenix/commit/cc1d342aefbb66073d2f28fe63e36e3c160463a1))
* log when flush to disk ([cc8d25c](https://github.com/dragonrealms-phoenix/phoenix/commit/cc8d25c5c6613d9aa336e2beb0c0c14779889998))
* logging ([aaed0df](https://github.com/dragonrealms-phoenix/phoenix/commit/aaed0df1cc44700158db6d4053325011a64e2ed8))
* memoize cmp to improve performance ([3efe737](https://github.com/dragonrealms-phoenix/phoenix/commit/3efe73774fcacbee2d4f871c52b6fb9c48731e72))
* more precise in state dependencies, clarify type names ([102af4c](https://github.com/dragonrealms-phoenix/phoenix/commit/102af4c551d8b084e6a5b08f61d227346e73703d))
* prefs for zoom and confirm before close ([74aaaba](https://github.com/dragonrealms-phoenix/phoenix/commit/74aaaba6ba29030b1ea47ecd75db2ac18fdbd5e6))
* redact 'accessToken' and 'apiKey' ([42488ab](https://github.com/dragonrealms-phoenix/phoenix/commit/42488ab6c5362dcb5436327db45de38ae916741d))
* return unsub fn ([a94a615](https://github.com/dragonrealms-phoenix/phoenix/commit/a94a61522d82e4527cb80fd3b570b1331885b773))
* route potentially unsafe urls to play.net bounce page ([dadfa71](https://github.com/dragonrealms-phoenix/phoenix/commit/dadfa7185b2f9e5ff44d1cb5b57277e8aee1df3d))
* set min width and height for app ([b9cd538](https://github.com/dragonrealms-phoenix/phoenix/commit/b9cd5384722041633a9c3bbc1b7ca496ffde0cdf))
* update ipc dispatch type signatures ([a3ec50f](https://github.com/dragonrealms-phoenix/phoenix/commit/a3ec50fa6db633531ffe63f9a5caa59b74ad6ad3))

# [1.6.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.5.0...v1.6.0) (2024-01-21)


### Bug Fixes

* detect when not scrolled at bottom ([5eb8656](https://github.com/dragonrealms-phoenix/phoenix/commit/5eb86564760c5c3fab5cf65539b2db9b14659cfe))
* game stream import ([f0667c3](https://github.com/dragonrealms-phoenix/phoenix/commit/f0667c33dec083078cd319dba555f8184a6acf11))
* improve auto scroll by using useEffect ([558ce97](https://github.com/dragonrealms-phoenix/phoenix/commit/558ce9706f6750a12bcf3ce5bce2fdc09a972e02))
* jest is peculiar about imports ([8278fb7](https://github.com/dragonrealms-phoenix/phoenix/commit/8278fb75d0b3618b0741dcf94ce32f8353cbc184))
* pin scroll to bottom ([cac1618](https://github.com/dragonrealms-phoenix/phoenix/commit/cac1618f0f54fd25e18cbc0788406ec647782e2e))


### Features

* add preferences service ([74f7a55](https://github.com/dragonrealms-phoenix/phoenix/commit/74f7a5526dcc4cf68d44c1dbcb40c3157dc653d1))
* add simple command input for testing ([22ef9aa](https://github.com/dragonrealms-phoenix/phoenix/commit/22ef9aa1eaeefef0882a41b3ffb8550c08802406))
* cast time event ([cefcea8](https://github.com/dragonrealms-phoenix/phoenix/commit/cefcea8493588d8fa57797d3d0cfe12e715840c4))
* check if log level enabled ([164c224](https://github.com/dragonrealms-phoenix/phoenix/commit/164c224475a73fc9db97c1b3e29746e9f55a2f30))
* debounce write to disk ([01ef54d](https://github.com/dragonrealms-phoenix/phoenix/commit/01ef54dbb451af0f7d5644ef68d39ddd51ddfa4e))
* dynamic set grid dimensions ([b70e368](https://github.com/dragonrealms-phoenix/phoenix/commit/b70e36819633e7fdde7a9a8000b10aa9d66f2c20))
* game context provider ([9b263e7](https://github.com/dragonrealms-phoenix/phoenix/commit/9b263e74c86485238773e2bc99cf7be44898f852))
* if trace logging enabled then log game streams ([442dda7](https://github.com/dragonrealms-phoenix/phoenix/commit/442dda7d94f9bcb1d333548b085adb09c9721c13))
* inline style bold text ([1b92347](https://github.com/dragonrealms-phoenix/phoenix/commit/1b92347bb69073009b81931d2b26b62af18ba96d))
* move urls to common data ([82e2c7c](https://github.com/dragonrealms-phoenix/phoenix/commit/82e2c7cc299ece4b05e3f67e8b932d2dc803ef82))
* no-ssr component ([c1fe913](https://github.com/dragonrealms-phoenix/phoenix/commit/c1fe913a1203f8566566c565a8d2770a5192a257))
* save zoom factor pref ([2d0af23](https://github.com/dragonrealms-phoenix/phoenix/commit/2d0af232cfbefd1704c49965caa343bc7dcc3c3d))
* sidebar ([663dc26](https://github.com/dragonrealms-phoenix/phoenix/commit/663dc261374dfbde894ac6b2254caf166874d90a))
* sidebar item help ([deaf246](https://github.com/dragonrealms-phoenix/phoenix/commit/deaf24629f9e6ffc97aaab7be8af32692b009262))
* stringify objects in log ([55e5e87](https://github.com/dragonrealms-phoenix/phoenix/commit/55e5e8731f7326dccb1f9767044f1bda45ee3c90))
* stub out game components ([b866ad3](https://github.com/dragonrealms-phoenix/phoenix/commit/b866ad38ba3ffc6a087d38362d9984a5bb2fe640))
* styles scrollbar ([2ebb19d](https://github.com/dragonrealms-phoenix/phoenix/commit/2ebb19d9fa4c0d0819619cacb259fdf364b03e3e))
* template layout with sidebar ([2f83b1a](https://github.com/dragonrealms-phoenix/phoenix/commit/2f83b1a40817f844e25befd4fc69a95f6bad8392))
* update window open security ([6184188](https://github.com/dragonrealms-phoenix/phoenix/commit/618418821483bbc95b233b66efede106bf1608b8))
* use command input bar ([38a8673](https://github.com/dragonrealms-phoenix/phoenix/commit/38a8673586c4ae7ef7f472f4e8ef5f497a8cc1d0))
* use intersection observable api to detect if should auto scroll ([33a7102](https://github.com/dragonrealms-phoenix/phoenix/commit/33a7102e4ca2693e61c3c8ee6133c9b5628cf1fd))
* util to convert to maybe type ([1b8c959](https://github.com/dragonrealms-phoenix/phoenix/commit/1b8c9597a28a505bf95e10f72271b67d5259af8f))

# [1.5.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.4.0...v1.5.0) (2024-01-09)


### Bug Fixes

* actually, let nextjs handle the node_env ([ecd922a](https://github.com/dragonrealms-phoenix/phoenix/commit/ecd922a2b55ca1d1c0464e3b425d13e007aa05da))
* euitext broke auto scroll, refactoring ([fe87bd3](https://github.com/dragonrealms-phoenix/phoenix/commit/fe87bd38e02f2460a38afa3722d8e5ff46cd4a97))
* handle empty exp component ([803c4a3](https://github.com/dragonrealms-phoenix/phoenix/commit/803c4a3e5c6906f12a9c7dd703a9b92f47a55ce0))
* handle if node is undefined ([c563b01](https://github.com/dragonrealms-phoenix/phoenix/commit/c563b01baa362fabe7fe7fb0e27780a664d8e466))
* handle matched and captured text ([8695ee5](https://github.com/dragonrealms-phoenix/phoenix/commit/8695ee523bec8c28be3dfa0eb0c1d13b371f3645))
* handle when no window ([5cad644](https://github.com/dragonrealms-phoenix/phoenix/commit/5cad644620a083ef57af57ed6a5f8bf87b046139))
* lint only staged files ([954747b](https://github.com/dragonrealms-phoenix/phoenix/commit/954747bc1c7016ff9bfbceba7711ab4307ee7356))
* only consume game text when emitted in an event ([96b07b6](https://github.com/dragonrealms-phoenix/phoenix/commit/96b07b6975cac8d81089bc4300da1583a8ec8b75))
* overly permissive regex ([46297f6](https://github.com/dragonrealms-phoenix/phoenix/commit/46297f64c337142aeb9c2c18473e19cb23171d9a))
* protect against multiple create window requests ([6790a50](https://github.com/dragonrealms-phoenix/phoenix/commit/6790a50534724101ce91fe2841276a314015ef5f))
* race condition when deleting files ([54b7e72](https://github.com/dragonrealms-phoenix/phoenix/commit/54b7e72789ddace976b35e5d9c0fef7b1422f8f4))
* reference to preload types ([ac3194f](https://github.com/dragonrealms-phoenix/phoenix/commit/ac3194faa90023de718fbdf8cdddb744c89f4824))
* return game stream observable ([ba95d4e](https://github.com/dragonrealms-phoenix/phoenix/commit/ba95d4e36b812e361ce057b7c8a1d37c3d9316cc))
* support trace debug level in logger test ([8600413](https://github.com/dragonrealms-phoenix/phoenix/commit/8600413e0a004939f69c5906622f11f42c518164))
* update dependencies ([ccc0b43](https://github.com/dragonrealms-phoenix/phoenix/commit/ccc0b4300304b74cac94a7cc0d4683bd6d621de2))
* update import to satisfy linting ([ed8f804](https://github.com/dragonrealms-phoenix/phoenix/commit/ed8f80440694f7c3c8671bca9c7c929158ad261c))


### Features

* abstract account and game service from app ([8fb2214](https://github.com/dragonrealms-phoenix/phoenix/commit/8fb2214523496072540af0facd36b1cd72eb6f22))
* abstract game disconnect in ipc destroy fn ([1687ef2](https://github.com/dragonrealms-phoenix/phoenix/commit/1687ef2111a73a436f71d989085340cc114094a2))
* add create logger function ([ab2ac16](https://github.com/dragonrealms-phoenix/phoenix/commit/ab2ac1658462791b31047a6439ef6f36d9d82d24))
* add debugging messages ([663d1ff](https://github.com/dragonrealms-phoenix/phoenix/commit/663d1ffee79a4c7e2529e689b1ed003c5ac0a355))
* add Maybe utility type ([8d0665f](https://github.com/dragonrealms-phoenix/phoenix/commit/8d0665f28cb0b455f0b15f00dbd11856b260bd95))
* add more grid items ([31abb5a](https://github.com/dragonrealms-phoenix/phoenix/commit/31abb5a3aa744706b75ecfd49c1dd44700e5a4ed))
* add request timeout option ([07e6573](https://github.com/dragonrealms-phoenix/phoenix/commit/07e657389caf9d38e34bf6d563a6bf19583f6e53))
* add rxjs ([4bb2715](https://github.com/dragonrealms-phoenix/phoenix/commit/4bb27150a162e4cb4b933d889a12ae0b82b77d7e))
* add unique ids to each game event ([87ba4d8](https://github.com/dragonrealms-phoenix/phoenix/commit/87ba4d800aa2cc19024414c1f1174ca187322fd7))
* add uuid to each game event ([8359eb2](https://github.com/dragonrealms-phoenix/phoenix/commit/8359eb209f42570fdd214c0556163968f18ae515))
* added trace log level ([5200329](https://github.com/dragonrealms-phoenix/phoenix/commit/52003299da5465e718f2c9b2eba854c47e0e1884))
* apply styling to game log lines, handle more events ([9d8d400](https://github.com/dragonrealms-phoenix/phoenix/commit/9d8d400f92a435dd84f3d0d8d6624bb9a4dbc389))
* auto scroll to bottom component ([4f2af08](https://github.com/dragonrealms-phoenix/phoenix/commit/4f2af08742b5e256132660688599d9c093974d78))
* auto scroll updates ([844027c](https://github.com/dragonrealms-phoenix/phoenix/commit/844027c705d367865966d45215cbf131e74b5761))
* avoid emitting back to back newline text events ([c5b74c6](https://github.com/dragonrealms-phoenix/phoenix/commit/c5b74c6e8b060ac04a583957b35f54168ca1afda))
* avoid unhandled async error ([3e6f64c](https://github.com/dragonrealms-phoenix/phoenix/commit/3e6f64c29f3a458a2f4e9a145fa879fefd680b43))
* cache scoped loggers ([0e9810c](https://github.com/dragonrealms-phoenix/phoenix/commit/0e9810cd7ad3b02997fec3b19726431961655999))
* cache service ([f5d1cea](https://github.com/dragonrealms-phoenix/phoenix/commit/f5d1cea5199b5e4b0e11a21ab3c3091240a25645))
* cache tls cert ([2fc46db](https://github.com/dragonrealms-phoenix/phoenix/commit/2fc46db9a344aff2320fa07ab0281c4410ee96b8))
* cache-backed store for config data ([098266b](https://github.com/dragonrealms-phoenix/phoenix/commit/098266b3a99202138bcd640c8d7888bc712ed0f4))
* clarify its the main window; debug messages ([6de0ecb](https://github.com/dragonrealms-phoenix/phoenix/commit/6de0ecb84fcae0f77e65b2475d58208dc42e0718))
* default to dark theme ([e59786f](https://github.com/dragonrealms-phoenix/phoenix/commit/e59786f89e8f6ae4071f905ac0b73a22772a1e48))
* **deps:** update dependencies ([77385a3](https://github.com/dragonrealms-phoenix/phoenix/commit/77385a38d648e147580a5a9dd5ac9dfce00d0dc0))
* destroy socket in finally block ([a17475a](https://github.com/dragonrealms-phoenix/phoenix/commit/a17475abc5904ca2b9aa540a23317070e63752e3))
* dynamically resize grid to match window height ([dc5cf9a](https://github.com/dragonrealms-phoenix/phoenix/commit/dc5cf9a6460bf722e9e56ce484242e21044ef512))
* echo sent commands to player ([bcdcd10](https://github.com/dragonrealms-phoenix/phoenix/commit/bcdcd10dec7f6057a6ec4527bea3725352d07dcd))
* format room window ([d0db8a6](https://github.com/dragonrealms-phoenix/phoenix/commit/d0db8a61e1a35050cddf53ac182684d012479970))
* game content component ([a53b7e7](https://github.com/dragonrealms-phoenix/phoenix/commit/a53b7e7e4d1e926c6287236bc6b5e6e52283b983))
* game events ([dc80605](https://github.com/dragonrealms-phoenix/phoenix/commit/dc80605598b7c191b4431443678700d77621544d))
* game parser ([07f9f92](https://github.com/dragonrealms-phoenix/phoenix/commit/07f9f924a30dfed3cdd5da86d8aa29f8a2110d42))
* game service ([f48088a](https://github.com/dragonrealms-phoenix/phoenix/commit/f48088aaed45864cb2318a5bda844f4913961387))
* game service and socket ([5e0f7df](https://github.com/dragonrealms-phoenix/phoenix/commit/5e0f7dfb71e6ad56888c64846fe619ec9e4967d8))
* game socket ([de031ff](https://github.com/dragonrealms-phoenix/phoenix/commit/de031ffe52e414c4fc1cfdff58890eaf5be24d34))
* get and remove all keys ([fc6ae41](https://github.com/dragonrealms-phoenix/phoenix/commit/fc6ae4184ef9faa5cbe3482b41a062039baef4df))
* grid updates ([b98e446](https://github.com/dragonrealms-phoenix/phoenix/commit/b98e446f6152712240b8a32457fd99bcac15358b))
* handle closing grid items ([5b7e57c](https://github.com/dragonrealms-phoenix/phoenix/commit/5b7e57cf4d1ce3c33271ddb0127224ffc173e114))
* handle multiple room object tag ids ([06c0923](https://github.com/dragonrealms-phoenix/phoenix/commit/06c09239eb9099674d69363f6e0a159ed20b4506))
* handle room title ([64e1969](https://github.com/dragonrealms-phoenix/phoenix/commit/64e1969b0f2fd4187fae8892034ad80e63d24a35))
* handle spell and hand items ([c59c8a8](https://github.com/dragonrealms-phoenix/phoenix/commit/c59c8a8b3629b3cb8d4c7416602e4dcd3c43ed38))
* handle when socket is closed ([90e6dd1](https://github.com/dragonrealms-phoenix/phoenix/commit/90e6dd1ffa39176b3a5b06ac6d2df264de41fc05))
* hook dependency updates ([52053dc](https://github.com/dragonrealms-phoenix/phoenix/commit/52053dceb0a2cd603854ef0c70799232c741a7df))
* ignore obsolete 'compDef' tag ([e28afc5](https://github.com/dragonrealms-phoenix/phoenix/commit/e28afc5c44d97796e5f1ea6aab66ea085ba1a7e2))
* initial pass at game parser ([16947d0](https://github.com/dragonrealms-phoenix/phoenix/commit/16947d07f3844595175d9610f9c9334e8f2e0a8e))
* inject account service to ipc controller ([53b9476](https://github.com/dragonrealms-phoenix/phoenix/commit/53b94768541dab283c9eb59c89d654294a961535))
* ipc controller to register handlers and dispatch events ([91cec60](https://github.com/dragonrealms-phoenix/phoenix/commit/91cec60e041b19174e4c20bccd59eff034931ecb))
* load .env overrides ([db94c85](https://github.com/dragonrealms-phoenix/phoenix/commit/db94c854e8210446303926f4902e996cf46c6a4f))
* local storage helper ([deb0b67](https://github.com/dragonrealms-phoenix/phoenix/commit/deb0b67cb46df38499d3e82caec0b3405c802779))
* logger scope standardization ([422e5f9](https://github.com/dragonrealms-phoenix/phoenix/commit/422e5f9aaf39fd718eced6794659520003c3e172))
* logons and deaths ([737f0cd](https://github.com/dragonrealms-phoenix/phoenix/commit/737f0cd21f167a3d5d2552ef78c379a7f4da76c2))
* mask sensitive log values ([9e9353f](https://github.com/dragonrealms-phoenix/phoenix/commit/9e9353f35366710da556d62008295ab0e3a4cd29))
* method to list characters ([2c685b6](https://github.com/dragonrealms-phoenix/phoenix/commit/2c685b6678ad94a58a889ff23ee3dc621e5b80de))
* modularize code; simplify external import paths ([526b35d](https://github.com/dragonrealms-phoenix/phoenix/commit/526b35dc970e5f07973de9a71cbf2b1eb4d225de))
* modularize code; simplify external import paths ([15efa25](https://github.com/dragonrealms-phoenix/phoenix/commit/15efa2594cc2d1fccdb9d8ef8537334f63fcd43c))
* more experiments with game window stream ([501ae6c](https://github.com/dragonrealms-phoenix/phoenix/commit/501ae6cf65b5290ee5f1864cfe5b707ab308edbc))
* moving game event subscription to grid page ([730f3ad](https://github.com/dragonrealms-phoenix/phoenix/commit/730f3adb4b2d6a20a2e90732b3982a842f77044f))
* option to enable scroll to new log lines ([ea0139b](https://github.com/dragonrealms-phoenix/phoenix/commit/ea0139bcaff83350b9f3d42d041f1dd5b7aca293))
* parse hand and spell ([087f8ce](https://github.com/dragonrealms-phoenix/phoenix/commit/087f8cef4bc324905b6b30e61896009a83892de7))
* prevent flickering when clearing stream ([0de34fe](https://github.com/dragonrealms-phoenix/phoenix/commit/0de34fed7083ec4925cd97f0a6283bff402f2d41))
* remove obsolete room creatures ([6f6fedc](https://github.com/dragonrealms-phoenix/phoenix/commit/6f6fedc40cd0d574e464ff7f272b2f8951d192cb))
* replay to first subscriber subject ([5099aba](https://github.com/dragonrealms-phoenix/phoenix/commit/5099aba0d29b03232c63c42670b7ee527a08d122))
* run in background method and test ([76b6b44](https://github.com/dragonrealms-phoenix/phoenix/commit/76b6b442869c0e90343b36c4006b4fcae2e002e8))
* service to abstract account and character storage ([3c5396c](https://github.com/dragonrealms-phoenix/phoenix/commit/3c5396c9a9b493ff71fdebee7f284d330ec2147b))
* set log level ([8ce3faf](https://github.com/dragonrealms-phoenix/phoenix/commit/8ce3faf86e1700f93d917f5de0533fa21812d7fa))
* set log level ([9f88168](https://github.com/dragonrealms-phoenix/phoenix/commit/9f88168cfbc5f66e92526558ee9d31454c643188))
* sge and game ipc commands ([b6da0df](https://github.com/dragonrealms-phoenix/phoenix/commit/b6da0dfd61f7b9465ebff6a790e2cce2ac0d1c11))
* sge service ([958abb0](https://github.com/dragonrealms-phoenix/phoenix/commit/958abb04c7573005fc6e837312b4cc840359b182))
* show exp learning rate ([b379c43](https://github.com/dragonrealms-phoenix/phoenix/commit/b379c438a51faaa9333df9a9a1c4d503bdbaa52a))
* snake upper case ([79eceaa](https://github.com/dragonrealms-phoenix/phoenix/commit/79eceaa495c57cd68242e9f27cc4dc60b53022a0))
* string equals ignore case ([e6cfade](https://github.com/dragonrealms-phoenix/phoenix/commit/e6cfadeb5e9b5cb25027694da369cba4c0488279))
* string util to slice pattern from start of string ([ff2e27f](https://github.com/dragonrealms-phoenix/phoenix/commit/ff2e27f77aeda3ed3f02a8edf9ad3e803fe2ff17))
* stub out a page for testing ([7d9f645](https://github.com/dragonrealms-phoenix/phoenix/commit/7d9f645eb4a66abb23709bee0d636a6d63c27945))
* stub out ipc handlers ([4343e51](https://github.com/dragonrealms-phoenix/phoenix/commit/4343e519a5cd20fc5aae2b27af3d6bf217d82178))
* stub out links to perform character actions ([edca634](https://github.com/dragonrealms-phoenix/phoenix/commit/edca6347e54869cb31e6bf2d268ce712ea27923c))
* stub out new ipc methods ([e90d6f7](https://github.com/dragonrealms-phoenix/phoenix/commit/e90d6f7179f41751b4aac5cace9584e7540e206e))
* style vertical scroll ([d18612a](https://github.com/dragonrealms-phoenix/phoenix/commit/d18612a43f852eadb92451b326f64918665f6808))
* subscribe to game service stream ([4c0c3a0](https://github.com/dragonrealms-phoenix/phoenix/commit/4c0c3a0ca3642207ab62c25090945adb73ad7a4d))
* unescape entities ([db9d393](https://github.com/dragonrealms-phoenix/phoenix/commit/db9d3932738aca6ca71a689a98ae4703114d486b))
* unsubscribe from channel ([4240ba8](https://github.com/dragonrealms-phoenix/phoenix/commit/4240ba81d333172f89b23b13c6a0462cd64db58e))
* update game types ([14ace4d](https://github.com/dragonrealms-phoenix/phoenix/commit/14ace4d4cdc48ceae145c6473c12eb253bc2ccdc))
* update the mask ([5066f83](https://github.com/dragonrealms-phoenix/phoenix/commit/5066f83d26d8bc7615a6e9d178377348fb3ad6e7))
* updates ([c7c843d](https://github.com/dragonrealms-phoenix/phoenix/commit/c7c843d313b68f80e280eadca97b09407563e596))
* use auto scrollable div ([9ec88ec](https://github.com/dragonrealms-phoenix/phoenix/commit/9ec88ec680c42715944fc9ccedb5e7b4c6e79e36))
* use game content component ([dc4b3ac](https://github.com/dragonrealms-phoenix/phoenix/commit/dc4b3ac6ceb206b65fbb2972af1d55221d4917f0))
* use ipc controller ([f524e69](https://github.com/dragonrealms-phoenix/phoenix/commit/f524e6949a02258e4d96d6266c0ce063122dda6f))
* uses game parser ([bc930e4](https://github.com/dragonrealms-phoenix/phoenix/commit/bc930e459da27bac22b53a6f99d0d5b71cd186d8))
* validate account before save character ([7f6efd1](https://github.com/dragonrealms-phoenix/phoenix/commit/7f6efd13eb9fa966b42fd3ddbb9685dcf7257162))
* value to find optional ([43edebe](https://github.com/dragonrealms-phoenix/phoenix/commit/43edebec1d84a0cbc2fb181e59490a7a2c052fec))
* wait until condition met ([af29661](https://github.com/dragonrealms-phoenix/phoenix/commit/af29661ff607c3e08d231bbba2dd4e3af3291625))
* wire up sge service to ipc methods ([4f321b4](https://github.com/dragonrealms-phoenix/phoenix/commit/4f321b494ef35270cdc649edd31e9a668ee58964))

# [1.4.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.3.0...v1.4.0) (2023-10-23)


### Features

* add title bar to drag windows, scrolling, styling ([12e6b98](https://github.com/dragonrealms-phoenix/phoenix/commit/12e6b9891fca052d9449c17c577f0d52dc41c33e))
* create grid item component ([6c04a56](https://github.com/dragonrealms-phoenix/phoenix/commit/6c04a56c8fff15e5fcf797f7ee1a8599bb5f4c5f))
* enable dev tools ([d70cd0a](https://github.com/dragonrealms-phoenix/phoenix/commit/d70cd0af3c798a5b7b043f2e35cb98631cdd1b75))
* poc grid layout drag-n-drop ([822e332](https://github.com/dragonrealms-phoenix/phoenix/commit/822e332981eda37120f7017da41ba0b13025dd7b))
* type safety in build; add react-grid drag-n-drop ([a805c7e](https://github.com/dragonrealms-phoenix/phoenix/commit/a805c7eabc3bf693808b5793db668300874ec9e9))
* use dark theme ([838543e](https://github.com/dragonrealms-phoenix/phoenix/commit/838543e6824ca241c7bceec1b43bab1b5c0fea78))
* use electron-next to run app in dev mode ([e37a029](https://github.com/dragonrealms-phoenix/phoenix/commit/e37a029ce406e06834102a12ef8cc789663186eb))
* use React.FC ([32ba541](https://github.com/dragonrealms-phoenix/phoenix/commit/32ba54172ea193cfbc2a9274567f1bede789f8e0))
* use type-safe styles, title grid item ([f4dbedb](https://github.com/dragonrealms-phoenix/phoenix/commit/f4dbedb7968670e2b11107ca458bf91232eb522e))

# [1.3.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.2.1...v1.3.0) (2023-10-18)


### Bug Fixes

* **build:** add semantic release libs ([6b91de2](https://github.com/dragonrealms-phoenix/phoenix/commit/6b91de24d833415703632a626a7917920fb91d76))
* **build:** pass secrets to reusable workflow ([3387af3](https://github.com/dragonrealms-phoenix/phoenix/commit/3387af3918397d97e656f2a04a77e112b9ef879a))
* correct regex escaping ([ebfb30b](https://github.com/dragonrealms-phoenix/phoenix/commit/ebfb30bbded63d5626646af5c10aeaf5f515ba4c))
* ensure run in a bash shell on windows ([89e9326](https://github.com/dragonrealms-phoenix/phoenix/commit/89e9326724fc5bbfb4e589658806aadf8391ccbd))
* increase yarn timeout for large packages ([3441a3e](https://github.com/dragonrealms-phoenix/phoenix/commit/3441a3e156d595f17ad3d7963b98c95c499de3b2))


### Features

* refactored from vite to nextjs ([7d8e557](https://github.com/dragonrealms-phoenix/phoenix/commit/7d8e557f45a96b9075b50ce363babd8e0e2dc2e3))
* **security:** add snyk scan ([d031816](https://github.com/dragonrealms-phoenix/phoenix/commit/d03181617116039d24c2e0f9a1d08a2c39be5b3e))

## [1.2.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.2.0...v1.2.1) (2023-10-09)


### Bug Fixes

* **dependabot:** 1, CVE-2023-44270 ([815a9ca](https://github.com/dragonrealms-phoenix/phoenix/commit/815a9ca5ec40129b540b2bc97eccef71fe1b94cf))

# [1.2.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.1.0...v1.2.0) (2023-10-09)


### Features

* **menu:** refactor from class to functions ([41894b9](https://github.com/dragonrealms-phoenix/phoenix/commit/41894b96c88ef8d3079405a7f50d709b17c4cff7))
* **security:** restrict apis and validate urls ([f8eabae](https://github.com/dragonrealms-phoenix/phoenix/commit/f8eabae69978b80d557671a1ac0b8058151e5c87))

# [1.1.0](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.0.2...v1.1.0) (2023-10-04)


### Features

* add custom menu and about menu ([df3e34a](https://github.com/dragonrealms-phoenix/phoenix/commit/df3e34a905cc76fb68f7f5db2e1540b8699cb931))
* include git hash in full app version ([2fa5ac6](https://github.com/dragonrealms-phoenix/phoenix/commit/2fa5ac6188d4c60bfc9fd164c83b190e2dce67a4))

## [1.0.2](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.0.1...v1.0.2) (2023-10-02)


### Bug Fixes

* **build:** use the new version in artifacts ([a6de721](https://github.com/dragonrealms-phoenix/phoenix/commit/a6de72173357b77282dd0bbc5bd9d801283f6feb))

## [1.0.1](https://github.com/dragonrealms-phoenix/phoenix/compare/v1.0.0...v1.0.1) (2023-10-01)


### Bug Fixes

* **build:** look for artifacts in subfolders ([745da45](https://github.com/dragonrealms-phoenix/phoenix/commit/745da459c27b72a16644fca0440785c30b2a26d0))
* **build:** use npm plugin to update package.json ([d2e3c9b](https://github.com/dragonrealms-phoenix/phoenix/commit/d2e3c9bfad24284448e96f94917609c2eded3d38))

# 1.0.0 (2023-10-01)


### Bug Fixes

* conditionally upload artifacts ([9d7dbff](https://github.com/dragonrealms-phoenix/phoenix/commit/9d7dbffdc085b3fdb974b31c67e1d3c33ef73b0c))
* missing $ in expression ([4b0cd67](https://github.com/dragonrealms-phoenix/phoenix/commit/4b0cd67bf1c22eb9409aabaf7a9846ce2da55b33))
* release depends on build ([4d13394](https://github.com/dragonrealms-phoenix/phoenix/commit/4d13394977c568c8f9269d49da24d0567dcda707))
* show window on app start ([f757db3](https://github.com/dragonrealms-phoenix/phoenix/commit/f757db3050a70429b739dfdec395a45ea190e8ea))
* typo ([8defefb](https://github.com/dragonrealms-phoenix/phoenix/commit/8defefb8cdad61b65a4d7d03fc20ac7c17b9f1a5))
* typo ([309b8ad](https://github.com/dragonrealms-phoenix/phoenix/commit/309b8ad2efe792134fb350fb6baf7171c6a339ea))
* typo ([0d87533](https://github.com/dragonrealms-phoenix/phoenix/commit/0d8753345cea158e316286f23e81512b0ffb1fcb))
* typo ([2590084](https://github.com/dragonrealms-phoenix/phoenix/commit/25900843074f2d79f46a3a05d8a032de3ef4b41f))
* upload os-specific artifacts ([570ce53](https://github.com/dragonrealms-phoenix/phoenix/commit/570ce5385e78a4603cac2ba1a3db1483c272095a))


### Features

* initialize sentry for main process ([b375cb2](https://github.com/dragonrealms-phoenix/phoenix/commit/b375cb2373383d9528231b143e18c44a7dc8896d))
* moved process specific code to dedicated folder ([7b59959](https://github.com/dragonrealms-phoenix/phoenix/commit/7b599597e4f1d34af827d000cdc1019cd8f85d46))
* moved process specific code to dedicated folder ([ab38979](https://github.com/dragonrealms-phoenix/phoenix/commit/ab38979fe0371a55549b3c081d6504fe74595f2f))
