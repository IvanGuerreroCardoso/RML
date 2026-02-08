import { useState, useEffect, useCallback } from "react"
import { ListItem as Item } from "../models/models"
import { getListItems } from "../services/listItemsDbService";
import { FlatList , StyleSheet, View } from "react-native";
import { Button, Text } from "@rneui/base";
import { useNavigation, StaticScreenProps, useFocusEffect } from "@react-navigation/native";
import RateableItem from "../components/RateableItem";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
  }
})

type Props = StaticScreenProps<{
    listId: number;
}>

export default function ListScreen({ route }: Props){
    const navigation = useNavigation();
    const { listId } = route.params;
    const [listItems, setListItems] = useState<Item[]>([])

    useFocusEffect(
      useCallback(() => {
        updateList();
      }, [])
    );

    useEffect(() => {
      updateList();
    }, []);

    function updateList(){
      getListItems(listId).then((res)=>{
        setListItems(res);
      });
    }

    const getText = () => listItems.length === 0 ? "This list doesn't have items yet, lets create one." : "Items:";

    return (
        <View style={styles.container}>
          <Text>{getText()}</Text>
          <Button title="Add Item" onPress={() => navigation.navigate("AddItem", {listId})} />
          <FlatList
            data={listItems}
            renderItem={({item}) => <RateableItem item={item} updateList={updateList}/>}
          />
        </View>
        );
}