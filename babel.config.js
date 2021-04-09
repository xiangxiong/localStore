module.exports = api => {
    const isTest = api.env('test');
    if (isTest) {
        return {
            "presets": [
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
    return {
        "presets": [
            [
                "@babel/preset-env",
                {
                    "debug": true,
                    "useBuiltIns": "usage",
                    "targets": {
                        "browsers": ["android>4.0"]
                    }
                }
            ]
        ],
        "plugins": [
            [
                "@babel/plugin-transform-runtime",
                {
                    "corejs": 2
                }
            ],
            [
                "@babel/plugin-proposal-class-properties",
                {
                    "loose": true
                }
            ]
        ],
    }

}