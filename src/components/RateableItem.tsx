import { useNavigation } from "@react-navigation/native";
import { Overlay, ListItem, Button, Slider, Text } from "@rneui/themed";
import { Feather } from "@react-native-vector-icons/feather"
import { ListItem as Item } from "../models/models";
import { deleteListItem, updateListItem } from "../services/listItemsDbService.ts";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext.tsx";
import { updateListCheck } from "../services/listsDbService.ts";

interface RatableListProps {
  item: Item,
  updateList: () => void
}

const styles = StyleSheet.create({
  modalView: {
    minWidth: 200
  },
  rateText: {
    alignSelf: "center",
    marginBottom: 10
  }
})

export default function RateableItem(props: RatableListProps) {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const [rateVisible, setRateVisible] = useState(false);
  const [rateChanged, setRateChanged] = useState(false);
  const [rate, setRate] = useState<number>(0);

  function markChecked() {
    if (props.item.checked) {
      updateListItem({ ...props.item, rate: 0, checked: false }).then(() => {
        props.updateList();
      });
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
    deleteListItem(props.item.itemId!, props.item.author?.id ?? null, props.item.genre?.id ?? null).then(() => props.updateList());
  };

  const year = props.item.year?.getFullYear() ?? "";

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
            icon={<Feather name="eye" size={20} color="#222" />}
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
            icon={<Feather name="trash" size={20} color="#222" />}
            buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
          />
        )}
        minSlideWidth={60}
        onPress={() => navigation.navigate("AddItem", { listId: props.item.listId, itemId: props.item.itemId })}
      >
        <ListItem.Content>

          <ListItem.Title style={{ color: theme.colors?.text }}>{props.item.checked &&
            <Feather
              name="check-square"
              size={20}
              color="#26a50d"
            />}{props.item.checked && " "}{props.item.name}</ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors?.text }}>
            {props.item.author?.name}
            {props.item.genre?.name && `  -  ${props.item.genre.name}`}
            {year && `  -  ${year}`}
            {props.item.rate ? `  -  ${props.item.rate}/10` : ""}
          </ListItem.Subtitle>
        </ListItem.Content>
        <Feather name="chevron-right" size={20} color={theme.colors?.text} />
      </ListItem.Swipeable>
      <Overlay
        isVisible={rateVisible}
        onBackdropPress={() => setRateVisible(false)}
      >
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
          <Button onPress={() => rateAndSave()} disabled={!rateChanged} >Ok</Button>
        </View>
      </Overlay>
    </>
  );
}
