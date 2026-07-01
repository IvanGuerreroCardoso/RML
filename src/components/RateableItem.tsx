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
        bottomDivider
        leftWidth={60}
        leftContent={(reset) => (
          <Button
            onPress={() => {
              markChecked();
              reset();
            }}
            icon={<Feather name={props.item.checked ? "eye-off" : "eye"} size={20} color={theme.colors?.text} />}
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
            icon={<Feather name="trash" size={20} color={theme.colors?.text} />}
            buttonStyle={{ minHeight: '100%', backgroundColor: theme.colors?.error }}
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
        overlayStyle={{ width: "70%", height: 160, borderWidth: 1, borderColor: theme.colors?.border, padding: 0 }}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors?.background, padding: 20 }}>
          <Slider
            value={rate}
            onValueChange={ratingCompleted}
            maximumValue={10}
            minimumValue={0}
            minimumTrackTintColor="#CC95B3"
            step={1}
            allowTouchTrack
            trackStyle={{ height: 10 }}
            thumbStyle={{ height: 30, width: 30, backgroundColor: "pink" }}
            thumbProps={{
              children: (
                <Feather
                  name="heart"
                  size={30}
                  color="#ee5997"
                />),
            }}
          />
          <Text style={styles.rateText}>{rate} / 10</Text>
          <Button buttonStyle={{ height: 40 }} onPress={() => rateAndSave()} disabled={!rateChanged} >Ok</Button>
        </View>
      </Overlay>
    </>
  );
}
