interface ListItem{
  itemId: number,
  listId: number,
  name: string,
  author?: Author,
  genre?: Genre,
  year: Date,
  checked: boolean,
  rate: number | null
}

interface Author{
  id: number,
  name: string
}

interface Genre{
  id: number,
  name: string
}

interface List{
  listId: number,
  name: string,
  checked: boolean
}

export type { ListItem, List, Author, Genre }