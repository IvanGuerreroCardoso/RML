import { useState, useEffect, useCallback } from "react"
import { CheckedEnum, ListItem as Item, RootStackParamList } from "../models/models"
import { getListItems } from "../services/listItemsDbService";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, ButtonGroup, FAB, ListItem, Overlay, SearchBar, Text, Input } from "@rneui/themed";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import RateableItem from "../components/RateableItem";
import { t } from "i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppTheme } from "../context/ThemeContext";
import Feather from "@react-native-vector-icons/feather";
import { updateListCheck } from "../services/listsDbService";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
  },
  searchSection: {
    flex: 1,
    flexDirection: "row",
  },
  smallInput: {
    width: 80,
    marginHorizontal: 2,
  }
})

type Props = NativeStackScreenProps<RootStackParamList, "List">;

export default function ListScreen({ route }: Props) {
  const navigation = useNavigation();
  const { listId, name } = route.params;
  const [listItems, setListItems] = useState<Item[]>([]);
  const [randElemPickOpen, setRandElemPickOpen] = useState(false);
  const { theme } = useAppTheme();
  const [randomActiveElem, setRandomActiveElem] = useState<Item | null>(null);
  const [searchTxt, setSearchTxt] = useState("");
  const [shownList, setShownList] = useState<Item[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [checkedFilter, setCheckedFilter] = useState(CheckedEnum.All);
  const [yearMin, setYearMin] = useState(0);
  const [yearMax, setYearMax] = useState(3000);

  useFocusEffect(
    useCallback(() => {
      updateList();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({ title: name });
    updateList();
  }, []);

  useEffect(() => {
    if (!searchTxt || searchTxt.length < 3)
      return;

    setShownList(listItems.filter(i => i.name.includes(searchTxt) ||
      i.genre?.name.includes(searchTxt) ||
      i.author?.name.includes(searchTxt)
    ))
  }, [searchTxt, listItems])

  function updateList() {
    getListItems(listId).then((res) => {
      setListItems(res);
      if (res.filter(i => !i.checked).length === 0) {
        updateListCheck(listId, true);
      }
    });
  }

  function pickRand() {
    let filteredList = shownList.filter(i => !i.checked);
    setRandomActiveElem((filteredList.length > 0 ? filteredList : shownList)[Math.round(Math.random() * (shownList.length - 1))]);
    setRandElemPickOpen(true);
  }

  const year = () => new Date(randomActiveElem?.year ?? "").getFullYear();

  const updateSearch = (txt: string) => setSearchTxt(txt);

  const updateYearMin = (yr: string) => { if (has0to4digits(yr)) { setYearMin(parseInt(yr)) } };

  const updateYearMax = (yr: string) => { if (has0to4digits(yr)) { setYearMax(parseInt(yr)) } };

  function has0to4digits(str: string) { return /^\d{0,4}$/gm.test(str) }

  function resetFilters() {
    setYearMin(0);
    setYearMax(3000);
    setCheckedFilter(CheckedEnum.All);
  }

  return (
    <View style={styles.container}>
      {listItems.length === 0 ?
        <Text>{t("noItemsInList")}</Text>
        :
        <View>
          <SearchBar placeholder={t("searchByName/Auth/Gen")} value={searchTxt} onChangeText={updateSearch} />
          <Feather name="filter" size={20} color={theme.colors?.text} />
        </View>
      }
      <Button
        title={t("addItem")}
        onPress={() => navigation.navigate("AddItem", { listId, itemId: null })}
        buttonStyle={{ margin: 10, height: 40 }}
      />
      <FlatList
        data={listItems}
        renderItem={({ item }) => <RateableItem item={item} updateList={updateList} />}
      />
      <FAB
        color={theme.colors?.primary}
        placement="right"
        size="small"
        icon={<Feather name="box" color={theme.colors?.text} size={20} />}
        onPress={() => pickRand()}
        title={<Text> {t("randChoise")}</Text>}
      />
      {shownList.length > 0 &&
        <Overlay
          isVisible={randElemPickOpen}
          onBackdropPress={() => setRandElemPickOpen(false)}
        >
          <View
            style={{ minWidth: 500, backgroundColor: theme.colors?.background, borderColor: theme.colors?.border, borderWidth: 1 }}
          >
            <ListItem>
              <ListItem.Content>

                <ListItem.Title style={{ color: theme.colors?.text }}>{randomActiveElem?.checked === true &&
                  <Feather
                    name="check-square"
                    size={20}
                    color="#26a50d"
                  />}{randomActiveElem?.name}</ListItem.Title>
                <ListItem.Subtitle style={{ color: theme.colors?.text }}>
                  {randomActiveElem?.author?.name} | {year()}{randomActiveElem?.rate ? ` | ${randomActiveElem?.rate}/10` : ""}
                </ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          </View>
        </Overlay >
      }
      <Overlay
        isVisible={filtersOpen}
      >
        <View
          style={{ minWidth: 500, backgroundColor: theme.colors?.background, borderColor: theme.colors?.border, borderWidth: 1 }}
        >
          <Text>{t("rateStatus")}</Text>
          <ButtonGroup
            buttons={[t("all"), t("rated"), t("nonrated")]}
            selectedIndex={checkedFilter}
            onPress={(val: number) => setCheckedFilter(val)}
            containerStyle={{ backgroundColor: theme.colors?.background }}
            textStyle={{ color: theme.colors?.text }}
          />
          <Text>{t("yearRange")}</Text>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text>{t("from")}</Text>
            <Input style={styles.smallInput} value={yearMin.toString()} onChangeText={updateYearMin} keyboardType="numeric" />
            <Text>{t("to")}</Text>
            <Input style={styles.smallInput} value={yearMax.toString()} onChangeText={updateYearMax} keyboardType="numeric" />
          </View>
          {yearMin > yearMax &&
            <Text style={{ color: theme.colors?.error }}>{t("invalidRange")}</Text>
          }
          <Button onPress={() => resetFilters()}>{t("reset")}</Button>
          <Button onPress={() => setFiltersOpen(false)} disabled={yearMin > yearMax}>{t("apply")}</Button>
        </View>
      </Overlay>
    </View >
  );
}
