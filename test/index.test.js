import LocalStore from '../lib/index.umd';

test('test1 return true', () => {
    // let result = Test.test;
    // console.log('Test',localStorage.setItem('key','value',function(e){
    //     console.log('e',e);
    // }),function(e){
    //     console.log('e',e);
    // });
    LocalStore.setDriver(LocalStore.WEBSQL);
    // // localStorage.setItem()
    LocalStore.setItem('key225','555',((err)=>{
      console.log('err',err);
        LocalStore.getItem('key225',((err,value)=>{
            console.log('value',value);
        }));
    }));
    console.log('LocalStore;',LocalStore);
    // expect(localstore).toEqual(object)
});

