import { useNavigation } from "@react-navigation/native";
import { ListItem, Button } from "@rneui/themed";
import { Feather } from "@react-native-vector-icons/feather"
import { List } from "../models/models";
import { deleteList } from "../services/listsDbService.ts";
import { useAppTheme } from "../context/ThemeContext.tsx";

interface RatableListProps {
  list: List,
  updateList: () => void
}

export default function RateableList(props: RatableListProps) {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const { listId } = props.list;

  function deleteMyList() {
    deleteList(listId).then(() => props.updateList());
  };

  function openList() {
    navigation.navigate("List", { listId, name: props.list.name })
  }

  return (
    <ListItem.Swipeable
      bottomDivider
      leftWidth={60}
      rightWidth={60}
      minSlideWidth={60}
      rightContent={(reset) => (
        <Button
          onPress={() => {
            deleteMyList();
            reset();
          }}
          icon={<Feather name="trash" size={20} color={theme.colors?.text} />}
          buttonStyle={{ minHeight: '100%', backgroundColor: theme.colors?.error }}
        />
      )}
      onPress={() => openList()}>
      <ListItem.Content>
        <ListItem.Title style={{ color: theme.colors?.text }}>
          {props.list.checked &&
            <Feather
              name="check-square"
              size={20}
              color="#26a50d" />
          }{props.list.checked && " "}{props.list.name}
        </ListItem.Title>
      </ListItem.Content>
      <Feather name="chevron-right" size={20} color={theme.colors?.text} />
    </ListItem.Swipeable>
  );
}
