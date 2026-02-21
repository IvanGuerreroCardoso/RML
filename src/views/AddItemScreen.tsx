import {View, StyleSheet, TextInputChangeEvent} from "react-native"
import {Button, Input} from "@rneui/base"
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { insertAuthor, insertGenre, insertListItem } from "../services/listItemsDbService";
import { StaticScreenProps } from "@react-navigation/native";
import { Author, Genre } from "../models/models"
import { t } from "i18next";

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
    const [genre, setGenre] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [authorsMatch, setAuthorsMatch] = useState<Author[]>([])
    const [genreMatch, setGenreMatch] = useState<Genre[]>([])

    const [btnDisabled, setBtnDisabled] = useState<boolean>(true)

    async function createItem() {
        const authorIdTask = insertAuthor(author);
        const genreIdTask = insertGenre(genre);

        insertListItem({
            itemId: 0, // ignored in insert, but added for consistency
            name: name,
            checked: false,
            author: {id: await authorIdTask, name: author},
            genre: {id: await genreIdTask, name: genre},
            listId: listId,
            year: new Date(parseInt(year), 0, 1), // parse to Date as 01/jan/yy
            rate: null
        }).then(()=>navigation.goBack())
    };

    useEffect(()=>{
        setBtnDisabled(name === "" || author === "")
    }, [name, author])

    function authorChanged(txt: string){
        setAuthor(txt);
    }

    function genreChanged(txt: string){
        setGenre(txt);
    }

    return (
        <View style={styles.container}>
            <Input placeholder={t("name")} value={name} onChangeText={setName}/>
            <Input placeholder={t("author")} value={author} onChangeText={authorChanged}/>
            <Input placeholder={t("genre")} value={genre} onChangeText={genreChanged}/>
            <Input placeholder={t("year")} value={year} onChangeText={setYear} keyboardType="numeric"/>
            <Button title={t("add")} onPress={()=>createItem()} disabled={btnDisabled} />
        </View>
    );
}