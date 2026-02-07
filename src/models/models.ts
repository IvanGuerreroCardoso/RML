interface ListItem{
  itemId?: number,
  listId: number,
  name: string,
  author: string,
  year: Date,
  checked: boolean
}

interface List{
  listId: number,
  name: string,
  checked: boolean
}

export type { ListItem, List }