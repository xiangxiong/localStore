# LOCALSTORES 多端缓存方案支持 - (小程序,h5,pc)
### 改进的离线存储
localStores 是一个 JavaScript 库，通过简单类似 localStorage API 的异步存储来改进你的 Web 应用程序的离线体验。它能存储多种类型的数据，而不仅仅是字符串. 支持 IndexedDb 或 WebSql 以及 localStorage.

#  安装
使用localStores, 请下载最新版本 或使用npm (npm insall localstores) 进行安装.

# 数据API
获取或设置离线仓库中的数据的API

# GETITEM
getItem(key);

从仓库中获取 key 对应的值并将结果提供给回调函数。如果 key 不存在，getItem() 将返回 null. 返回为 Promise 对象.

# SETITEM

setItem(key, value, successCallback)

将数据保存到离线仓库.

# 设置 API 

## SETDRIVER
setDriver(driverName)

若可用，强制设置特定的驱动。

* 默认情况下，LocalStore 按照以下顺序选择数据仓库的后端驱动：
  * 1、IndexedDB
  * 2、WebSQL
  * 3、localStorage

如果你想强制使用特定的驱动，可以使用 setDriver()，参数为以下的某一个或多个
* LocalStore.INDEXEDDB
* LocalStore.WEBSQL
* LocalStore.LOCALSTORAGE

## CONFIG
config(options)

设置 LocalStore 选项。在调用 LocalStore 前必先调用它，但可以在 LocalStore 被加载后调用。使用此方法设置的任何配置值都将保留，即使在驱动更改后，所以你也可以先调用 config() 再次调用 setDriver()。以下配置值可以设置：


driver

要使用的首选驱动。与上面的 setDriver 的值格式相同。
默认值：[localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE]

name

数据库的名称。可能会在在数据库的提示中会出现。一般使用你的应用程序的名字。在 localStorage 中，它作为存储在 localStorage 中的所有 key 的前缀。
默认值：'localforage

size

数据库的大小（以字节为单位）。现在只用于WebSQL。 默认值：4980736

storeName

数据仓库的名称。在 IndexedDB 中为 dataStore，在 WebSQL 中为数据库 key/value 键值表的名称。仅含字母和数字和下划线。任何非字母和数字字符都将转换为下划线。
默认值：'keyvaluepairs'

version

数据库的版本。将来可用于升级; 目前未使用。
默认值：1.0

description

数据库的描述，一般是提供给开发者的。
默认值：''


# 对 websql 的扩展方法支持.


对使用者需要掌握一定的 Sql 语法能力.

websql 使用示例:
```
import React,{useEffect} from 'react';
import LocalStore from 'localstores';

function App() {
  useEffect(()=>{
    const init = async () =>{
      LocalStore.setDriver(LocalStore.WEBSQL);
      LocalStore.extSetItem('tb_test', {netName:'222333', targetVolume:'test', adjustVolume:'222', lastTargetVolume:'222' },
        '(netName varchar(50),targetVolume varchar(40),adjustVolume varchar(40),lastTargetVolume varchar(40))', function (err) {
          console.log('err', err);
        }, function (err){
          console.log('err', err);
        });
      const rst = await LocalStore.getItem('tb_test');
      console.log('rst',rst);
      LocalStore.updateItem('tb_test',{targetVolume:'test'},{netName:'网点'});
    }
    init();
  },[]);

  return (
    <></>
  );
}

export default App;
```

extSetItem

```
/**
 * 
 * @param {*} tableName 表名 tablename
 * @param {*} tableField 表字段对象 { name : '2'}
 * @param {*} onSuccess 成功回调
 * @param {*} onError 错误回调
*/
function extSetItem(tableName,tableField,createTableField,onSuccess,onError){
}

LocalStore.extSetItem('tb_test', {netName:'222333', targetVolume:'22', adjustVolume:'222', lastTargetVolume:'222' },
    '(netName varchar(50),targetVolume varchar(40),adjustVolume varchar(40),lastTargetVolume varchar(40))', function (err) {
      console.log('err', err);
    }, function (err){
      console.log('err', err);
});
```


removeItem
```
/**
 * 删除表
 * @param {*} key 值 id
 * @param {*} tableName 表名
 * @param {*} callback  function 函数
 * @returns 
 */
function removeItem(key,tableName,callback){

}

LocalStore.removeItem(1,'test',function(){

});

```


updateItem
```
/**
 * 更新数据表
 * @param {*} tableName 表明.
 * @param {*} dbParams  sql 拼接参数.
 * @param {*} dbWhere   sql 条件.
 * @returns promise 对象.
 */
 function updateItem(tableName, dbParams, dbWhere)


 LocalStore.updateItem('tb_test',{targetVolume:'test33333'},{netName:'222333'});
```

truncateItem

```
/**
 * 清空数据表
 * @param {*} tableName 表名
 * @returns 
 */
truncateItem(tableName){}

 LocalStore.truncateItem('tb_adjusttarget22');
```
### 






