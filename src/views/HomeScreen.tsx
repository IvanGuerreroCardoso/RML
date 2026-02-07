import { View, StyleSheet, FlatList } from "react-native"
import { Button, Text } from "@rneui/base"
import { useNavigation } from "@react-navigation/native";
import { getLists } from "../services/listsDbService";
import { ListItem } from '../models/models';
import { useState } from "react";


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
  }
})

export default function HomeScreen() {
  const [lists, setLists] = useState<ListItem[]>([])
  const navigation = useNavigation();
  const getText = () => lists.length === 0 ? "You don't have lists yet, lets create one." : "Your lists:"

  getLists().then((res)=>{
    setLists(res);
  })  

  return (
    <View style={styles.container}>
      <Text>{getText()}</Text>
      <Button title="Add List" onPress={() => navigation.navigate("AddList")} />
      <FlatList
        data={lists}
        renderItem={({item}) => <Text style={styles.title}>{item.name}</Text>}
      />
    </View>
  );
}