module.exports = {
  apps: [
    {
      name: 'rms-backend-node',
      script: './dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      merge_logs: true,
      autorestart: true,
      watch: false,
    },
  ],
};
