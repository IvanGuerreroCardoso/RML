import { Alert, View } from "react-native";
import { useState } from "react"
import { Button, ButtonGroup, Switch, Text } from "@rneui/themed";
import RNFS from "react-native-fs";
import { errorCodes, isErrorWithCode, keepLocalCopy, pick, saveDocuments, types } from "@react-native-documents/picker";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";
import { updateLanguage, updateTheme } from "../services/settingsDbService";
import { exportLists } from "../services/exportService";
import { importLists } from "../services/importService";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const langs = ["en", "es"];
  const { mode, toggleMode } = useAppTheme();
  const [darkMode, setDarkMode] = useState(mode === "dark");
  const [selectedLangIdx, setSelectedLangIdx] = useState(langs.indexOf(i18n.language.split("-")[0]));
  const [backupBusy, setBackupBusy] = useState(false);
  const { theme } = useAppTheme();

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

  async function exportBackup(): Promise<void> {
    setBackupBusy(true);
    try {
      const path = await exportLists();
      const [savedFile] = await saveDocuments({
        sourceUris: [`file://${path}`],
        mimeType: "text/csv",
        fileName: "rated-media-lists.csv",
      });

      if (savedFile.error) {
        throw new Error(savedFile.error);
      }

      Alert.alert(
        t("exportBackup"),
        `${t("backupSaved")}\n${savedFile.name ?? "rated-media-lists.csv"}`
      );
    } catch (error) {
      Alert.alert(t("backupError"), error instanceof Error ? error.message : String(error));
    } finally {
      setBackupBusy(false);
    }
  }

  async function importBackup(): Promise<void> {
    setBackupBusy(true);
    try {
      const [document] = await pick({ type: types.csv, mode: "import" });
      const localCopy = await keepLocalCopy({
        files: [{ uri: document.uri, fileName: document.name ?? "rated-media-lists.csv" }],
        destination: "cachesDirectory",
      });

      if (localCopy[0].status === "error") {
        throw new Error(localCopy[0].copyError);
      }

      const filePath = localCopy[0].localUri.replace(/^file:\/\//, "");
      const csv = await RNFS.readFile(filePath, "utf8");
      const result = await importLists(csv);
      Alert.alert(
        t("importBackup"),
        `${t("backupImported")}: ${result.itemsCreated}\n${t("backupSkipped")}: ${result.rowsSkipped}`
      );
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert(t("backupError"), error instanceof Error ? error.message : String(error));
    } finally {
      setBackupBusy(false);
    }
  }

  return (
    <View style={{ marginHorizontal: 10 }}>
      <View style={{ flexDirection: "row", marginVertical: 15, marginRight: 10, alignItems: "center", justifyContent: "space-between" }}>
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
          containerStyle={{ backgroundColor: theme.colors?.card }}
          textStyle={{ color: theme.colors?.text }}
        />
      </View>
      <View style={{ marginTop: 20 }}>
        <Button 
            buttonStyle={{ margin: 10, height: 40, borderRadius: 10 }}
            disabled={backupBusy} 
            onPress={exportBackup} 
          >
          {t("exportBackup")}
        </Button>
        <Button        
            buttonStyle={{ margin: 10, height: 40, borderRadius: 10 }}
            disabled={backupBusy} 
            onPress={importBackup}
          >
          {t("importBackup")}
        </Button>
      </View>
    </View>
  );
}
