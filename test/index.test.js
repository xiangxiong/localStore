import LocalStore from '../lib/index.umd';
test('test1 return true', () => {
    LocalStore.setDriver(LocalStore.WEBSQL);
    LocalStore.setItem('key225','555',((err) => {
        LocalStore.getItem('key225',((err,value)=>{
            console.log('value',value);
        }));
    }));
});
