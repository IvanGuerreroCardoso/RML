import { useState, useEffect, useCallback } from "react"
import { ListItem as Item, RootStackParamList } from "../models/models"
import { getListItems } from "../services/listItemsDbService";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, FAB, ListItem, Overlay, Text } from "@rneui/themed";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import RateableItem from "../components/RateableItem";
import { t } from "i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppTheme } from "../context/ThemeContext";
import Feather from "@react-native-vector-icons/feather";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
  },
  modalView: {
    minWidth: 200
  },
})

type Props = NativeStackScreenProps<RootStackParamList, "List">;

export default function ListScreen({ route }: Props) {
  const navigation = useNavigation();
  const { listId, name } = route.params;
  const [listItems, setListItems] = useState<Item[]>([]);
  const [randElemPickOpen, setRandElemPickOpen] = useState<boolean>(false);
  const { theme } = useAppTheme();
  const [randomActiveElem, setRandomActiveElem] = useState<Item | null>(null);

  useFocusEffect(
    useCallback(() => {
      updateList();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({ title: name });
    updateList();
  }, []);

  function updateList() {
    getListItems(listId).then((res) => {
      setListItems(res);
    });
  }

  function pickRand() {
    let filteredList = listItems.filter(i => !i.checked);
    setRandomActiveElem((filteredList.length > 0 ? filteredList : listItems)[Math.floor(Math.random() * listItems.length)]);
    setRandElemPickOpen(true);
  }

  const year = () => new Date(randomActiveElem?.year ?? "").getFullYear();

  return (
    <View style={styles.container}>
      {listItems.length === 0 &&
        <Text>{t("noItemsInList")}</Text>
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

      <Overlay
        isVisible={randElemPickOpen}
        onBackdropPress={() => setRandElemPickOpen(false)}
      >
        <View
          style={styles.modalView}
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
    </View >
  );
}
