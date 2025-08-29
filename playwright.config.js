// playwright.config.js
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  use: { baseURL: "http://localhost:5173" },
  webServer: {
    command: "npx http-server -p 5173 -a localhost -c-1 .",
    url: "http://localhost:5173/index.html",
    reuseExistingServer: !process.env.CI,
  },
});
