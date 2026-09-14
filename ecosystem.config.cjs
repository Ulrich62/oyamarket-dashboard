module.exports = {
  apps: [
    {
      name: 'oyamarket-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      cwd: '/var/www/oyamarket-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
