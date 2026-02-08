import { View, StyleSheet, FlatList } from "react-native"
import { Button, Text } from "@rneui/base"
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getLists } from "../services/listsDbService";
import { List } from '../models/models';
import { useEffect, useState, useCallback } from "react";
import RateableList from "../components/RateableList";
import { getAllItemsCount } from "../services/listItemsDbService";


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
  }
})

export default function HomeScreen() {
  const [lists, setLists] = useState<List[]>([])
  const [count, setCount] = useState<number>(0);
  const navigation = useNavigation();
  const getText = () => lists.length === 0 ? "You don't have lists yet, lets create one." : "Your lists: ";

  useEffect(()=>{
    updateList();
    getAllItemsCount().then((res)=> setCount(res));
  }, []);

  useFocusEffect(
    useCallback(() => {
      updateList();
      getAllItemsCount().then((res)=> setCount(res));
    }, [])
  );

  function updateList(){
    getLists().then((res)=>{
      setLists(res);
    });
    getAllItemsCount().then((res)=> setCount(res));
  }

  return (
    <View style={styles.container}>
      <Text>{getText()}</Text>
      <Text>All items count = {count}</Text>
      <Button title="Add List" onPress={() => navigation.navigate("AddList")} />
      <FlatList
        data={lists}
        renderItem={({item}) => <RateableList list={item} updateList={updateList}/>}
      />
    </View>
  );
}