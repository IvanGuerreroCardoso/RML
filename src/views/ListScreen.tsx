import { useState, useEffect, useCallback } from "react"
import { ListItem as Item, RootStackParamList } from "../models/models"
import { getListItems } from "../services/listItemsDbService";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Text } from "@rneui/base";
import { useNavigation, StaticScreenProps, useFocusEffect } from "@react-navigation/native";
import RateableItem from "../components/RateableItem";
import { t } from "i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
  }
})

type Props = NativeStackScreenProps<RootStackParamList, "List">;

export default function ListScreen({ route }: Props) {
  const navigation = useNavigation();
  const { listId, name } = route.params;
  const [listItems, setListItems] = useState<Item[]>([])

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

  const getText = () => listItems.length === 0 ? "This list doesn't have items yet, lets create one." : "Items:";

  return (
    <View style={styles.container}>
      <Text>{getText()}</Text>
      <Button title={t("addItem")} onPress={() => navigation.navigate("AddItem", { listId })} />
      <FlatList
        data={listItems}
        renderItem={({ item }) => <RateableItem item={item} updateList={updateList} />}
      />
    </View>
  );
}
