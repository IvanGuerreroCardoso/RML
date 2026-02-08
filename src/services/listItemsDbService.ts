import { ListItem } from '../models/models';
import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';

enablePromise(true);

var db: SQLiteDatabase | null = null;

async function getDatabase(){
  if(db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' })
  return db;
};

const createItemsTable = async () => {
  var db = await getDatabase();
  return await db.executeSql(
    `CREATE TABLE IF NOT EXISTS Items 
    (itemId INTEGER PRIMARY KEY NOT NULL, name TEXT, listId INT NOT NULL, year DATE, checked BOOLEAN, author TEXT, 
    FOREIGN KEY (listId) REFERENCES Lists(listId) ON DELETE CASCADE);`
  )
};

const insertListItem = async (item: ListItem): Promise<number> => {
  var db = await getDatabase();

  return (await db.executeSql(
    'INSERT INTO Items (name, listId, year, checked, author) values (?,?,?,?,?)',
    [item.name, item.listId, item.year, item.checked, item.author]
  ))[0].insertId;
};

const getAllItemsCount = async (): Promise<number> =>{
  var db = await getDatabase();

  var res = await db.executeSql(
    `SELECT *
    FROM Items`,
    []
  );
  console.log(res[0].rows.raw())
  return res[0].rows.raw().length;
}

const getListItems = async (listId: number): Promise<ListItem[]> => {
  var db = await getDatabase();

  var res = await db.executeSql(
    `SELECT *
    FROM Items WHERE listId = ?`,
    [listId]
  );
  
  return res[0].rows.raw().map((item: any) => ({ 
    itemId: item.listId, listId: item.listId,
    name: item.name, checked: item.checked,
    author: item.author, year: item.year}));
};

const updateListItem = async (item: ListItem): Promise<number> => {
  var db = await getDatabase();

  return (await db.executeSql(
    'UPDATE Items SET name = ?, checked = ?, year = ?, author = ? WHERE itemId = ?',
    [item.name, item.checked, item.year, item.author, item.itemId]
  ))[0].rowsAffected;
};

const deleteListItem = async (id: number): Promise<number> => {
  var db = await getDatabase();

  return (await db.executeSql(
    'DELETE FROM Items WHERE itemId = ?',
    [id]
  ))[0].rowsAffected;
};

export { insertListItem, getListItems, updateListItem, deleteListItem, createItemsTable, getAllItemsCount };
