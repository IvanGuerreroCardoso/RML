import Papa from 'papaparse';
import { openDatabase, enablePromise, SQLiteDatabase } from 'react-native-sqlite-storage';

enablePromise(true);

interface ImportRow {
  listId?: string;
  listName?: string;
  itemId?: string;
  itemName?: string;
  year?: string;
  checked?: string;
  rate?: string;
  authorId?: string;
  authorName?: string;
  genreId?: string;
  genreName?: string;
  rateDate?: string;
  createdAt?: string;
}

interface ImportResult {
  listsCreated: number;
  itemsCreated: number;
  rowsSkipped: number;
}

let db: SQLiteDatabase | null = null;

async function getDatabase(): Promise<SQLiteDatabase> {
  if (db != null) return db;

  db = await openDatabase({ name: 'ratedMediaLists.db', location: 'default' });
  return db;
}

const optionalNumber = (value?: string): number | null => {
  if (value === undefined || value.trim() === '') return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const optionalBoolean = (value?: string): boolean | null => {
  if (value === undefined || value.trim() === '') return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return null;
};

const optionalDate = (value?: string): string | null => {
  if (value === undefined || value.trim() === '') return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const getOrCreateReferenceId = async (
  database: SQLiteDatabase,
  table: 'Authors' | 'Genres',
  name?: string,
): Promise<number | null> => {
  const trimmedName = name?.trim();
  if (!trimmedName) return null;

  const existing = await database.executeSql(
    `SELECT rowid FROM ${table} WHERE name = ? LIMIT 1`,
    [trimmedName]
  );
  if (existing[0].rows.length > 0) return existing[0].rows.item(0).rowid;

  const inserted = await database.executeSql(
    `INSERT INTO ${table} (name) VALUES (?)`,
    [trimmedName]
  );
  return inserted[0].insertId;
};

const importLists = async (csv: string): Promise<ImportResult> => {
  const parsed = Papa.parse<ImportRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Could not parse CSV: ${parsed.errors[0].message}`);
  }

  const database = await getDatabase();
  const sourceLists = new Map<string, number>();
  let listsCreated = 0;
  let itemsCreated = 0;
  let rowsSkipped = 0;

  for (const row of parsed.data) {
    const listName = row.listName?.trim();
    const itemName = row.itemName?.trim();

    if (!listName || !itemName) {
      rowsSkipped++;
      continue;
    }

    const sourceListKey = row.listId?.trim()
      ? `id:${row.listId.trim()}`
      : `name:${listName}`;
    let receivingListId = sourceLists.get(sourceListKey);

    if (receivingListId === undefined) {
      const listResult = await database.executeSql(
        'INSERT INTO Lists (name, checked) values (?, false)',
        [listName]
      );
      receivingListId = listResult[0].insertId;
      sourceLists.set(sourceListKey, receivingListId);
      listsCreated++;
    }

    const authorId = await getOrCreateReferenceId(database, 'Authors', row.authorName);
    const genreId = await getOrCreateReferenceId(database, 'Genres', row.genreName);

    await database.executeSql(
      `INSERT INTO Items
        (name, listId, year, checked, rate, authorId, genreId, rateDate, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemName,
        receivingListId,
        optionalDate(row.year),
        optionalBoolean(row.checked),
        optionalNumber(row.rate),
        authorId,
        genreId,
        optionalDate(row.rateDate),
        optionalDate(row.createdAt),
      ]
    );
    itemsCreated++;
  }

  return { listsCreated, itemsCreated, rowsSkipped };
};

export { importLists };
export type { ImportResult };