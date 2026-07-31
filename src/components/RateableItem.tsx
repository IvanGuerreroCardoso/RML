import { useNavigation } from "@react-navigation/native";
import { Overlay, ListItem, Button, Slider, Text } from "@rneui/themed";
import { Feather } from "@react-native-vector-icons/feather"
import { ListItem as Item } from "../models/models";
import { deleteListItem, updateListItem } from "../services/listItemsDbService.ts";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext.tsx";

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
      updateListItem({ ...props.item, rate: 0, checked: false, rateDate: null }).then(() => {
        props.updateList();
      });
      return;
    }

    setRateVisible(true);
  };

  function rateAndSave() {
    updateListItem({ ...props.item, rate: rate, checked: true, rateDate: new Date() }).then(() => {
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
        leftWidth={120}
        leftContent={(reset) => (
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Button
              onPress={() => {
                navigation.navigate("AddItem", { listId: props.item.listId, itemId: props.item.itemId });
                reset();
              }}
              icon={<Feather name="edit" size={20} color={theme.colors?.white} />}
              buttonStyle={{ minHeight: '100%', width: 60, backgroundColor: theme.colors?.blue }}
            />
            <Button
              onPress={() => {
                markChecked();
                reset();
              }}
              icon={<Feather name={props.item.checked ? "eye-off" : "eye"} size={20} color={theme.colors?.white} />}
              buttonStyle={{ minHeight: '100%', width: 60 }}
            />
          </View>
        )}
        rightWidth={60}
        rightContent={(reset) => (
          <Button
            onPress={() => {
              deleteItem();
              reset();
            }}
            icon={<Feather name="trash" size={20} color={theme.colors?.white} />}
            buttonStyle={{ minHeight: '100%', backgroundColor: theme.colors?.error }}
          />
        )}
        minSlideWidth={60}
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
            {props.item.rateDate ? ` (${props.item.rateDate.getFullYear()}/${props.item.rateDate.getMonth() + 1}/${props.item.rateDate.getDate()})` : ""}
          </ListItem.Subtitle>
        </ListItem.Content>
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
          <Button buttonStyle={{ height: 40, borderRadius: 10 }} onPress={() => rateAndSave()} disabled={!rateChanged} >Ok</Button>
        </View>
      </Overlay>
    </>
  );
}
