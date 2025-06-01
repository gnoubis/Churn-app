const path = require('path');

module.exports = function override(config, env) {
  // Add ESM support
  config.resolve.alias = {
    ...config.resolve.alias,
    '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
    '@mui/system': path.resolve(__dirname, 'node_modules/@mui/system'),
  };

  return config;
}; 