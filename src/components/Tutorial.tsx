import { Button, ListItem, Overlay, Text } from "@rneui/themed";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { updateTutorial } from "../services/settingsDbService";
import Feather from "@react-native-vector-icons/feather";


interface TutorialProps {
  open: boolean;
  toggleOpen: () => void;
}

const styles = StyleSheet.create({
  rowContainer: {
    marginVertical: 8,
  },
  actionLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 0,
    flexDirection: "row",
    width: 120
  },
  actionRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 0,
  },
});

export default function Tutorial(props: TutorialProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [section, setSection] = useState(1);

  function close() {
    updateTutorial(1).then(() =>
      props.toggleOpen()
    )
  }

  function ListItemMock({ title, direction }: { title: string, direction: "right" | "left" }) {
    const x = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const offset = direction === "left" ? -60 : 120;

      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(x, {
            toValue: offset,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
          Animated.timing(x, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ])
      );

      loop.start();

      return () => loop.stop();
    }, [direction, x]);

    return (
      <View style={styles.rowContainer}>
        {direction === "right" ? (
          <View style={styles.actionLeft}>
            <Button
              icon={<Feather name="edit" size={20} color={theme.colors?.white} />}
              buttonStyle={{ minHeight: '100%', width: 60, backgroundColor: theme.colors?.blue }}
            />
            <Button
              icon={<Feather name="eye" size={20} color={theme.colors?.white} />}
              buttonStyle={{ minHeight: '100%', width: 60 }}
            />
          </View>
        ) : (
          <View style={styles.actionRight}>
            <Button
              icon={<Feather name="trash" size={20} color={theme.colors?.white} />}
              buttonStyle={{ minHeight: '100%', width: 60, backgroundColor: theme.colors?.error, marginRight: 2 }}
            />
          </View>
        )}

        <Animated.View style={{ transform: [{ translateX: x }] }}>
          <ListItem.Swipeable
            rightContent={direction === "right" ? () => null : undefined}
            leftContent={direction === "left" ? () => null : undefined}
          >
            <ListItem.Content>
              <ListItem.Title style={{ color: theme.colors?.text }}>{title}</ListItem.Title>
            </ListItem.Content>
          </ListItem.Swipeable>
        </Animated.View>
      </View>
    )
  }

  return (

    <Overlay
      isVisible={props.open}
      overlayStyle={{ borderWidth: 2, padding: 0, borderColor: theme.colors?.border, width: "80%", height: "90%" }}
    >
      <View style={{ padding: 15, backgroundColor: theme.colors?.background, flex: 1, justifyContent: "space-between" }}>
        {section === 1 &&
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", gap: 5 }}>
              <Feather name="help-circle" size={25} color={theme.colors?.primary} />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{t("openTutorialTitle")}</Text>
            </View>
            <Text>{t("openTutorialText")}</Text>
            <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", gap: 5 }}>
              <Feather name="settings" size={25} color={theme.colors?.primary} />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{t("settings")}</Text>
            </View>
            <Text>{t("settingsText")}</Text>
            <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", gap: 5 }}>
              <Feather name="filter" size={25} color={theme.colors?.primary} />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{t("filterTitle")}</Text>
            </View>
            <Text>{t("filterText")}</Text>
            <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", gap: 5 }}>
              <Feather name="align-center" size={25} color={theme.colors?.primary} />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{t("sortTitle")}</Text>
            </View>
            <Text>{t("sortText")}</Text>
            <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", gap: 5 }}>
              <Feather name="box" size={25} color={theme.colors?.primary} />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{t("randChoise")}</Text>
            </View>
            <Text>{t("randomChoiseText")}</Text>
          </View>
        }
        {section === 2 &&
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>{t("editOrRateTitle")}</Text>
            <Text>{t("editOrRateText")}</Text>
            <ListItemMock title={t("example")} direction="right"></ListItemMock>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>{t("deleteTitle")}</Text>
            <Text>{t("deleteText")}</Text>
            <ListItemMock title={t("example")} direction="left"></ListItemMock>
          </View>
        }

        <View>
          <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
            <Button containerStyle={{ flex: 1 }} buttonStyle={{ height: 40, borderRadius: 10 }} disabled={section === 1} onPress={() => setSection(section - 1)}>{t("prev")}</Button>
            <Button containerStyle={{ flex: 1 }} buttonStyle={{ height: 40, borderRadius: 10 }} disabled={section === 2} onPress={() => setSection(section + 1)}>{t("next")}</Button>
          </View>
          <Button buttonStyle={{ height: 40, borderRadius: 10 }} containerStyle={{ marginTop: 10 }} onPress={() => close()}>{t("close")}</Button>
        </View>
      </View>
    </Overlay>
  )
}
