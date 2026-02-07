import {View, StyleSheet, TextInputChangeEvent} from "react-native"
import {Button, Input} from "@rneui/base"
import { useState } from "react";
import { insertList } from "../services/listsDbService";
import { useNavigation } from "@react-navigation/native";


const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})

export default function AddListScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState<string>("");
    const [btnDisabled, setBtnDisabled] = useState<boolean>(true)

    let createList = () => insertList(name).then(()=>navigation.goBack());

    function listNameChanged(txt: string){
        setName(txt);
        setBtnDisabled(name === "");
    }

    return (
        <View style={styles.container}>
            <Input placeholder="List name" value={name} onChangeText={listNameChanged}/>
            <Button title="Add" onPress={()=>createList()} disabled={btnDisabled} />
        </View>
    );
}