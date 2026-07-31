interface ListItem {
  itemId: number,
  listId: number,
  name: string,
  author?: Author,
  genre?: Genre,
  year: Date | null,
  checked: boolean,
  rate: number | null,
  rateDate: Date | null,
}

interface Author {
  id: number,
  name: string
}

interface Genre {
  id: number,
  name: string
}

interface List {
  listId: number,
  name: string,
  checked: boolean
}

interface AppSettings {
  id: number,
  theme: "light" | "dark" | null,
  language: string | null,
  tutorial: number | null
}

enum CheckedEnum {
  All,
  Seen,
  Unseen,
}

enum OrderByEnum {
  Id,
  Name,
  Author,
  Genre,
  Rate,
  Year,
  RateDate,
}

type RootStackParamList = {
  Home: undefined;
  AddList: { listId: number | null };
  AddItem: { listId: number, itemId: number | null };
  List: { listId: number; name: string };
  Settings: undefined;
}

export type { ListItem, List, Author, Genre, RootStackParamList, AppSettings }
export { CheckedEnum, OrderByEnum }
