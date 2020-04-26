const { factory } = require('../gql/appGraphql');
const serverlessHttp = require('serverless-http');
const app = factory();

exports.handler = serverlessHttp(app);
