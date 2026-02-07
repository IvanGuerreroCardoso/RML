import { List } from '../models/models';
import SQLite from 'react-native-sqlite-storage';

const db: SQLite.SQLiteDatabase = SQLite.openDatabase(
      { name: 'ratedMediaLists.db', location: 'default' },
      () => console.log('Database opened'),
      _error => console.log('Error opening database')
    );

const createListTable = () => {
  return db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Lists (listId INTEGER PRIMARY KEY NOT NULL, name TEXT, checked BOOLEAN);'
    );})
};

const insertList = (name: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Lists (name, checked) values (?, false)',
        [name],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

const getLists = (): Promise<List[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Lists',
        [],
        (_, res) => {
          const items = res.rows.raw().map((item: any) => ({ listId: item.listId, name: item.name, checked: item.checked }));
          resolve(items);
        },
        (_, error) => reject(error)
      );
    });
  });
};

const updateList = (list: List): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Lists SET name = ?, checked = ? WHERE id = ?',
        [list.name, list.checked, list.listId],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

const deleteList = (id: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM Lists WHERE listId = ?`,
        [id],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

export { insertList, getLists, updateList, deleteList, createListTable };
