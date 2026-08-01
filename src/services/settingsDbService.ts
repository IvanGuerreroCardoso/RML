import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';
import { AppSettings } from '../models/models';

enablePromise(true);

var db: SQLiteDatabase | null = null;
let migratePromise: Promise<void> | null = null;

async function getDatabase() {
  if (db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' })
  return db;
};

const createSettingsTable = async () => {
  let db = await getDatabase();

  await db.executeSql(
    "CREATE TABLE IF NOT EXISTS Settings (id INTEGER PRIMARY KEY NOT NULL, theme TEXT, language TEXT, tutorial NUMBER);"
  );

  const result = await db.executeSql(
    `
       SELECT 1
       FROM pragma_table_info('Settings')
       WHERE name = 'tutorial'
       LIMIT 1;
       `
  );

  if (result[0].rows.length === 0) {
    await db.executeSql(`ALTER TABLE Settings ADD COLUMN tutorial NUMBER;`);
  }
};

const createItemsTable = async () => {
  let db = await getDatabase();

  await db.executeSql("CREATE VIRTUAL TABLE IF NOT EXISTS Authors USING fts4(name TEXT)");
  await db.executeSql("CREATE VIRTUAL TABLE IF NOT EXISTS Genres USING fts4(name TEXT)");
  await db.executeSql(`
CREATE TABLE IF NOT EXISTS Items 
(itemId INTEGER PRIMARY KEY NOT NULL, name TEXT, listId INT NOT NULL, year TEXT, checked BOOLEAN, rate INTEGER,
authorId INTEGER, genreId INTEGER, rateDate TEXT, createdAt TEXT)`
  );

  const result = await db.executeSql(
    `
       SELECT 1
       FROM pragma_table_info('Items')
       WHERE name = 'rateDate'
       LIMIT 1;
       `
  );

  if (result[0].rows.length === 0) {
    await db.executeSql(`ALTER TABLE Items ADD COLUMN rateDate TEXT;`);
    await db.executeSql(`ALTER TABLE Items ADD COLUMN createdAt TEXT;`);
  }
};


const createListTable = async () => {
  let db = await getDatabase();

  await db.executeSql(
    'CREATE TABLE IF NOT EXISTS Lists (listId INTEGER PRIMARY KEY NOT NULL, name TEXT, checked BOOLEAN);'
  );

  return;
};

const initDb = async () => {
  if (migratePromise) return migratePromise;

  migratePromise = (async () => {
    await createSettingsTable();
    await createItemsTable();
    await createListTable();
  })();

  return migratePromise;
};

const getSettings = async (): Promise<AppSettings | null> => {
  let db = await getDatabase();

  let res = await db.executeSql("SELECT id, language, theme, tutorial FROM Settings WHERE id = 1");

  if (res[0].rows.length > 0) {
    const item = res[0].rows.item(0);
    return { id: item.id, language: item.language, theme: item.theme, tutorial: item.tutorial };
  }

  await db.executeSql("INSERT INTO Settings (id, theme, language, tutorial) VALUES (1, NULL, NULL, NULL)");

  return { id: 1, theme: null, language: null, tutorial: null };
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

const updateTutorial = async (tutorialNum: number) => {
  let db = await getDatabase();
  let res = await db.executeSql(
    "UPDATE Settings SET tutorial = ? WHERE id = 1",
    [tutorialNum]
  );
  return res[0].rowsAffected;
}

export { initDb, getSettings, updateLanguage, updateTheme, updateTutorial }
