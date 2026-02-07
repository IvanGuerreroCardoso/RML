import {ListItem} from '../models/models';
import SQLite from 'react-native-sqlite-storage';

const db: SQLite.SQLiteDatabase = SQLite.openDatabase(
      { name: 'ratedMediaLists.db', location: 'default' },
      () => console.log('Database opened'),
      _error => console.log('Error opening database')
    );

const createListTable = () => {
  return db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY NOT NULL, name TEXT);'
    );})
};

const insertList = (name: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO items (name) values (?)',
        [name],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

const getLists = (): Promise<ListItem[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM items',
        [],
        (_, res) => {
          const items = res.rows.raw().map((item: any) => ({ id: item.id, name: item.name }));
          resolve(items);
        },
        (_, error) => reject(error)
      );
    });
  });
};

const updateList = (id: number, name: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE items SET name = ? WHERE id = ?',
        [name, id],
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
        'DELETE FROM items WHERE id = ?',
        [id],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

export { insertList, getLists, updateList, deleteList, createListTable };
