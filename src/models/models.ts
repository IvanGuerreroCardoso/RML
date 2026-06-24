interface ListItem {
  itemId: number,
  listId: number,
  name: string,
  author?: Author,
  genre?: Genre,
  year: Date,
  checked: boolean,
  rate: number | null
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
  language: string | null
}

enum CheckedEnum {
  All,
  Seen,
  Unseen,
}

type RootStackParamList = {
  Home: undefined;
  AddList: { listId: number | null };
  AddItem: { listId: number, itemId: number | null };
  List: { listId: number; name: string };
  Settings: undefined;
}

export type { ListItem, List, Author, Genre, RootStackParamList, AppSettings }
export { CheckedEnum }
