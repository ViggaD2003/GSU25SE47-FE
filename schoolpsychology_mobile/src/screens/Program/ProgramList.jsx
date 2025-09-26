import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Container } from "../../components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import ProgramCard from "../../components/common/ProgramCard";
import { fetchAllRecommendedPrograms } from "../../services/api/ProgramService";
import { Loading } from "../../components/common";
import { useAuth, useChildren } from "@/contexts";
import { useTranslation } from "react-i18next";

export default function ProgramList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { selectedChild, children } = useChildren();
  const navigation = useNavigation();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchPrograms();
    }, [])
  );
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      if (user?.role === "PARENTS") {
        if (selectedChild && !selectedChild?.id) {
          setPrograms([]);
          return;
        }
      }
      if (!user?.id) {
        setPrograms([]);
        return;
      }

      const userId =
        user?.role === "PARENTS"
          ? selectedChild?.id
          : user?.id || user?.childId;

      console.log("userId", userId);

      const data = await fetchAllRecommendedPrograms(userId);
      console.log(data);

      setPrograms(data);
    } catch (error) {
      console.warn("Error fetching programs:", error);
      Alert.alert("Error", "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrograms();
    setRefreshing(false);
  };

  const handleProgramPress = (program) => {
    if (program?.id) {
      navigation.navigate("ProgramDetail", { programId: program.id });
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderProgramCard = ({ item }) => (
    <ProgramCard program={item} onPress={handleProgramPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{t("program.list.empty.title")}</Text>
      <Text style={styles.emptyDescription}>
        {t("program.list.empty.description")}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <Container edges={["top", "bottom"]}>
        <HeaderWithoutTab
          title={t("program.list.title")}
          onBackPress={handleBackPress}
        />
        <Loading />
      </Container>
    );
  }

  return (
    <Container edges={["top", "bottom"]}>
      <HeaderWithoutTab
        title={t("program.list.title")}
        onBackPress={handleBackPress}
      />

      <FlatList
        data={programs}
        renderItem={renderProgramCard}
        keyExtractor={(item) => item?.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
