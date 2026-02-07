import { ListItem } from '../models/models';
import SQLite from 'react-native-sqlite-storage';

const db: SQLite.SQLiteDatabase = SQLite.openDatabase(
      { name: 'ratedMediaLists.db', location: 'default' },
      () => console.log('Database opened'),
      _error => console.log('Error opening database')
    );

const createItemsTable = () => {
  return db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Items 
      (itemId INTEGER PRIMARY KEY NOT NULL, name TEXT, listId INT NOT NULL, year DATE, checked BOOLEAN, author TEXT, 
      FOREIGN KEY (listId) REFERENCES Lists(listId) ON DELETE CASCADE);`
    );})
};

const insertListItem = (item: ListItem): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO ListItems (name, listId, year, checkeed, author) values (?,?,?,?,?)',
        [item.name, item.listId, item.year, item.checked, item.author],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

const getListItems = (listId: number): Promise<ListItem[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT *
        FROM ListItems WHERE listId = ?`,
        [listId],
        (_, res) => {
          const items = res.rows.raw().map((item: any) => ({ 
            itemId: item.listId, listId: item.listId,
            name: item.name, checked: item.checked,
            author: item.author, year: item.year
        }));
          resolve(items);
        },
        (_, error) => reject(error)
      );
    });
  });
};

const updateListItem = (item: ListItem): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE ListItems SET name = ?, checked = ?, year = ?, author = ? WHERE itemId = ?',
        [item.name, item.checked, item.year, item.author, item.itemId],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

const deleteListItem = (id: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM ListItems WHERE id = ?',
        [id],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

export { insertListItem, getListItems, updateListItem, deleteListItem, createItemsTable };
