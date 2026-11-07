module.exports = {
  apps: [{
    name: 'mlmis-api',
    script: 'src/index.js',
    cwd: '/var/www/mlmis/server',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/mlmis/api-error.log',
    out_file: '/var/log/mlmis/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};