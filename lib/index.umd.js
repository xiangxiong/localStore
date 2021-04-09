(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@babel/runtime-corejs2/helpers/classCallCheck')) :
  typeof define === 'function' && define.amd ? define(['@babel/runtime-corejs2/helpers/classCallCheck'], factory) :
  (global = global || self, global.pullLoadMore = factory(global._classCallCheck));
}(this, (function (_classCallCheck) { 'use strict';

  _classCallCheck = _classCallCheck && Object.prototype.hasOwnProperty.call(_classCallCheck, 'default') ? _classCallCheck['default'] : _classCallCheck;

  var Test = function Test() {
    _classCallCheck(this, Test);
  };

  Test.test = 1;

  return Test;

})));
