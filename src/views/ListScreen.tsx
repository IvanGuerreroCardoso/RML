import { useState, useEffect, useCallback } from "react"
import { CheckedEnum, ListItem as Item, RootStackParamList } from "../models/models"
import { getListItems } from "../services/listItemsDbService";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, ButtonGroup, FAB, ListItem, Overlay, SearchBar, Text, Input, CheckBox } from "@rneui/themed";
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
  const [yearMin, setYearMin] = useState("0");
  const [yearMax, setYearMax] = useState("3000");
  const [applyYearFilter, setApplyYearFilter] = useState(false);

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
    let checkStatus = checkedFilter === CheckedEnum.All ? null : checkedFilter === CheckedEnum.Seen ? true : false;
    setShownList(listItems.filter(i => (!searchTxt ? true : (strContains(i.name, searchTxt) ||
      (i.genre?.name && strContains(i.genre.name, searchTxt)) ||
      (i.author?.name && strContains(i.author.name, searchTxt)))) &&
      (checkStatus === null ? true : i.checked === checkStatus) &&
      (!applyYearFilter ? true : i.year &&
        i.year.getFullYear() >= parseInt(yearMin ?? "0") &&
        i.year.getFullYear() <= parseInt(yearMax ?? "0")
      ))
    )
  }, [searchTxt, listItems, filtersOpen])

  function strContains(str: string, substr: string) {
    if (!str)
      return false;
    return str.toLowerCase().includes(substr.toLowerCase());
  }

  function updateList() {
    getListItems(listId).then((res) => {
      setListItems(res);
      updateListCheck(listId, !res.some(i => !i.checked));
    });
  }

  function pickRand() {
    let filteredList = shownList.filter(i => !i.checked);
    let listToPickFrom = filteredList.length > 0 ? filteredList : shownList;

    setRandomActiveElem(listToPickFrom[Math.floor(Math.random() * (listToPickFrom.length))]);
    setRandElemPickOpen(true);
  }

  const year = () => randomActiveElem?.year ? new Date(randomActiveElem.year).getFullYear() : null;

  const updateYearMin = (yr: string) => { if (has0to4digits(yr)) { setYearMin(yr) } };

  const updateYearMax = (yr: string) => { if (has0to4digits(yr)) { setYearMax(yr) } };

  function has0to4digits(str: string) { return /^\d{0,4}$/gm.test(str) }

  function resetFilters(onlyYear?: boolean) {
    setYearMin("0");
    setYearMax("3000");

    if (!onlyYear) {
      setApplyYearFilter(false);
      setCheckedFilter(CheckedEnum.All);
    }
  }

  return (
    <View style={styles.container}>
      {listItems.length === 0 &&
        <Text>{t("noItemsInList")}</Text>
      }
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Button
            title={t("addItem")}
            onPress={() => navigation.navigate("AddItem", { listId, itemId: null })}
            buttonStyle={{ margin: 10, height: 40 }}
          />
        </View>
        <Feather
          name="filter"
          size={35}
          color={theme.colors?.primary}
          style={{ margin: 10 }}
          onPress={() => setFiltersOpen(true)}
        />
      </View>
      <SearchBar
        placeholder={t("searchByN/A/G")}
        value={searchTxt}
        onChangeText={setSearchTxt}
        style={{ color: theme.colors?.text, minWidth: 600 }}
        placeholderTextColor={theme.colors?.mutedText}
        searchIcon={<Feather name="search" size={15} color={theme.colors?.text}
        />}
      />
      <FlatList
        data={shownList}
        renderItem={({ item }) => <RateableItem item={item} updateList={updateList} />}
      />

      {shownList.length > 0 &&
        <FAB
          color={theme.colors?.primary}
          placement="right"
          size="small"
          icon={<Feather name="box" color={theme.colors?.card} size={20} />}
          onPress={() => pickRand()}
          titleStyle={{ color: theme.colors?.card }}
          title={t("randChoise")}
          containerStyle={{ marginBottom: 15 }}
        />
      }
      <Overlay
        isVisible={randElemPickOpen}
        onBackdropPress={() => setRandElemPickOpen(false)}
        overlayStyle={{ borderWidth: 2, padding: 0, borderColor: theme.colors?.border, width: "80%", height: 80 }}
      >
        <View
          style={{ backgroundColor: theme.colors?.background, flex: 1, margin: 0 }}
        >
          <ListItem containerStyle={{ margin: 0 }}>
            <ListItem.Content>

              <ListItem.Title style={{ color: theme.colors?.text }}>{randomActiveElem?.checked === true &&
                <Feather
                  name="check-square"
                  size={20}
                  color="#26a50d"
                />}{randomActiveElem?.checked && ' '}{randomActiveElem?.name}</ListItem.Title>
              <ListItem.Subtitle style={{ color: theme.colors?.text }}>
                {randomActiveElem?.author?.name}
                {randomActiveElem?.genre?.name && `  -  ${randomActiveElem.genre.name}`}
                {year() && `  -  ${year()}`}
                {randomActiveElem?.rate ? `  -  ${randomActiveElem?.rate}/10` : ""}
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        </View>
      </Overlay >
      <Overlay
        isVisible={filtersOpen}
        overlayStyle={{ borderWidth: 2, margin: 0, padding: 0, borderColor: theme.colors?.border, width: "90%", height: "90%" }}
      >
        <View
          style={{
            flex: 1, margin: 0,
            backgroundColor: theme.colors?.background,
            padding: 10
          }}
        >
          <Text>{t("rateStatus")}</Text>
          <ButtonGroup
            buttons={[t("all"), t("rated"), t("nonRated")]}
            selectedIndex={checkedFilter}
            onPress={(val: number) => setCheckedFilter(val)}
            containerStyle={{ backgroundColor: theme.colors?.background, marginHorizontal: 0 }}
            textStyle={{ color: theme.colors?.text }}
          />
          <View style={{ flexDirection: "row" }}>
            <Text style={{ marginTop: 20, marginBottom: 5 }}>{t("yearRange")}
            </Text>
            <CheckBox
              checked={applyYearFilter}
              onPress={() => { setApplyYearFilter(!applyYearFilter); resetFilters(true) }}
              checkedIcon={<Feather name="check-square" size={25} color={theme.colors?.primary} />}
              uncheckedIcon={<Feather name="square" size={25} color={theme.colors?.primary} />}
            />
          </View>
          <Text>{t("from")}</Text>
          <Input style={styles.smallInput} value={yearMin} onChangeText={updateYearMin} disabled={!applyYearFilter} keyboardType="numeric" />
          <Text>{t("to")}</Text>
          <Input style={styles.smallInput} value={yearMax} onChangeText={updateYearMax} disabled={!applyYearFilter} keyboardType="numeric" />
          {yearMin > yearMax &&
            <Text style={{ color: theme.colors?.error, marginBottom: 20 }}>{t("invalidRange")}</Text>
          }
          <Button onPress={() => resetFilters()} style={{ marginBottom: 30 }}>{t("reset")}</Button>
          <Button onPress={() => setFiltersOpen(false)} disabled={!applyYearFilter ? false : yearMin > yearMax}>{t("apply")}</Button>
        </View>
      </Overlay >
    </View >
  );
}
