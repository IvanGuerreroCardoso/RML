import { useNavigation } from "@react-navigation/native";
import { ListItem, Button, Slider } from "@rneui/base";
import { Overlay } from "@rneui/themed";
import { Feather } from "@react-native-vector-icons/feather"
import { ListItem as Item } from "../models/models";
import { deleteListItem, updateListItem } from "../services/listItemsDbService.ts";
import { useState } from "react";
import { StyleSheet } from "react-native";

interface RatableListProps{
    item: Item,
    updateList: () => void
}

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: "#fff",
    }
})

export default function RateableItem(props: RatableListProps) {
    const navigation = useNavigation();
    const [rateVisible, setRateVisible] = useState(false);
    const [rateChanged, setRateChanged] = useState(false);
    const [rate, setRate] = useState<number>(0);

    function markChecked(){
        if(props.item.checked){
            updateListItem({...props.item, rate: 0, checked: false}).then(()=>props.updateList());
            return;
        }

        setRateVisible(true);
    };

    function rateAndSave(){
        updateListItem({...props.item, rate: rate, checked: true}).then(()=>props.updateList());
    }

    function deleteItem(){
        deleteListItem(props.item.itemId!).then(()=>props.updateList());
    };
    
    const year = new Date(props.item.year).getFullYear();

    const ratingCompleted = (rating: number) => {
        setRate(rating);
        setRateChanged(true);
    };

    return (
        <>
            <ListItem.Swipeable
                leftWidth={60}
                leftContent={(reset) => (
                    <Button
                        onPress={() => {
                            markChecked();
                            reset();
                        }}
                        icon={<Feather name="eye" size={20} color="#fff" />}
                        buttonStyle={{ minHeight: '100%' }}
                    />
                )}
                rightWidth={60}
                rightContent={(reset) => (
                    <Button
                        onPress={() => {
                            deleteItem();
                            reset();
                        }}
                        icon={<Feather name="trash" size={20} color="#fff" />}
                        buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
                    />
                )}
                minSlideWidth={60}
                /*onPress={()=>navigation.navigate("List", { listId })}
                    Todo, on press goto edit item
                */
                >        
                <ListItem.Content>
                    <ListItem.Title>{props.item.name}{props.item.checked ? ' Finished' : ''}</ListItem.Title>
                    <ListItem.Subtitle>{props.item.author?.name} | {year}{props.item.rate ? ` | ${props.item.rate}/10` : ""}</ListItem.Subtitle>
                </ListItem.Content>
                <Feather name="chevron-right" size={20} color="#000" />
            </ListItem.Swipeable>
            <Overlay 
                isVisible={rateVisible} 
                onBackdropPress={()=>setRateVisible(false)}
                style={styles.overlay}>
                <Slider
                    value={rate}
                    onValueChange={ratingCompleted}
                    maximumValue={10}
                    minimumValue={0}
                    step={1}
                    allowTouchTrack
                    trackStyle={{ height: 5, backgroundColor: 'transparent' }}
                    thumbStyle={{ height: 20, width: 20, backgroundColor: 'transparent' }}
                    thumbProps={{
                    children: (
                        <Feather
                        name="heart"
                        size={20}
                        color="#ee5997"
                        />
                    ),
                    }}
                />

                <Button onPress={rateAndSave} disabled={rateChanged} >Ok</Button>
            </Overlay>
        </>
    );
}