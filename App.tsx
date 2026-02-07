/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/views/HomeScreen'
import AddListScreen from './src/views/AddListScreen';
import { createListTable } from './src/services/listsDbService';


const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {title: "Home"}
    },
    AddList: {
      screen: AddListScreen,
      options: {title: "Add List"}
    },/*
    AddItem: AddItemScreen,
    List: ListScreen*/
  },
});

createListTable()

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}