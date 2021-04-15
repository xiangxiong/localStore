function createDbTable(t,dbInfo,callback, errorCallback){
  t.executeSql(
    `CREATE TABLE IF NOT EXISTS ${dbInfo.storeName} ` + '(key varchar(50), value varchar(50))',
    [],
    callback,
    errorCallback
  )
}

function _initStorage(options){
  var self = this;
  var dbInfo = {
    db:null
  };
  if(options){
    for(var i in options){
      dbInfo[i] = 
        typeof options[i] !== 'string'
          ? options[i].toString()
          : options[i];
    }
  }
  dbInfo.db = openDatabase(
    String(dbInfo.name),
    String(dbInfo.version),
    String(dbInfo.description),
    dbInfo.size
  );
  // dbInfo.db = openDatabase("MySql", "1.0", "我的数据库描述", 1024 * 1024);
  self._dbInfo = dbInfo.db;
  dbInfo.db.transaction(function (t) {
    createDbTable(
      t,
      dbInfo,
      function(){
      },
      function (t,error){
        console.log(error);
      }
    )
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
function createExtTable(tableName,createTableField,onSuccess,onError,context){
  var extTablePromise = new Promise(function(resolve, reject) {
    try{
      context.transaction((ts, result)=>{
        ts.executeSql(
          `CREATE TABLE IF NOT EXISTS ${tableName} ` + createTableField,
          [],
          onSuccess,
          onError
        )
      });
      resolve('success');
    }
    catch(err){
      reject(err);
    }
  })

  return extTablePromise;
}

/**
 * 
 * @param {*} tableName 表名 tablename
 * @param {*} tableField 表字段对象 { name : '2'}
 * @param {*} onSuccess 成功回调
 * @param {*} onError 错误回调
*/
function extSetItem(tableName,tableField,createTableField,onSuccess,onError){
    createExtTable(tableName,createTableField,onSuccess,onError,this._dbInfo)
    .then((item)=>{
        if(!tableField)
          throw new Error('Error: FUNCTION dbinsert tableField is Null');
        let fieldKeyArr = [], fieldValueArr = [], fieldKey = null, fieldValue = null, i = 0;
        for (var field in tableField){
          field.toString();
          tableField[field].toString();
          fieldKeyArr[i] = field;
          fieldValueArr[i] = tableField[field];
          if(typeof(fieldValueArr[i]) !== 'number'){
            fieldValueArr[i] = '"'+fieldValueArr[i]+'"';
          }
          i++;
        }
        fieldKey = fieldKeyArr.join(',');
        fieldValue = fieldValueArr.join(',');
        let sql = 'INSERT INTO '+tableName+' (';
        sql += fieldKey;
        sql += ') ';
        sql += 'VALUES (';
        sql += fieldValue;
        sql += ')';
        this._dbInfo.transaction((ts)=>{
            console.log('sql',sql);
            ts.executeSql(sql, [], function (ts, result) {
              onSuccess(ts,result);
              console.log('result',result);
            }, function (ts, result) {
              onError(ts,result);
              console.log('result',result);
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
function setItem(key,value,tableName,onSuccess,onError){
  this._dbInfo.transaction((ts)=>{
    let sql =  `INSERT OR REPLACE INTO ${
      tableName
    } ` + '(key, value) VALUES (?, ?)';
    ts.executeSql(sql, [key,value], function (ts, result){
      onSuccess(ts,result);
    }, function(ts, result){
      onError(ts,result);
    });
  });
}

/**
 * 获取表名
 * @param {*} tableName 表名
 */
function getItem(tableName){
    var self = this;
    var promise = new Promise(function (resolve, reject){
      self._dbInfo.transaction((ts)=>{
        try{
          ts.executeSql('select * from '+ tableName, [], function (ts, result) {
            var rst = [];
            if (result) {
               for (var i = 0; i < result.rows.length; i++){
                rst.push(result.rows.item(i));
                  // console.info((result.rows.item(i)));
               }
            }
            resolve(rst);
          },function(ts, message) {
              console.info("查询数据失败！"+message);
          });
        }
        catch(error){
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
function removeItem(key,tableName,callback){
  var self = this;
  var promise = new Promise(function (resolve, reject) {
    self._dbInfo.transaction((ts)=>{
      try {
        ts.executeSql(`DELETE FROM ${tableName} WHERE id = ?`,[key],function(){
          resolve();
        },function(t,error){
          reject(error);
        });
      }
      catch(error){
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
function truncateItem(tableName){
  if (!tableName) {
    console.log('ERROR: Table Name is Null');
    return false;
  }
  var self = this;
  var promise = new Promise(function (resolve, reject) {
    try{
      self._dbInfo.transaction(function (ts) {
        ts.executeSql('delete from ' + tableName,[],function (ts, result){
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
    }
    catch(error){
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
function dropItem(tableName){

  if(!tableName){
    console.log('ERROR: Table Name is Null');
    return false;
  }

  var self = this;

  function _drop(tableName){
    self._dbInfo.transaction(function (ts){
      ts.executeSql('DROP TABLE' + tableName);
    },[], function (ts, result){
      console.log('DROP TABLE' + tableName);
      return true;
    }, function (t, error){
      console.log('error' + error);
      return false;
    });
  }
  
  _drop(tableName);
}

var webSQLStorage = {
  _driver: 'webSQLStorage',
  _initStorage: _initStorage,
  extSetItem: extSetItem,
  getItem: getItem,
  setItem: setItem,
  removeItem: removeItem,
  updateItem: updateItem,
  truncateItem: truncateItem,
  dropItem: dropItem
};

export default webSQLStorage;