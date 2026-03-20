import {View, StyleSheet, FlatList} from "react-native"
import {Button, Input, ListItem} from "@rneui/base"
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { insertAuthor, insertGenre, insertListItem, matchAuthor, matchGenre } from "../services/listItemsDbService";
import { StaticScreenProps } from "@react-navigation/native";
import { Author, Genre } from "../models/models"
import { t } from "i18next";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flatList: {
        backgroundColor: 'red',
        maxHeight: 130,
        flexGrow: 0,
        overflow: 'scroll'
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
    const [authorId, setAuthorId] = useState<number>(0);
    const [genre, setGenre] = useState<string>("");
    const [genreId, setGenreId] = useState<number>(0);
    const [year, setYear] = useState<string>("");
    const [authorsMatch, setAuthorsMatch] = useState<Author[]>([]);
    const [genreMatch, setGenreMatch] = useState<Genre[]>([]);
    const [btnDisabled, setBtnDisabled] = useState<boolean>(true);

    async function createItem() {
        var authorIdTask = null;
        var genreIdTask = null;

        if(author && authorId === 0){
            authorIdTask = insertAuthor(author);
        }
        if(genre && genreId === 0){
            genreIdTask = insertGenre(genre);
        }

        var authorIdToSave = authorIdTask ? await authorIdTask : authorId !== 0 ? authorId : null;
        var genreIdToSave = genreIdTask ? await genreIdTask : genreId !== 0 ? genreId : null;
        
        insertListItem({
            itemId: 0, // ignored in insert, but added for consistency
            name: name,
            checked: false,
            author: authorIdToSave ? {id: authorIdToSave, name: author} : undefined,
            genre: genreIdToSave ? {id: genreIdToSave, name: genre} : undefined,
            listId: listId,
            year: new Date(parseInt(year), 0, 1), // parse to Date as 01/jan/yy
            rate: null
        }).then(()=>navigation.goBack())
    };

    useEffect(()=>{
        setBtnDisabled(name === "" || author === "");
    }, [name, author, authorsMatch, genreMatch])

    function authorChanged(txt: string){
        setAuthor(txt);
        setAuthorId(0);

        if(txt.length>2){
            matchAuthor(txt).then(res=>setAuthorsMatch(res));
        }
    }

    function genreChanged(txt: string){
        setGenre(txt);
        setGenreId(0);

        if(txt.length>2){
            matchGenre(txt).then(res=>setGenreMatch(res));
        }
    }

    function authorSelected(author: Author){
        setAuthor(author.name);
        setAuthorId(author.id);
        setAuthorsMatch([]);
    }

    function genreSelected(author: Author){
        setGenre(author.name);
        setGenreId(author.id);
        setGenreMatch([]);
    }

    function getMatchesFlatList(list: Author[] | Genre[], itemSelected: (item: Author | Genre) => void){
        return (
            <FlatList 
                data={list} 
                style={styles.flatList}
                keyExtractor={item => item.id + item.name}
                renderItem={({item}) =><ListItem onPress={()=>itemSelected(item)}><ListItem.Title>{item.name}</ListItem.Title></ListItem>}
                persistentScrollbar={list.length > 2}
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                indicatorStyle="black"/>
        )
    }

    return (
        <View style={styles.container}>
            <Input placeholder={t("name")} value={name} onChangeText={setName}/>
            <Input placeholder={t("author")} value={author} onChangeText={authorChanged}/>
            { authorsMatch.length > 0 && 
                getMatchesFlatList(authorsMatch, authorSelected)
            }
            <Input placeholder={t("genre")} value={genre} onChangeText={genreChanged}/>
            { genreMatch.length > 0 && 
                getMatchesFlatList(genreMatch, genreSelected)
            }
            <Input placeholder={t("year")} value={year} onChangeText={setYear} keyboardType="numeric"/>
            <Button title={t("add")} onPress={()=>createItem()} disabled={btnDisabled} />
        </View>
    );
}