module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
  "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
  },

    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],   
    "rules": {
        // "semi": ["error", "always"],
        "quotes": ["error", "double"]
    }
};
