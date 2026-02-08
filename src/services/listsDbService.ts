import { List } from '../models/models';
import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';

enablePromise(true);

var db: SQLiteDatabase | null = null;

async function getDatabase(){
  if(db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' })
  return db;
};

const createListTable = async () => {
  var db = await getDatabase();

  return await db.executeSql(
    'CREATE TABLE IF NOT EXISTS Lists (listId INTEGER PRIMARY KEY NOT NULL, name TEXT, checked BOOLEAN);'
  );
};

const insertList = async (name: string): Promise<number> => {
  var db = await getDatabase();

  return (await db.executeSql(
    'INSERT INTO Lists (name, checked) values (?, false)',
    [name]
  ))[0].insertId;
};

const getLists = async (): Promise<List[]> => {
  var db = await getDatabase();

  let res = await db.executeSql(
    'SELECT * FROM Lists'
  );

  return res[0].rows.raw().map((item: any) => ({ listId: item.listId, name: item.name, checked: item.checked }));
};

const updateList = async (list: List): Promise<number> => {
  var db = await getDatabase();

  let res = await db.executeSql(
    'UPDATE Lists SET name = ?, checked = ? WHERE id = ?',
    [list.name, list.checked, list.listId])

  return res[0].rowsAffected;
};

const deleteList = async (id: number): Promise<number> => {
  var db = await getDatabase();
  var affectedRows = 0;
  
  await db.transaction(async (txn)=>{
    var deletedItemsTask = txn.executeSql("DELETE FROM Items WHERE listId = ? ", [id]);
    var deletedListTask = txn.executeSql("DELETE FROM Lists WHERE listId = ?", [id]);

    affectedRows += ((await deletedItemsTask)[1].rowsAffected + (await deletedListTask)[1].rowsAffected);
  })

  return affectedRows;
};

export { insertList, getLists, updateList, deleteList, createListTable };
