/* eslint-env node */
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    "parser": '@typescript-eslint/parser',
    "plugins": ['@typescript-eslint'],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs,mjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "@typescript-eslint/ban-ts-comment": "off"
    }
}
