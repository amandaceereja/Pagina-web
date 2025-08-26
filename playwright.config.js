// playwright.config.js
module.exports = {
  use: { headless: true, baseURL: "http://127.0.0.1:5500" },
  webServer: {
    command: "npx http-server -p 5500 -c-1 .",
    port: 5500,
    reuseExistingServer: !process.env.CI,
  },
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
};
