import { View } from "react-native";
import { useState } from "react"
import { ButtonGroup, Switch, Text } from "@rneui/themed";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";
import { updateLanguage, updateTheme } from "../services/settingsDbService";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const langs = ["en", "es"];
  const { mode, toggleMode } = useAppTheme();
  const [darkMode, setDarkMode] = useState(mode === "dark");
  const [selectedLangIdx, setSelectedLangIdx] = useState(langs.indexOf(i18n.language.split("-")[0]));

  function changeMode(val: boolean): void {
    setDarkMode(!darkMode);
    toggleMode();
    updateTheme(val ? "dark" : "light");
  }

  function changeLanguage(val: number): void {
    setSelectedLangIdx(val);
    i18n.changeLanguage(langs[val]);
    updateLanguage(langs[val]);
  }

  return (
    <View>
      <View>
        <Text>{t("enableDarkMode")}</Text>
        <Switch
          value={darkMode}
          onValueChange={(value) => changeMode(value)}
        />
      </View>
      <View>
        <Text>{t("selectLang")}</Text>
        <ButtonGroup
          buttons={["English", "Español"]}
          selectedIndex={selectedLangIdx}
          onPress={(val: number): void => changeLanguage(val)}
        />
      </View>
    </View>
  );
}
