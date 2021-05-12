const Dotenv = require('dotenv-webpack');

module.exports = {
//  context: __dirname,
  target: 'webworker',
  entry: './index.js', // inferred from "main" in package.json
  plugins: [
    new Dotenv({
      path: './.env', // Path to .env file (this is the default)
      safe: true, // load .env.example (defaults to "false" which does not use dotenv-safe)
    }),
  ],
};
