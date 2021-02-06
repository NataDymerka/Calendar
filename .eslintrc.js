module.exports = {
    "extends": "airbnb-base",
    "env": {
        "browser": true
    },
    "parserOptions": {
        "props": false
    },
    "rules": {
        "no-array-constructor": 0,
        "func-names": 0,
        "no-use-before-define": ["error", { "functions": false }]
    }

};
