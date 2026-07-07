import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';
import { AppSettings } from '../models/models';

enablePromise(true);

var db: SQLiteDatabase | null = null;

async function getDatabase() {
  if (db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' })
  return db;
};

const createSettingsTable = async () => {
  let db = await getDatabase();

  await db.executeSql(
    "CREATE TABLE IF NOT EXISTS Settings (id INTEGER PRIMARY KEY NOT NULL, theme TEXT, language TEXT);"
  );
};

const getSettings = async (): Promise<AppSettings | null> => {
  let db = await getDatabase();

  await db.executeSql(
    "CREATE TABLE IF NOT EXISTS Settings (id INTEGER PRIMARY KEY NOT NULL, theme TEXT, language TEXT);"
  );
  let res = await db.executeSql("SELECT id, theme, language FROM Settings WHERE id = 1");

  if (res[0].rows.length > 0) {
    const item = res[0].rows.item(0);
    return { id: item.id, language: item.language, theme: item.theme };
  }

  await db.executeSql("INSERT INTO Settings (id, theme, language) VALUES (1, NULL, NULL)");

  return { id: 1, theme: null, language: null };
}

const updateLanguage = async (lang: string) => {
  let db = await getDatabase();

  let res = await db.executeSql(
    "UPDATE Settings SET language = ? WHERE id = 1",
    [lang]);

  return res[0].rowsAffected;
}


const updateTheme = async (theme: string) => {
  let db = await getDatabase();

  let res = await db.executeSql(
    "UPDATE Settings SET theme = ? WHERE id = 1",
    [theme]);

  return res[0].rowsAffected;
}

export { createSettingsTable, getSettings, updateLanguage, updateTheme }
