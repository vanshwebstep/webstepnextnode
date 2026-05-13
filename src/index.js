const app = require("./app");
const { testConnection } = require("./DB/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

startServer();