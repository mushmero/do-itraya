const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

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
        PORT: process.env.PORT,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT,
      },
      env_file: ".env",
    },
  ],
};
