import { View, StyleSheet, FlatList } from "react-native"
import { Button, Input, ListItem } from "@rneui/themed"
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { getItemById, insertAuthor, insertGenre, insertListItem, matchAuthor, matchGenre, updateListItem } from "../services/listItemsDbService";
import { Author, Genre, RootStackParamList, ListItem as Item } from "../models/models"
import { t } from "i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { updateListCheck } from "../services/listsDbService";
import { useAppTheme } from "../context/ThemeContext";

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
  const { theme } = useAppTheme();

  const [name, setName] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [authorId, setAuthorId] = useState<number>(0);
  const [genre, setGenre] = useState<string>("");
  const [genreId, setGenreId] = useState<number>(0);
  const [year, setYear] = useState<string>("");
  const [authorMatches, setAuthorMatches] = useState<Author[]>([]);
  const [genreMatches, setGenreMatches] = useState<Genre[]>([]);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
  const [checked, setChecked] = useState<boolean>(false);
  const [rate, setRate] = useState<number | null>(null);
  const [originalItem, setOriginalItem] = useState<Item | null>(null);

  useEffect(() => {
    if (itemId) {
      navigation.setOptions({ title: t("editItem") });
      getItemById(itemId).then((item) => {
        setOriginalItem(item);
        setAuthor(item.author?.name || "");
        setAuthorId(item.author?.id || 0);
        setGenre(item.genre?.name || "");
        setGenreId(item.genre?.id || 0);
        setYear(item.year ? new Date(item.year).getFullYear().toString() : "");
        setName(item.name);
        setChecked(item.checked);
        setRate(item.rate);
      })
    }
  }, [])

  async function createItem() {
    let authorIdTask = null;
    let genreIdTask = null;
    let existentAuthorId: number | null = null;
    let existentGenreId: number | null = null;

    if (authorMatches.length > 0) {
      let existentAuthor = authorMatches.find(a => a.name.trim() === author.trim());
      existentAuthorId = existentAuthor?.id ?? null;
    }

    if (genreMatches.length > 0) {
      let existentGenre = genreMatches.find(a => a.name.trim() === genre.trim());
      existentGenreId = existentGenre?.id ?? null;
    }

    if (author && !existentAuthorId && authorId === 0) {
      authorIdTask = insertAuthor(author.trim());
    }

    if (genre && !existentGenreId && genreId === 0) {
      genreIdTask = insertGenre(genre.trim());
    }

    let authorIdToSave = authorIdTask ? await authorIdTask : authorId !== 0 ? authorId : existentAuthorId;
    let genreIdToSave = genreIdTask ? await genreIdTask : genreId !== 0 ? genreId : existentGenreId;

    let itemToSave = {
      itemId: itemId ?? 0,
      name: name.trim(),
      checked,
      author: authorIdToSave ? { id: authorIdToSave, name: author.trim() } : undefined,
      genre: genreIdToSave ? { id: genreIdToSave, name: genre.trim() } : undefined,
      listId,
      year: year ? new Date(parseInt(year), 0, 1) : null, // parse to Date as 01/01/yy
      rate
    }

    if (itemId) {
      updateListItem(itemToSave).then(() => navigation.goBack());
      return;
    }

    let uncheckListTask = updateListCheck(listId, false);
    let insertListItemTask = insertListItem(itemToSave);

    await uncheckListTask;
    await insertListItemTask;

    navigation.goBack();
  };

  useEffect(() => {
    if (!originalItem) {
      setBtnDisabled(name.trim() === "" || author.trim() === "");
      return;
    }

    setBtnDisabled(
      name === originalItem.name &&
      author === originalItem.author?.name &&
      year === (originalItem.year?.getFullYear().toString() ?? "") &&
      genre === originalItem.genre?.name
    )
  }, [name, author, authorMatches, genreMatches, year, genre, originalItem])

  function authorChanged(txt: string) {
    setAuthor(txt);
    setAuthorId(0);

    if (txt.length <= 2) {
      setAuthorMatches([]);
      return;
    }
    matchAuthor(txt).then(res => setAuthorMatches(res));
  }

  function genreChanged(txt: string) {
    setGenre(txt);
    setGenreId(0);

    if (txt.length <= 2) {
      setGenreMatches([]);
      return;
    }
    matchGenre(txt).then(res => setGenreMatches(res));
  }

  function authorSelected(author: Author) {
    setAuthor(author.name);
    setAuthorId(author.id);
    setAuthorMatches([]);
  }

  function genreSelected(author: Author) {
    setGenre(author.name);
    setGenreId(author.id);
    setGenreMatches([]);
  }

  const yearChanged = (yr: string) => { if (has0to4digits(yr)) { setYear(yr) } };

  function has0to4digits(str: string) { return /^\d{0,4}$/gm.test(str) }

  function getMatchesFlatList(list: Author[] | Genre[], itemSelected: (item: Author | Genre) => void) {
    return (
      <FlatList
        data={list}
        style={styles.flatList}
        keyExtractor={item => item.id + item.name}
        renderItem={({ item }) => (
          <ListItem containerStyle={{ backgroundColor: theme.colors?.primCard }} onPress={() => itemSelected(item)}>
            <ListItem.Title style={{ color: theme.colors?.black }}>{item.name}</ListItem.Title>
          </ListItem>)}
        persistentScrollbar={list.length > 2}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        indicatorStyle="black" />
    )
  }

  return (
    <View style={styles.container}>
      <Input placeholder={t("name")} placeholderTextColor={theme.colors?.mutedText} value={name} onChangeText={setName} />
      <Input placeholder={t("author")} placeholderTextColor={theme.colors?.mutedText} value={author} onChangeText={authorChanged} />
      {authorMatches.length > 0 &&
        getMatchesFlatList(authorMatches, authorSelected)
      }
      <Input placeholder={t("genre")} placeholderTextColor={theme.colors?.mutedText} value={genre} onChangeText={genreChanged} />
      {genreMatches.length > 0 &&
        getMatchesFlatList(genreMatches, genreSelected)
      }
      <Input placeholder={t("year")} placeholderTextColor={theme.colors?.mutedText} value={year} onChangeText={yearChanged} keyboardType="numeric" />
      <Button
        title={itemId ? t("edit") : t("add")}
        onPress={() => createItem()}
        buttonStyle={{ marginHorizontal: 10, height: 40, borderRadius: 10 }}
        disabled={btnDisabled}
      />
    </View>
  );
}
