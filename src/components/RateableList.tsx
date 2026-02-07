import { useNavigation } from "@react-navigation/native";
import { ListItem, Button } from "@rneui/base";
import { Feather } from "@react-native-vector-icons/feather"
import { List } from "../models/models";
import { updateList, deleteList } from "../services/listsDbService.ts";

interface RatableListProps{
    list: List
}

export default function RateableList(props: RatableListProps) {
    const navigation = useNavigation();
    const { listId } = props.list;
    function markChecked(){
        updateList({...props.list, checked: true}).then(()=>{
            props.list.checked = true;
        });
    };

    function deleteMyList(){
        deleteList(listId).then(()=>{
            props.list.checked = true;
        });
    };

    return (
        <ListItem.Swipeable
            leftContent={(reset) => (
                <Button
                    title="Mark Seen"
                    onPress={() => {
                        markChecked();
                        reset();
                    }}
                    icon={<Feather name="eye" size={20} color="#000" />}
                    buttonStyle={{ minHeight: '100%'}}
                />
            )}
            rightContent={(reset) => (
                <Button
                    onPress={() => {
                        deleteMyList();
                        reset();
                    }}
                    icon={<Feather name="trash" size={20} color="#000" />}
                    buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
                />
            )}
            onPress={()=>navigation.navigate("List", { listId })}>        
            <ListItem.Content>
                <ListItem.Title>{props.list.name}{props.list.checked ? ' Complete!' : ''}</ListItem.Title>
            </ListItem.Content>
            <Feather name="chevron-right" size={20} color="#000" />
        </ListItem.Swipeable>
    );
}