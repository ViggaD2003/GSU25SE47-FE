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
import {
  fetchAllRecommendedPrograms,
  getAllProgramsRecord,
} from "../../services/api/ProgramService";
import { ChildSelector, Loading } from "../../components/common";
import { useAuth, useChildren } from "@/contexts";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

export default function ProgramRecord() {
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
      if (user?.role === "PARENTS") {
        if (selectedChild && !selectedChild?.id) {
          setPrograms([]);
          return;
        }
      }
      setLoading(true);

      if (!user?.userId || !user?.id) {
        setPrograms([]);
        return;
      }

      const userId =
        user?.role === "PARENTS" ? selectedChild?.id : user?.id || user?.userId;
      const data = await getAllProgramsRecord(userId);
      console.log(data);

      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
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
    console.log("Clicked program:", program);

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
      <Text style={styles.emptyTitle}>{t("program.record.empty.title")}</Text>
      <Text style={styles.emptyDescription}>
        {t("program.record.empty.description")}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <Container>
        <HeaderWithoutTab
          title={t("program.record.title")}
          onBackPress={handleBackPress}
        />
        <Loading />
      </Container>
    );
  }

  return (
    <Container>
      <HeaderWithoutTab
        title={t("program.record.title")}
        onBackPress={handleBackPress}
      />

      {user?.role === "PARENTS" && children && children.length > 0 && (
        <View style={styles.childSelectorContainer}>
          <ChildSelector />
        </View>
      )}

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
  childSelectorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
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
