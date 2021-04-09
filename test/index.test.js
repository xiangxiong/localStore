import Test from '../lib/index.cjs'

test('test1 return true', () => {
    let result = Test.test;
    console.log('result',result);
    expect(result).toEqual(1)
});

