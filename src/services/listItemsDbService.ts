import { Author, Genre, ListItem } from '../models/models';
import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';

enablePromise(true);

var db: SQLiteDatabase | null = null;

async function getDatabase() {
  if (db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' })
  return db;
};

const insertListItem = async (item: ListItem): Promise<number> => {
  let db = await getDatabase();

  return (await db.executeSql(
    'INSERT INTO Items (name, listId, year, checked, rate, authorId, genreId, rateDate, createdAt) values (?,?,?,?,?,?,?,?,?)',
    [item.name, item.listId, item.year ? item.year.toISOString() : null,
    item.checked, item.rate, item.author?.id ?? null, item.genre?.id ?? null,
    item.rateDate === null ? null : item.rateDate?.toISOString(), new Date().toISOString()]
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

const getListItems = async (listId: number): Promise<ListItem[]> => {
  let db = await getDatabase();

  let res = await db.executeSql(
    `SELECT i.itemId, i.listId, i.name, i.checked, i.year, i.rate,
      i.authorId, a.name as authorName, i.genreId, g.name as genreName, i.rateDate
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
    'UPDATE Items SET name = ?, checked = ?, year = ?, rate = ?, authorId = ?, genreId = ?, rateDate = ? WHERE itemId = ?',
    [item.name, item.checked, item.year === null ? null : item.year.toISOString(),
    item.rate, item.author!.id!, item.genre?.id ?? null, item.rateDate === null ? null : item.rateDate?.toISOString(), item.itemId]
  ))[0].rowsAffected;
};

const deleteListItem = async (id: number, authorId: number | null, genreId: number | null): Promise<number> => {
  let db = await getDatabase();

  let result: number = (await db.executeSql(
    'DELETE FROM Items WHERE itemId = ?',
    [id]
  ))[0].rowsAffected;


  let authorCleanupTask: Promise<any> | null = null;
  if (authorId) {
    authorCleanupTask = db.executeSql(`DELETE FROM Authors WHERE rowid = ? AND rowid NOT IN(
      SELECT i.authorId FROM Items i WHERE i.authorId = ?
    )`, [authorId, authorId]);
  }

  let genreCleanupTask: Promise<any> | null = null;
  if (genreId) {
    genreCleanupTask = db.executeSql(`DELETE FROM Genres WHERE rowid = ? AND rowid NOT IN(
      SELECT i.genreId FROM Items i WHERE i.genreId = ?
    )`, [genreId, genreId]);
  }

  authorCleanupTask && await authorCleanupTask;
  genreCleanupTask && await genreCleanupTask;

  return result;
};

const getItemById = async (itemId: number): Promise<ListItem> => {
  let db = await getDatabase();

  let res = await db.executeSql(
    `SELECT i.itemId, i.listId, i.name, i.checked, i.year, i.rate,
      i.authorId, a.name as authorName, i.genreId, g.name as genreName, i.rateDate
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
    year: raw.year === null ? null : new Date(raw.year), rate: raw.rate,
    author: { id: raw.authorId, name: raw.authorName },
    genre: { id: raw.genreId, name: raw.genreName },
    rateDate: raw.rateDate === null ? null : new Date(raw.rateDate)
  }
}

async function getItemsCount() {
  let db = await getDatabase();

  const result = await db.executeSql(`
  SELECT name
  FROM sqlite_master
  WHERE type = 'table' AND name = 'Items';
`);

  const created = result[0].rows.length > 0;

  if (!created) return null;

  let res = await db.executeSql(
    `SELECT * FROM Items`,
  );

  return (res[0].rows.length);
}

export {
  insertListItem, getListItems, updateListItem, deleteListItem, getItemById, insertAuthor, insertGenre, matchAuthor, matchGenre, getItemsCount
};
