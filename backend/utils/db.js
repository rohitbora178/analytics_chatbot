const fs = require("fs").promises;
const path = require("path");

const dbPath = path.join(__dirname, "..", "db.json");

async function readDb() {
  try {
    const data = await fs.readFile(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        users: [],
        settings: [],
        supportTickets: [],
      };
    }
    throw error;
  }
}

async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

module.exports = {
  readDb,
  writeDb,
};
