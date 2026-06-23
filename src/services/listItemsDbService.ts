import { Author, Genre, ListItem } from '../models/models';
import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';

enablePromise(true);

var db: SQLiteDatabase | null = null;

async function getDatabase() {
  if (db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' })
  return db;
};

const createItemsTable = async () => {
  let db = await getDatabase();

  //await db.executeSql("DROP TABLE IF EXISTS Items")
  //await db.executeSql("DROP TABLE IF EXISTS Authors")
  //await db.executeSql("DROP TABLE IF EXISTS Genres")

  await db.executeSql("CREATE VIRTUAL TABLE IF NOT EXISTS Authors USING fts4(name TEXT)")

  await db.executeSql("CREATE VIRTUAL TABLE IF NOT EXISTS Genres USING fts4(name TEXT)")

  await db.executeSql("PRAGMA foreign_keys = ON;");

  return await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Items 
    (itemId INTEGER PRIMARY KEY NOT NULL, name TEXT, listId INT NOT NULL, year DATE, checked BOOLEAN, rate INTEGER,
    authorId INT, genreId INT,
    FOREIGN KEY (listId) REFERENCES Lists(listId) ON DELETE CASCADE)`
  )
};

const insertListItem = async (item: ListItem): Promise<number> => {
  let db = await getDatabase();

  return (await db.executeSql(
    'INSERT INTO Items (name, listId, year, checked, rate, authorId, genreId) values (?,?,?,?,0,?,?)',
    [item.name, item.listId, item.year, item.checked, item.author?.id ?? null, item.genre?.id ?? null]
  ))[0].insertId;
};

const insertAuthor = async (name: string): Promise<number> => {
  let db = await getDatabase();

  return (await db.executeSql("INSERT INTO Authors (name) VALUES (?)", [name]))[0].insertId;
}

const insertGenre = async (name: string): Promise<number> => {
  let db = await getDatabase();

  return (await db.executeSql("INSERT INTO Genres (name) VALUES (?)", [name]))[0].insertId;
}

const matchAuthor = async (text: string): Promise<Author[]> => {
  let db = await getDatabase();
  let res = await db.executeSql(`SELECT rowid, name FROM Authors WHERE name MATCH '${text}*' LIMIT 5`);

  return res[0].rows.raw().map((a: any) => ({
    name: a.name,
    id: a.rowid
  }))
}

const matchGenre = async (text: string): Promise<Genre[]> => {
  let db = await getDatabase();
  let res = await db.executeSql(`SELECT rowid, name FROM Genres WHERE name MATCH '${text}*' LIMIT 5`);

  return res[0].rows.raw().map((g: any) => ({
    name: g.name,
    id: g.rowid
  }))
}

const getAllItemsCount = async (): Promise<number> => {
  let db = await getDatabase();

  let res = await db.executeSql(
    `SELECT *
    FROM Items`,
    []
  );
  console.log(res[0].rows.raw())
  return res[0].rows.raw().length;
}

const getListItems = async (listId: number): Promise<ListItem[]> => {
  let db = await getDatabase();

  let res = await db.executeSql(
    `SELECT i.itemId, i.listId, i.name, i.checked, i.year, i.rate,
      i.authorId, a.name as authorName, i.genreId, g.name as genreName
    FROM Items i
    LEFT JOIN Authors a on a.rowid = i.authorId
    LEFT JOIN Genres g on g.rowid = i.genreId
    WHERE i.listId = ?`,
    [listId]
  );

  return res[0].rows.raw().map(mapToItem);
};

const updateListItem = async (item: ListItem): Promise<number> => {
  let db = await getDatabase();

  return (await db.executeSql(
    'UPDATE Items SET name = ?, checked = ?, year = ?, rate = ?, authorId = ?, genreId = ? WHERE itemId = ?',
    [item.name, item.checked, item.year, item.rate, item.itemId, item.author?.id ?? null, item.genre?.id ?? null]
  ))[0].rowsAffected;
};

const deleteListItem = async (id: number): Promise<number> => {
  let db = await getDatabase();

  return (await db.executeSql(
    'DELETE FROM Items WHERE itemId = ?',
    [id]
  ))[0].rowsAffected;
};

const getItemById = async (itemId: number): Promise<ListItem> => {
  let db = await getDatabase();

  let res = await db.executeSql(
    `SELECT i.itemId, i.listId, i.name, i.checked, i.year, i.rate,
      i.authorId, a.name as authorName, i.genreId, g.name as genreName
    FROM Items i
    LEFT JOIN Authors a on a.rowid = i.authorId
    LEFT JOIN Genres g on g.rowid = i.genreId
    WHERE i.itemId = ?`,
    [itemId]
  );

  return mapToItem(res[0].rows.item(0));
}

const mapToItem = (raw: any): ListItem => {
  return {
    itemId: raw.itemId, listId: raw.listId,
    name: raw.name, checked: !!raw.checked,
    year: new Date(raw.year), rate: raw.rate,
    author: { id: raw.authorId, name: raw.authorName },
    genre: { id: raw.genreId, name: raw.genreName }
  }
}

export {
  insertListItem, getListItems, updateListItem, deleteListItem, getItemById,
  createItemsTable, insertAuthor, insertGenre, matchAuthor, matchGenre
};
