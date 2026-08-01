import { List } from '../models/models';
import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';

enablePromise(true);

var db: SQLiteDatabase | null = null;

async function getDatabase() {
  if (db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' })
  return db;
};

const insertList = async (name: string): Promise<number> => {
  let db = await getDatabase();

  return (await db.executeSql(
    'INSERT INTO Lists (name, checked) values (?, false)',
    [name]
  ))[0].insertId;
};

const getLists = async (): Promise<List[]> => {
  let db = await getDatabase();

  let res = await db.executeSql(
    'SELECT * FROM Lists'
  );

  return res[0].rows.raw().map((item: any) => ({ listId: item.listId, name: item.name, checked: !!item.checked }));
};

const getListById = async (id: number): Promise<List | null> => {
  let db = await getDatabase();

  let res = await db.executeSql("SELECT name, checked FROM Lists WHERE listId = ?", [id]);

  if (res[0].rows.length == 0) return null;

  let list = res[0].rows.item(0);

  return { name: list.name, checked: list.checked, listId: id };
}

const updateList = async (list: List): Promise<number> => {
  let db = await getDatabase();

  let res = await db.executeSql(
    'UPDATE Lists SET name = ?, checked = ? WHERE listId = ?',
    [list.name, list.checked, list.listId])

  return res[0].rowsAffected;
};

const updateListCheck = async (listId: number, checked: boolean) => {
  let db = await getDatabase();

  let res = await db.executeSql(
    'UPDATE Lists SET checked = ? WHERE listId = ?',
    [checked, listId])

  return res[0].rowsAffected;
}

const deleteList = async (id: number): Promise<number> => {
  let db = await getDatabase();
  let affectedRows = 0;

  await db.transaction(async (txn) => {
    let deletedItemsTask = txn.executeSql("DELETE FROM Items WHERE listId = ? ", [id]);
    let deletedListTask = txn.executeSql("DELETE FROM Lists WHERE listId = ?", [id]);

    affectedRows += ((await deletedItemsTask)[1].rowsAffected + (await deletedListTask)[1].rowsAffected);
  })

  return affectedRows;
};

export { insertList, getLists, updateList, deleteList, getListById, updateListCheck };
