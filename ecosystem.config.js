require("dotenv").config();
const name = "blank-" + process.env.NODE_ENV;

module.exports = {
  apps: [
    {
      name: name,
      script: "dist/app.js",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env_development: {
        NODE_ENV: "development",
        PORT: "3001",
        TZ: "UTC",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
        TZ: "UTC",
      },
    },
  ],
  deploy: {
    production: {
      key: "~/.ssh/id_rsa",
      user: "blank",
      host: ["0.0.0.0"],
      ssh_options: [
        "StrictHostKeyChecking=no",
        "ForwardAgent=yes",
        "PasswordAuthentication=no",
      ],
      ref: "origin/master",
      repo: "git@github.com:DanielVineshen/blank.git",
      path: "/home/blank/production/blank/",
      "post-deploy":
        "npm install && npm run build && npm run production:migration:create && pm2 reload ecosystem.config.js --env production",
    },
    development: {
      key: "~/.ssh/id_rsa",
      user: "blank",
      host: ["0.0.0.0"],
      ssh_options: [
        "StrictHostKeyChecking=no",
        "ForwardAgent=yes",
        "PasswordAuthentication=no",
      ],
      ref: "origin/master",
      repo: "git@github.com:DanielVineshen/blank.git",
      path: "/home/blank/development/blank/",
      "post-deploy":
        "npm install && npm run build && npm run development:migration:create && pm2 reload ecosystem.config.js --env development",
    },
  },
};
