import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native"
import { Button, Input, ListItem, Slider, Text } from "@rneui/themed"
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { getItemById, insertAuthor, insertGenre, insertListItem, matchAuthor, matchGenre, updateListItem } from "../services/listItemsDbService";
import { Author, Genre, RootStackParamList, ListItem as Item } from "../models/models"
import { t } from "i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { updateListCheck } from "../services/listsDbService";
import { useAppTheme } from "../context/ThemeContext";
import Feather from "@react-native-vector-icons/feather";

const styles = StyleSheet.create({
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
  const [rateDate, setRateDate] = useState<string>("");
  const [authorMatches, setAuthorMatches] = useState<Author[]>([]);
  const [genreMatches, setGenreMatches] = useState<Genre[]>([]);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
  const [checked, setChecked] = useState<boolean>(false);
  const [rate, setRate] = useState<number | null>(null);
  const [originalItem, setOriginalItem] = useState<Item | null>(null);
  const [yearValid, setYearValid] = useState(true);
  const [rateDateValid, setRateDateValid] = useState(true);

  useEffect(() => {
    if (itemId) {
      navigation.setOptions({ title: t("editItem") });
      getItemById(itemId).then((item) => {
        setOriginalItem(item);
        setAuthor(item.author?.name || "");
        setAuthorId(item.author?.id || 0);
        setGenre(item.genre?.name || "");
        setGenreId(item.genre?.id || 0);
        setYear(item.year instanceof Date && !isNaN(item.year.getTime()) ? item.year.getFullYear().toString() : "");
        setName(item.name);
        setChecked(item.checked);
        setRate(item.rate);
        setRateDate(item.rateDate !== null ? `${item.rateDate.getMonth() < 9 ? '0' : ''}${item.rateDate.getMonth() + 1}/${item.rateDate.getFullYear()}` : "");
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
      rate,
      rateDate: dateFromString(rateDate)
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

  function dateFromString(str: string) {
    if (str === null || str === "") {
      return null;
    }

    const splitStr = str.split('/');

    return new Date(parseInt(splitStr[1]), parseInt(splitStr[0]) - 1, 1);
  }

  useEffect(() => {
    if (!originalItem) {
      setBtnDisabled(name.trim() === "" || author.trim() === "" || !rateDateValid || !yearValid);
      return;
    }

    setBtnDisabled(
      (name.trim() === "" || author.trim() === "" || !rateDateValid || !yearValid) ||
      (name === originalItem.name &&
        author === originalItem.author?.name &&
        year === (originalItem.year?.getFullYear().toString() ?? "") &&
        genre === originalItem.genre?.name &&
        rate === originalItem.rate &&
        rateDate === (originalItem.rateDate !== null ? `${originalItem.rateDate.getMonth()}/${originalItem.rateDate.getFullYear()}` : ""))
    );
  }, [name, author, authorMatches, genreMatches, year, genre, originalItem, rateDate])

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

  function rateDateChanged(rd: string) {
    if (/^\d{0,2}\/?\d{0,4}$/gm.test(rd)) {
      if (rd.length > 2 && !rd.includes('/') && rd.length > rateDate.length) {
        rd = rd.substring(0, 2) + '/' + rd.substring(2);
      }
      setRateDate(rd);
      if (rd.length > 2) {
        setRateDateValid(/^\d{2}\/\d{4}$/gm.test(rd) && parseInt(rd.substring(0, 2)) <= 12);
      }
    }
  }

  const yearChanged = (yr: string) => {
    if (has0to4digits(yr)) {
      setYear(yr);
      setYearValid(yr === "" || yr.length === 4);
    }
  };

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "position"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Input label={t("name")} labelStyle={{ color: theme.colors?.text }}
            placeholder={t("name")} placeholderTextColor={theme.colors?.mutedText}
            value={name} onChangeText={setName} />
          <Input label={t("author")} labelStyle={{ color: theme.colors?.text }}
            placeholder={t("author")} placeholderTextColor={theme.colors?.mutedText}
            value={author} onChangeText={authorChanged} />
          {authorMatches.length > 0 &&
            getMatchesFlatList(authorMatches, authorSelected)
          }
          <Input label={t("genre")} labelStyle={{ color: theme.colors?.text }}
            placeholder={t("genre")} placeholderTextColor={theme.colors?.mutedText}
            value={genre} onChangeText={genreChanged} />
          {genreMatches.length > 0 &&
            getMatchesFlatList(genreMatches, genreSelected)
          }
          <Input label={t("year")} labelStyle={{ color: theme.colors?.text }}
            placeholder={t("year")} placeholderTextColor={theme.colors?.mutedText}
            value={year} onChangeText={yearChanged} keyboardType="numeric" />
          {!yearValid && <Text style={{ color: theme.colors?.error, marginBottom: 15, marginLeft: 20 }}>{t("invalidDate")}</Text>}
          <Text
            style={{ marginHorizontal: 10, fontSize: 15, fontWeight: "bold" }}
          >{t("rate")} {rate && rate > 0 ? `${rate}/10` : ""}</Text>
          <Slider
            value={rate ?? 0}
            onValueChange={(val) => {
              setRate(val);
              setChecked(val > 0);
              if (val === 0 && rateDate !== "") {
                setRateDate("");
              }
              if (val > 0 && rateDate === "") {
                const d = new Date()
                rateDateChanged(`${d.getMonth() < 9 ? '0' : ''}${d.getMonth() + 1}/${d.getFullYear()}`)
              }
            }}
            maximumValue={10}
            minimumValue={0}
            minimumTrackTintColor="#CC95B3"
            step={1}
            allowTouchTrack
            trackStyle={{ height: 10 }}
            thumbStyle={{ height: 30, width: 30, backgroundColor: "pink" }}
            thumbProps={{
              children: (
                <Feather
                  name="heart"
                  size={30}
                  color="#ee5997"
                />),
            }}
            style={{ marginHorizontal: 10 }}
          />
          <Text style={{ marginHorizontal: 10, fontSize: 16, fontWeight: "bold" }}>{t("ratedDate")}</Text>
          <Input placeholder={"mm/yyyy"}
            placeholderTextColor={theme.colors?.mutedText} value={rateDate}
            onChangeText={rateDateChanged} keyboardType="numeric"
            disabled={rate === null || rate === 0}
          />
          {!rateDateValid && <Text style={{ color: theme.colors?.error, marginBottom: 15, marginLeft: 20 }}>{t("invalidDate")}</Text>}
          <Button
            title={itemId ? t("edit") : t("add")}
            onPress={() => createItem()}
            buttonStyle={{ marginHorizontal: 10, height: 40, borderRadius: 10 }}
            disabled={btnDisabled}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
