import Papa from 'papaparse';
import RNFS from 'react-native-fs';
import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';

enablePromise(true);

const exportColumns = [
  'listId', 'listName', 'itemId', 'itemName', 'year', 'checked', 'rate',
  'authorId', 'authorName', 'genreId', 'genreName', 'rateDate', 'createdAt'
];

interface ExportRow {
  listId: number;
  listName: string;
  itemId: number;
  itemName: string;
  year: string | null;
  checked: boolean | null;
  rate: number | null;
  authorId: number | null;
  authorName: string | null;
  genreId: number | null;
  genreName: string | null;
  rateDate: string | null;
  createdAt: string | null;
}

let db: SQLiteDatabase | null = null;

async function getDatabase(): Promise<SQLiteDatabase> {
  if (db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' });
  return db;
}

const toIsoString = (value: string | null): string | null => {
  if (value === null || value === undefined) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

const exportLists = async (): Promise<string> => {
  const database = await getDatabase();
  const result = await database.executeSql(
    `SELECT l.listId, l.name as listName, i.itemId, i.name as itemName,
      i.year, i.checked, i.rate, i.authorId, a.name as authorName,
      i.genreId, g.name as genreName, i.rateDate, i.createdAt
    FROM Lists l
    INNER JOIN Items i on i.listId = l.listId
    LEFT JOIN Authors a on a.rowid = i.authorId
    LEFT JOIN Genres g on g.rowid = i.genreId
    ORDER BY l.listId, i.itemId`
  );

  const rows: ExportRow[] = result[0].rows.raw().map((row: any) => ({
    listId: row.listId,
    listName: row.listName,
    itemId: row.itemId,
    itemName: row.itemName,
    year: toIsoString(row.year),
    checked: row.checked === null || row.checked === undefined ? null : !!row.checked,
    rate: row.rate ?? null,
    authorId: row.authorId ?? null,
    authorName: row.authorName ?? null,
    genreId: row.genreId ?? null,
    genreName: row.genreName ?? null,
    rateDate: toIsoString(row.rateDate),
    createdAt: toIsoString(row.createdAt),
  }));

  const csv = Papa.unparse(rows, { columns: exportColumns });
  const path = `${RNFS.DocumentDirectoryPath}/rated-media-lists.csv`;
  await RNFS.writeFile(path, csv, 'utf8');

  return path;
};

export { exportLists };