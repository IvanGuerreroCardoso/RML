import { View, StyleSheet, FlatList } from "react-native"
import { Text, Button, SearchBar } from "@rneui/themed"
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getLists } from "../services/listsDbService";
import { List } from '../models/models';
import { useEffect, useState, useCallback } from "react";
import RateableList from "../components/RateableList";
import { t } from "i18next";
import Feather from "@react-native-vector-icons/feather";
import { useAppTheme } from "../context/ThemeContext";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
  }
})

export default function HomeScreen() {
  const [lists, setLists] = useState<List[]>([]);
  const [shownLists, setShownLists] = useState<List[]>([]);
  const [searchTxt, setSearchTxt] = useState("")
  const navigation = useNavigation();
  const { theme } = useAppTheme();

  useEffect(() => {
    updateList();
  }, []);

  useEffect(() => {
    if (searchTxt) {
      setShownLists(lists.filter(l => strContains(l.name, searchTxt)));
      return;
    }
    setShownLists(lists);
  }, [searchTxt, lists])

  useFocusEffect(
    useCallback(() => {
      updateList();
      navigation.setOptions({ title: t("yourLists") });
    }, [])
  );

  function updateList() {
    getLists().then((res) => {
      setLists(res);
    });
  }

  function strContains(str: string, substr: string) {
    if (!str)
      return false;
    return str.toLowerCase().includes(substr.toLowerCase());
  }

  return (
    <View style={styles.container}>
      {lists.length === 0 && <Text style={{ marginHorizontal: 15, marginTop: 10, borderRadius: 10 }}>{t("noListsMsg")}</Text>}
      <Button
        title={t("addList")}
        onPress={() => navigation.navigate("AddList", { listId: null })}
        buttonStyle={{ margin: 10, height: 40, width: "auto", borderRadius: 10 }}
      />
      <SearchBar
        placeholder={t("searchByName")}
        placeholderTextColor={theme.colors?.mutedText}
        value={searchTxt}
        onChangeText={setSearchTxt}
        style={{ color: theme.colors?.text, minWidth: 600 }}
        searchIcon={<Feather name="search" size={15} color={theme.colors?.text} />}
      />
      <FlatList
        data={shownLists}
        renderItem={({ item }) => <RateableList list={item} updateList={updateList} />}
      />
    </View>
  );
}
