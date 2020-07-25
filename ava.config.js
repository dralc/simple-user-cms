export default {
  "failFast": true,
  "verbose": true,
  "files": [
    "tests/**/*test*"
  ],
  "extensions": [
    "ts",
    "js"
  ],
  "require": [
    "dotenv/config",
    "ts-node/register"
  ],
  "timeout": "10m"
};