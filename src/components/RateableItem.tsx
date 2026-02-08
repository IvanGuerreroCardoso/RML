import { useNavigation } from "@react-navigation/native";
import { ListItem, Button } from "@rneui/base";
import { Feather } from "@react-native-vector-icons/feather"
import { ListItem as Item } from "../models/models";
import { deleteListItem, updateListItem } from "../services/listItemsDbService.ts";

interface RatableListProps{
    item: Item,
    updateList: () => void
}

export default function RateableItem(props: RatableListProps) {
    const navigation = useNavigation();
    function markChecked(){
        updateListItem({...props.item, checked: true}).then(()=>props.updateList());
    };

    function deleteItem(){
        deleteListItem(props.item.itemId!).then(()=>props.updateList());
    };

    return (
        <ListItem.Swipeable
            leftContent={(reset) => (
                <Button
                    title="Info"
                    onPress={() => {
                        markChecked();
                        reset();
                    }}
                    icon={<Feather name="eye" size={10} color="#000" />}
                    buttonStyle={{ minHeight: '100%' }}
                />
            )}
            rightContent={(reset) => (
                <Button
                    onPress={() => {
                        deleteItem();
                        reset();
                    }}
                    icon={<Feather name="eye" size={10} color="#000" />}
                    buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
                />
            )}
            /*onPress={()=>navigation.navigate("List", { listId })}
                Todo, on press goto edit item
            */
            >        
            <ListItem.Content>
                <ListItem.Title>{props.item.name}{props.item.checked ? ' Finished' : ''}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem.Swipeable>
    );
}