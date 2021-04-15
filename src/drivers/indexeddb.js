function _initStorage(options){
 
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


var webIndexDbStorage = {
  _driver: 'webIndexDbStorage',
  _initStorage: _initStorage,
  getItem: getItem,
  setItem: setItem,
};

export default webIndexDbStorage;