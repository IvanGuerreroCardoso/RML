import { View, StyleSheet, TextInputChangeEvent } from "react-native"
import { Button, Input } from "@rneui/themed"
import { useEffect, useState } from "react";
import { getListById, insertList, updateList } from "../services/listsDbService";
import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, List } from "../models/models";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})

type Props = NativeStackScreenProps<RootStackParamList, "AddList">;

export default function AddListScreen({ route }: Props) {
  const { listId } = route.params;
  const navigation = useNavigation();
  const [name, setName] = useState<string>("");
  const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
  const [listToEdit, setListToEdit] = useState<List | null>(null);

  useEffect(() => {
    if (!listId) return;

    navigation.setOptions({ title: t("editList") });

    getListById(listId).then(li => {
      setName(li!.name);
      setListToEdit(li);
    })
  }, [])

  function createList() {
    if (!listToEdit) {
      insertList(name).then(() => navigation.goBack());
      return;
    }

    updateList({ name: name, listId: listToEdit.listId, checked: listToEdit.checked }).then(() => navigation.goBack());
  }

  function listNameChanged(txt: string) {
    setName(txt);
    setBtnDisabled(name === "");
  }

  return (
    <View style={styles.container}>
      <Input placeholder={t("listName")} value={name} onChangeText={listNameChanged} />
      <Button title={listId ? t("edit") : t("add")} onPress={() => createList()} disabled={btnDisabled} />
    </View>
  );
}
