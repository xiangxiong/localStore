
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
  console.log('context',context);
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
 * 设置存储项目
 * @param {*} key 键
 * @param {*} value 值
 * @param {*} onSuccess 成功回调
 * @param {*} onError   错误回调
 */
function setItem(key,value,onSuccess,onError){
  this._dbInfo.transaction((ts)=>{
    let sql =  `INSERT OR REPLACE INTO ${
      this._dbInfo.storeName
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
  this._dbInfo.transaction((ts)=>{
    ts.executeSql('select * from '+ tableName, [], function (ts, result) {
      if (result) {
         for (var i = 0; i < result.rows.length; i++) {
             console.info((result.rows.item(i)));
         }
      }
      return result;
    }, function (ts, message) {
        console.info("查询数据失败！"+message);
    });
  });
}

var webSQLStorage = {
  _driver: 'webSQLStorage',
  _initStorage: _initStorage,
  extSetItem: extSetItem,
  getItem: getItem,
  setItem: setItem
};

export default webSQLStorage;