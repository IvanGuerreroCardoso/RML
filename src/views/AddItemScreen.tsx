import {View, StyleSheet, TextInputChangeEvent} from "react-native"
import {Button, Input} from "@rneui/base"
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { insertListItem } from "../services/listItemsDbService";
import { StaticScreenProps } from "@react-navigation/native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})

type Props = StaticScreenProps<{
    listId: number;
}>

export default function AddItemScreen({ route }: Props) {
    const navigation = useNavigation();
    const { listId } = route.params;
    const [name, setName] = useState<string>("");
    const [author, setAuthor] = useState<string>("");
    const [year, setYear] = useState<string>("");

    const [btnDisabled, setBtnDisabled] = useState<boolean>(true)

    let createItem = () => insertListItem({
        name: name,
        checked: false,
        author: author,
        listId: listId,
        year: new Date(parseInt(year), 0, 1) // parse to Date as 01/jan/yy
    }).then(()=>navigation.goBack());

    useEffect(()=>{
        setBtnDisabled(name === "" || author === "")
    }, [name, author])

    function authorChanged(txt: string){
        setAuthor(txt);
    }

    return (
        <View style={styles.container}>
            <Input placeholder="Name" value={name} onChangeText={setName}/>
            <Input placeholder="Author" value={name} onChangeText={authorChanged}/>
            <Input placeholder="Year" value={year} onChangeText={setYear} keyboardType="numeric"/>
            <Button title="Add" onPress={()=>createItem()} disabled={btnDisabled} />
        </View>
    );
}