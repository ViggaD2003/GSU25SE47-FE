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
import { useAuth } from "@/contexts";

export default function ProgramList() {
  const { user } = useAuth();
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
      const data = await fetchAllRecommendedPrograms(user?.id);
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
    if (program?.id) {
      navigation.navigate("Program", {
        screen: "ProgramDetail",
        params: {
          programId: program.id,
        },
      });
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
      <Text style={styles.emptyTitle}>No Programs Available</Text>
      <Text style={styles.emptyDescription}>
        There are no recommended programs at the moment. Please check back
        later.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <Container>
        <HeaderWithoutTab
          title="Recommended Programs"
          onBackPress={handleBackPress}
        />
        <Loading />
      </Container>
    );
  }

  return (
    <Container>
      <HeaderWithoutTab
        title="Recommended Programs"
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
