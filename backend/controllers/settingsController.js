const { readDb, writeDb } = require("../utils/db");

const defaultSettings = {
  theme: "light",
  notifications: true,
  language: "en",
  emailUpdates: true,
  profileVisibility: "public",
};

async function getSettings(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const db = await readDb();
    db.settings = db.settings || [];

    const settings = db.settings.find((s) => s.userId === userId) || {
      userId,
      ...defaultSettings,
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch settings." });
  }
}

async function updateSettings(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { theme, notifications, language, emailUpdates, profileVisibility } = req.body;

    if (!theme || !language || !profileVisibility) {
      return res.status(400).json({ error: "Theme, language, and privacy settings are required." });
    }

    const db = await readDb();
    db.settings = db.settings || [];

    const existingIndex = db.settings.findIndex((s) => s.userId === userId);
    const updatedSettings = {
      userId,
      theme,
      notifications: notifications === undefined ? defaultSettings.notifications : notifications,
      language,
      emailUpdates: emailUpdates === undefined ? defaultSettings.emailUpdates : emailUpdates,
      profileVisibility,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      db.settings[existingIndex] = updatedSettings;
    } else {
      db.settings.push(updatedSettings);
    }

    await writeDb(db);
    res.json({ message: "Settings saved.", settings: updatedSettings });
  } catch (error) {
    res.status(500).json({ error: "Unable to save settings." });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};