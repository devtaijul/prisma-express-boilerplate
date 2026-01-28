module.exports = {
  apps: [
    {
      name: "sajherbati-api",
      script: "./dist/src/server.js", // after TS build
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      // build step before starting
      pre_start: "npm install && npx tsc",
    },
  ],
};
