module.exports = api => {
  const isTest = api.env('test');
  return {
      "presets":[
          [
              "@babel/preset-env"
          ]
      ],
      "plugins": [
          [
              "@babel/plugin-proposal-class-properties",
              {
                  "loose": true
              }
          ]
      ],
  }
}