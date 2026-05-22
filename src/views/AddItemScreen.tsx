import { View, StyleSheet, FlatList } from "react-native"
import { Button, Input, ListItem } from "@rneui/themed"
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { getItemById, insertAuthor, insertGenre, insertListItem, matchAuthor, matchGenre, updateListItem } from "../services/listItemsDbService";
import { Author, Genre, RootStackParamList } from "../models/models"
import { t } from "i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    backgroundColor: 'red',
    maxHeight: 130,
    flexGrow: 0,
    overflow: 'scroll'
  }
})

type Props = NativeStackScreenProps<RootStackParamList, "AddItem">;

export default function AddItemScreen({ route }: Props) {
  const navigation = useNavigation();
  const { listId, itemId } = route.params;
  const [name, setName] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [authorId, setAuthorId] = useState<number>(0);
  const [genre, setGenre] = useState<string>("");
  const [genreId, setGenreId] = useState<number>(0);
  const [year, setYear] = useState<string>("");
  const [authorsMatch, setAuthorsMatch] = useState<Author[]>([]);
  const [genreMatch, setGenreMatch] = useState<Genre[]>([]);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
  const [checked, setChecked] = useState<boolean>(false);
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    if (itemId) {
      getItemById(itemId).then((item) => {
        setAuthor(item.author?.name || "");
        setAuthorId(item.author?.id || 0);
        setGenre(item.genre?.name || "");
        setGenreId(item.genre?.id || 0);
        setYear(item.year.getFullYear().toString());
        setName(item.name);
        setChecked(item.checked);
        setRate(item.rate);
      })
    }
  }, [])

  async function createItem() {
    let authorIdTask = null;
    let genreIdTask = null;

    if (author && authorId === 0) {
      authorIdTask = insertAuthor(author);
    }
    if (genre && genreId === 0) {
      genreIdTask = insertGenre(genre);
    }

    let authorIdToSave = authorIdTask ? await authorIdTask : authorId !== 0 ? authorId : null;
    let genreIdToSave = genreIdTask ? await genreIdTask : genreId !== 0 ? genreId : null;

    let itemToSave = {
      itemId: itemId ?? 0,
      name,
      checked,
      author: authorIdToSave ? { id: authorIdToSave, name: author } : undefined,
      genre: genreIdToSave ? { id: genreIdToSave, name: genre } : undefined,
      listId,
      year: new Date(parseInt(year), 0, 1), // parse to Date as 01/01/yy
      rate
    }

    if (itemId) {
      updateListItem(itemToSave).then(() => navigation.goBack());
      return;
    }

    insertListItem(itemToSave).then(() => navigation.goBack());
  };

  useEffect(() => {
    setBtnDisabled(name === "" || author === "");
  }, [name, author, authorsMatch, genreMatch])

  function authorChanged(txt: string) {
    setAuthor(txt);
    setAuthorId(0);

    if (txt.length > 2) {
      matchAuthor(txt).then(res => setAuthorsMatch(res));
    }
  }

  function genreChanged(txt: string) {
    setGenre(txt);
    setGenreId(0);

    if (txt.length > 2) {
      matchGenre(txt).then(res => setGenreMatch(res));
    }
  }

  function authorSelected(author: Author) {
    setAuthor(author.name);
    setAuthorId(author.id);
    setAuthorsMatch([]);
  }

  function genreSelected(author: Author) {
    setGenre(author.name);
    setGenreId(author.id);
    setGenreMatch([]);
  }

  function getMatchesFlatList(list: Author[] | Genre[], itemSelected: (item: Author | Genre) => void) {
    return (
      <FlatList
        data={list}
        style={styles.flatList}
        keyExtractor={item => item.id + item.name}
        renderItem={({ item }) => <ListItem onPress={() => itemSelected(item)}><ListItem.Title>{item.name}</ListItem.Title></ListItem>}
        persistentScrollbar={list.length > 2}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        indicatorStyle="black" />
    )
  }

  return (
    <View style={styles.container}>
      <Input placeholder={t("name")} value={name} onChangeText={setName} />
      <Input placeholder={t("author")} value={author} onChangeText={authorChanged} />
      {authorsMatch.length > 0 &&
        getMatchesFlatList(authorsMatch, authorSelected)
      }
      <Input placeholder={t("genre")} value={genre} onChangeText={genreChanged} />
      {genreMatch.length > 0 &&
        getMatchesFlatList(genreMatch, genreSelected)
      }
      <Input placeholder={t("year")} value={year} onChangeText={setYear} keyboardType="numeric" />
      <Button title={t("add")} onPress={() => createItem()} disabled={btnDisabled} />
    </View>
  );
}
