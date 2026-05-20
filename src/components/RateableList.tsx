import { useNavigation } from "@react-navigation/native";
import { ListItem, Button } from "@rneui/themed";
import { Feather } from "@react-native-vector-icons/feather"
import { List } from "../models/models";
import { updateList, deleteList } from "../services/listsDbService.ts";

interface RatableListProps {
  list: List,
  updateList: () => void
}

export default function RateableList(props: RatableListProps) {
  const navigation = useNavigation();
  const { listId } = props.list;
  function markChecked() {
    updateList({ ...props.list, checked: true }).then(() => props.updateList());
  };

  function deleteMyList() {
    deleteList(listId).then(() => props.updateList());
  };

  function openList() {
    navigation.navigate("List", { listId, name: props.list.name })
    navigation.setOptions({ title: props.list.name })// TODO check if need to move into the list view to change after navigation
  }

  return (
    <ListItem.Swipeable
      leftContent={(reset) => (
        <Button
          onPress={() => {
            markChecked();
            reset();
          }}
          icon={<Feather name="eye" size={20} color="#000" />}
          buttonStyle={{ minHeight: '100%' }}
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
      onPress={() => openList()}>
      <ListItem.Content>
        <ListItem.Title>{props.list.name}{props.list.checked ? ' Complete!' : ''}</ListItem.Title>
      </ListItem.Content>
      <Feather name="chevron-right" size={20} color="#000" />
    </ListItem.Swipeable>
  );
}
