(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.localstores = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function createDbTable(t, dbInfo, callback, errorCallback) {
    t.executeSql("CREATE TABLE IF NOT EXISTS ".concat(dbInfo.storeName, " ") + '(key varchar(50), value varchar(50))', [], callback, errorCallback);
  }

  function _initStorage$1(options) {
    var self = this;
    var dbInfo = {
      db: null
    };

    if (options) {
      for (var i in options) {
        dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
      }
    }

    dbInfo.db = openDatabase(String(dbInfo.name), String(dbInfo.version), String(dbInfo.description), dbInfo.size); // dbInfo.db = openDatabase("MySql", "1.0", "我的数据库描述", 1024 * 1024);

    self._dbInfo = dbInfo.db;
    dbInfo.db.transaction(function (t) {
      createDbTable(t, dbInfo, function () {}, function (t, error) {
        console.log(error);
      });
    });
  }
  /**
   * 创建扩展的表
   * @param {*} tableName  扩展表名称
   * @param {*} createTableField  扩展表字段
   * @param {*} onSuccess  成功回调
   * @param {*} onError  错误回调
   * @param {*} context 上下文
   * @returns 
   */


  function createExtTable(tableName, createTableField, onSuccess, onError, context) {
    var extTablePromise = new Promise(function (resolve, reject) {
      try {
        context.transaction(function (ts, result) {
          ts.executeSql("CREATE TABLE IF NOT EXISTS ".concat(tableName, " ") + createTableField, [], onSuccess, onError);
        });
        resolve('success');
      } catch (err) {
        reject(err);
      }
    });
    return extTablePromise;
  }
  /**
   * 
   * @param {*} tableName 表名 tablename
   * @param {*} tableField 表字段对象 { name : '2'}
   * @param {*} onSuccess 成功回调
   * @param {*} onError 错误回调
  */


  function extSetItem(tableName, tableField, createTableField, onSuccess, onError) {
    var _this = this;

    createExtTable(tableName, createTableField, onSuccess, onError, this._dbInfo).then(function (item) {
      if (!tableField) throw new Error('Error: FUNCTION dbinsert tableField is Null');
      var fieldKeyArr = [],
          fieldValueArr = [],
          fieldKey = null,
          fieldValue = null,
          i = 0;

      for (var field in tableField) {
        field.toString();
        tableField[field].toString();
        fieldKeyArr[i] = field;
        fieldValueArr[i] = tableField[field];

        if (typeof fieldValueArr[i] !== 'number') {
          fieldValueArr[i] = '"' + fieldValueArr[i] + '"';
        }

        i++;
      }

      fieldKey = fieldKeyArr.join(',');
      fieldValue = fieldValueArr.join(',');
      var sql = 'INSERT INTO ' + tableName + ' (';
      sql += fieldKey;
      sql += ') ';
      sql += 'VALUES (';
      sql += fieldValue;
      sql += ')';

      _this._dbInfo.transaction(function (ts) {
        console.log('sql', sql);
        ts.executeSql(sql, [], function (ts, result) {
          onSuccess(ts, result);
          console.log('result', result);
        }, function (ts, result) {
          onError(ts, result);
          console.log('result', result);
        });
      });
    });
  }
  /**
   * 
   * 设置存储项目
   * 
   * @param {*} key 键
   * @param {*} value 值
   * @param {*} onSuccess 成功回调
   * @param {*} onError   错误回调
   */


  function setItem$1(key, value, tableName, onSuccess, onError) {
    this._dbInfo.transaction(function (ts) {
      var sql = "INSERT OR REPLACE INTO ".concat(tableName, " ") + '(key, value) VALUES (?, ?)';
      ts.executeSql(sql, [key, value], function (ts, result) {
        onSuccess(ts, result);
      }, function (ts, result) {
        onError(ts, result);
      });
    });
  }
  /**
   * 获取表名
   * @param {*} tableName 表名
   */


  function getItem$1(tableName) {
    var self = this;
    var promise = new Promise(function (resolve, reject) {
      self._dbInfo.transaction(function (ts) {
        try {
          ts.executeSql('select * from ' + tableName, [], function (ts, result) {
            var rst = [];

            if (result) {
              for (var i = 0; i < result.rows.length; i++) {
                rst.push(result.rows.item(i)); // console.info((result.rows.item(i)));
              }
            }

            resolve(rst);
          }, function (ts, message) {
            reject([]);
            console.info("查询数据失败！" + message);
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    return promise;
  }
  /**
   * 删除表
   * @param {*} key 值
   * @param {*} tableName 表名
   * @param {*} callback  function 函数
   * @returns 
   */


  function removeItem(key, tableName, callback) {
    var self = this;
    var promise = new Promise(function (resolve, reject) {
      self._dbInfo.transaction(function (ts) {
        try {
          ts.executeSql("DELETE FROM ".concat(tableName, " WHERE id = ?"), [key], function () {
            resolve();
          }, function (t, error) {
            reject(error);
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    return promise;
  }
  /**
   * 更新数据表
   * @param {*} tableName 表明.
   * @param {*} dbParams  sql 拼接参数.
   * @param {*} dbWhere   sql 条件.
   * @returns promise 对象.
   */


  function updateItem(tableName, dbParams, dbWhere) {
    var self = this;
    var SQL = 'UPDATE ' + tableName + ' SET ';
    var paramArr = new Array();
    var paramStr = '';
    var i = 0;

    for (var k in dbParams) {
      if (typeof dbParams[k] !== 'number') {
        dbParams[k] = '"' + dbParams[k] + '"';
      }

      paramArr[i] = k.toString() + '=' + dbParams[k];
      i++;
    }

    paramStr = paramArr.join(',');
    SQL += paramStr;

    if (dbWhere) {
      SQL += ' WHERE ';
      var whereArr = new Array();
      var whereStr = '';
      var n = 0;

      for (var w in dbWhere) {
        if (typeof dbWhere[w] !== 'number') {
          dbWhere[n] = '"' + dbWhere[w] + '"';
        }

        whereArr[n] = w.toString() + '=' + dbWhere[w];
        n++;
      }

      whereStr = whereArr.join(" AND ");
      SQL += whereStr;
    }

    var promise = new Promise(function (resolve, reject) {
      self._dbInfo.transaction(function (ts) {
        try {
          ts.executeSql(SQL, [], function (ts, result) {
            resolve(true);
          }, function (t, error) {
            resolve(false);
          });
        } catch (error) {
          reject(false);
        }
      });
    });
    return promise;
  }
  /**
   * 清空数据表
   * @param {*} tableName 表名
   * @returns 
   */


  function truncateItem(tableName) {
    if (!tableName) {
      console.log('ERROR: Table Name is Null');
      return false;
    }

    var self = this;
    var promise = new Promise(function (resolve, reject) {
      try {
        self._dbInfo.transaction(function (ts) {
          ts.executeSql('delete from ' + tableName, [], function (ts, result) {
            console.log('删除表成功');
            resolve(true);
          });
        }, [], function (ts, result) {
          console.log('DELETE TABLE' + tableName);
          resolve(true);
        }, function (t, error) {
          reject(error);
          console.log(error);
        });
      } catch (error) {
        reject(error);
      }
    });
    return promise;
  }
  /**
   * 删除数据表
   * @param {*} tableName  表名
   * @returns 
   */


  function dropItem(tableName) {
    if (!tableName) {
      console.log('ERROR: Table Name is Null');
      return false;
    }

    var self = this;

    function _drop(tableName) {
      self._dbInfo.transaction(function (ts) {
        ts.executeSql('DROP TABLE ' + tableName);
      }, [], function (ts, result) {
        console.log('DROP TABLE ' + tableName);
        return true;
      }, function (t, error) {
        console.log('error' + error);
        return false;
      });
    }

    _drop(tableName);
  }

  var webSQLStorage = {
    _driver: 'webSQLStorage',
    _initStorage: _initStorage$1,
    extSetItem: extSetItem,
    getItem: getItem$1,
    setItem: setItem$1,
    removeItem: removeItem,
    updateItem: updateItem,
    truncateItem: truncateItem,
    dropItem: dropItem
  };

  function _initStorage(options) {}
  /**
   * 
   * 设置存储项目
   * 
   * @param {*} key 键
   * @param {*} value 值
   * @param {*} onSuccess 成功回调
   * @param {*} onError   错误回调
   */


  function setItem(key, value, tableName, onSuccess, onError) {
    this._dbInfo.transaction(function (ts) {
      var sql = "INSERT OR REPLACE INTO ".concat(tableName, " ") + '(key, value) VALUES (?, ?)';
      ts.executeSql(sql, [key, value], function (ts, result) {
        onSuccess(ts, result);
      }, function (ts, result) {
        onError(ts, result);
      });
    });
  }
  /**
   * 获取表名
   * @param {*} tableName 表名
   */


  function getItem(tableName) {
    var self = this;
    var promise = new Promise(function (resolve, reject) {
      self._dbInfo.transaction(function (ts) {
        try {
          ts.executeSql('select * from ' + tableName, [], function (ts, result) {
            var rst = [];

            if (result) {
              for (var i = 0; i < result.rows.length; i++) {
                rst.push(result.rows.item(i)); // console.info((result.rows.item(i)));
              }
            }

            resolve(rst);
          }, function (ts, message) {
            console.info("查询数据失败！" + message);
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    return promise;
  }

  var webIndexDbStorage = {
    _driver: 'webIndexDbStorage',
    _initStorage: _initStorage,
    getItem: getItem,
    setItem: setItem
  };

  var isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };

  var DefinedDrivers = {};
  var DefaultDrivers = {
    INDEXDDB: webIndexDbStorage,
    WEBSQL: webSQLStorage
  };
  var DefaultDriverOrder = [DefaultDrivers.INDEXDDB._driver, DefaultDrivers.WEBSQL._driver];
  var DefaultConfig = {
    description: 'localStore',
    driver: DefaultDriverOrder.slice(),
    name: 'localStore',
    size: 4980736,
    storeName: 'master',
    version: 1.0
  };
  var DriverSupport = ['webSQLStorage', 'asyncStorage'];

  function extend() {
    for (var i = 1; i < arguments.length; i++) {
      var arg = arguments[i];

      if (arg) {
        for (var key in arg) {
          if (arg.hasOwnProperty(key)) {
            if (isArray(arg[key])) {
              arguments[0][key] = arg[key].slice();
            } else {
              arguments[0][key] = arg[key];
            }
          }
        }
      }
    }

    return arguments[0];
  }

  var LocalStore = /*#__PURE__*/function () {
    function LocalStore(options) {
      _classCallCheck(this, LocalStore);

      for (var driverTypeKey in DefaultDrivers) {
        if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
          var driver = DefaultDrivers[driverTypeKey];
          var driverName = driver._driver;
          this[driverTypeKey] = driverName;
        }
      }

      this._defaultConfig = extend({}, DefaultConfig);
      this._config = extend({}, this._defaultConfig, options);
      this._driverSet = null;
      this._initDriver = null;
      this._ready = false;
      this._dbInfo = null;
    }

    _createClass(LocalStore, [{
      key: "defineDriver",
      value: function defineDriver(driverObject, callback, errorCallback) {
        this._extend(driverObject);
      }
    }, {
      key: "_extend",
      value: function _extend(libraryMethodsAndProperties) {
        extend(this, libraryMethodsAndProperties);
      }
    }, {
      key: "config",
      value: function config(options) {
        this._config = options;
      }
    }, {
      key: "supports",
      value: function supports(driverName) {
        return DriverSupport.filter(function (item) {
          return item === driverName;
        }) ? true : false;
      }
    }, {
      key: "_getSupportedDrivers",
      value: function _getSupportedDrivers(drivers) {
        var supportedDrivers = [];

        for (var i = 0, len = drivers.length; i < len; i++) {
          var driverName = drivers[i];

          if (this.supports(driverName)) {
            supportedDrivers.push(driverName);
          }
        }

        return supportedDrivers;
      }
    }, {
      key: "setDriver",
      value: function setDriver(drivers, callback, errorCallback) {
        var self = this;

        if (!isArray(drivers)) {
          drivers = [drivers];
        } // 验证是否支持驱动类型.


        var supportedDrivers = this._getSupportedDrivers(drivers);

        function initDriver() {
          if (supportedDrivers.indexOf('webSQLStorage') > -1) {
            // 核心的方法就是实例合并给 extend
            extendSelfWithDriver(webSQLStorage);
          }

          if (supportedDrivers.indexOf('asyncStorage') > -1) {
            extendSelfWithDriver(webIndexDbStorage);
          }
        }

        function extendSelfWithDriver(driver) {
          self._extend(driver);

          self._initStorage(self._config);
        }

        initDriver();
      }
    }, {
      key: "driver",
      value: function driver() {
        return this._driver || null;
      }
    }, {
      key: "getDriver",
      value: function getDriver(driverName) {
        return DefinedDrivers[driverName];
      }
    }, {
      key: "ready",
      value: function ready(callback) {
        var promise = new Promise(function (resolve, reject) {
          resolve();
        });
        return promise;
      }
    }]);

    return LocalStore;
  }();

  var localstore = new LocalStore();

  return localstore;

})));
