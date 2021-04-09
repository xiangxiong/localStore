#  npm 仓库 js sdk 公共打包模板


 用 rollup 来打包，支持  `main` 和 `module`  2种入口
  
 这样在依赖方就很好的使用  tree shaking
 在 pacakge.json 中 暴露出`main` 和 `module` 2个入口

**默认在 master 分支开发** 

 # 常用命名
1.npm publish 

publish 根据 package.json 的version 字段 打个 tag 到 gitlab 上
防止有的人 publish 了 代码确没有 push



 # 目录结构
 ```javascript
 ├── src
│   └── xxxx.js
│      
└── lib
|    └── index.cjs.js   // 打包成 commonjs 后的代码 也就是常用的 main 入口
|    │__ index.esm.js   // 打包成 es6 风格的后的代码 也就是 module入口，支持 treeshaking
|    |__ index.umd.js
|—— test
|    |—— test.js // 单测文件,
|
|__ babel.config.js  // 已经 配置了 按需加载 polyfill 和 transform-runtime 支持
|
|__ build
      |__rollup.config.js  // rollup 配置 
     
 ```
 
# 注意事项
 - **本地开发过程中,可以通过 `npm link ` 来开发**
   
   具体参考 [网上例子](https://www.jianshu.com/p/aaa7db89a5b2)
-  **协同测试的时候，记得用 tag 来控制**
  来切分开发和正式环境   like ` npm publish --tag beta `   ,[网上例子](https://cnodejs.org/topic/537b47d1cbcc39634983b739)
-  **版本升级**
   SDK改动比较大的时候的时候要注意 比方你的 SDK目前版本是 1.0.9,然后打包方式 从 Babel6 升到了 Babel7 ,想升个版本,
    这个时候就要注意了，依赖的你SDK的项目A一般是这样使用的`example-sdk: ^1.0.5`,那这个时侯你的SDK版本改成1.0.10,然后执行了 `npm publish`，
    项目就会报错，所以为了处理这个问题,你需要把 version 改成 `2.0.x` 这样就不会影响到项目A


 
# 生成后文件

源代码 

``` javascript
class Test {
  static test = 1;
}

export default Test;

// transform-runtime
new Promise();
Object.assign({}, {})
Array.from([])


//  用到啥就 polyfill 啥
let array = [0, 1, 2, 3, 4];
array.includes(ele => ele > 2);
```

 module 入口 `lib/index.esm.js`  ES6风格代码
```javascript
import 'core-js/modules/es7.array.includes';
import _Array$from from '@babel/runtime-corejs2/core-js/array/from';
import _Object$assign from '@babel/runtime-corejs2/core-js/object/assign';
import _Promise from '@babel/runtime-corejs2/core-js/promise';
import _classCallCheck from '@babel/runtime-corejs2/helpers/classCallCheck';

var Test = function Test() {
  _classCallCheck(this, Test);
};

Test.test = 1;

new _Promise();

_Object$assign({}, {});

_Array$from([]); //  用到啥就 polyfill 啥

```

main  入口 `lib/index.esm.js`  commonjs风格代码

```javascript
Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('core-js/modules/es7.array.includes');
var _Array$from = _interopDefault(require('@babel/runtime-corejs2/core-js/array/from'));
var _Object$assign = _interopDefault(require('@babel/runtime-corejs2/core-js/object/assign'));
var _Promise = _interopDefault(require('@babel/runtime-corejs2/core-js/promise'));
var _classCallCheck = _interopDefault(require('@babel/runtime-corejs2/helpers/classCallCheck'));

var Test = function Test() {
  _classCallCheck(this, Test);
};

Test.test = 1;

new _Promise();

_Object$assign({}, {});

_Array$from([]); //  用到啥就 polyfill 啥
```


 
