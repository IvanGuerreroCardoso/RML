import { useNavigation } from "@react-navigation/native";
import { Overlay, ListItem, Button, Slider, Text } from "@rneui/themed";
import { Feather } from "@react-native-vector-icons/feather"
import { ListItem as Item } from "../models/models";
import { deleteListItem, updateListItem } from "../services/listItemsDbService.ts";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

interface RatableListProps {
  item: Item,
  updateList: () => void
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "#fff",
  },
  modalView: {
    minWidth: 200
  },
  rateText: {
    alignSelf: "center",
    marginBottom: 10
  }
})

export default function RateableItem(props: RatableListProps) {
  console.log("props", props)
  const navigation = useNavigation();
  const [rateVisible, setRateVisible] = useState(false);
  const [rateChanged, setRateChanged] = useState(false);
  const [rate, setRate] = useState<number>(0);

  function markChecked() {
    if (props.item.checked) {
      updateListItem({ ...props.item, rate: 0, checked: false }).then(() => props.updateList());
      return;
    }

    setRateVisible(true);
  };

  function rateAndSave() {
    updateListItem({ ...props.item, rate: rate, checked: true }).then(() => {
      props.updateList();
      setRateVisible(false);
    });
  }

  function deleteItem() {
    deleteListItem(props.item.itemId!).then(() => props.updateList());
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

          <ListItem.Title>{props.item.checked === true &&
            <Feather
              name="check-square"
              size={20}
              color="#26a50d"
            />}{props.item.name}</ListItem.Title>
          <ListItem.Subtitle>{props.item.author?.name} | {year}{props.item.rate ? ` | ${props.item.rate}/10` : ""}</ListItem.Subtitle>
        </ListItem.Content>
        <Feather name="chevron-right" size={20} color="#000" />
      </ListItem.Swipeable>
      <Overlay
        isVisible={rateVisible}
        onBackdropPress={() => setRateVisible(false)}
        style={styles.overlay}>
        <View style={styles.modalView}>
          <Slider
            value={rate}
            onValueChange={ratingCompleted}
            maximumValue={10}
            minimumValue={0}
            step={1}
            allowTouchTrack
            trackStyle={{ height: 7, backgroundColor: 'transparent' }}
            thumbStyle={{ height: 30, width: 30, backgroundColor: 'transparent' }}
            thumbProps={{
              children: (
                <Feather
                  name="heart"
                  size={30}
                  color="#ee5997"
                />
              ),
            }}
          />
          <Text style={styles.rateText}>{rate} / 10</Text>
          <Button onPress={rateAndSave} disabled={!rateChanged} >Ok</Button>
        </View>
      </Overlay>
    </>
  );
}
