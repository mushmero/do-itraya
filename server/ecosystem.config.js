module.exports = {
  apps: [
    {
      name: "doitraya-server",
      script: "index.js",
      instances: "1",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_file: ".env",
    },
  ],
};
