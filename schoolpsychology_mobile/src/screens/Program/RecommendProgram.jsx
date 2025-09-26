import { ProgramCard, Loading } from "@/components";
import { useAuth } from "@/contexts";
import { fetchAllRecommendedPrograms } from "@/services/api/ProgramService";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RecommendProgram = ({ navigation }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [recommendedPrograms, setRecommandedPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecommended = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAllRecommendedPrograms(user.id);
      setRecommandedPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn(`Error loading recommended programs:`, err);
      setError(err);
      setRecommandedPrograms([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      loadRecommended();
    }, [loadRecommended])
  );

  if (isLoading) {
    return <Loading text={t("common.loading") || "Đang tải..."} />;
  }

  if (error) {
    return (
      <View style={styles.programEmptyContainer}>
        <View style={styles.programEmptyIconContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F59E0B" />
        </View>
        <Text style={styles.programEmptyText}>
          {t("common.error") || "Đã xảy ra lỗi"}
        </Text>
        <Text style={styles.programEmptySubText}>
          {t("home.recommendedPrograms.empty.description")}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={loadRecommended}
          style={styles.programRetryButton}
        >
          <Text style={styles.programEmptyButtonText}>
            {t("common.retry") || "Thử lại"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (recommendedPrograms.length === 0) {
    return (
      <View style={styles.programEmptyContainer}>
        <View style={styles.programEmptyIconContainer}>
          <MaterialIcons name="school" size={48} color="#9CA3AF" />
        </View>
        <Text style={styles.programEmptyText}>
          {t("home.recommendedPrograms.empty.title")}
        </Text>
        <Text style={styles.programEmptySubText}>
          {t("home.recommendedPrograms.empty.description")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recommendedPrograms}
      keyExtractor={(item) => String(item.id)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.programScrollContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <View style={styles.programCard}>
          <ProgramCard
            program={item}
            numberOfLines={1}
            onPress={() =>
              navigation.navigate("Program", {
                screen: "ProgramDetail",
                params: { programId: item.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={item?.name || "Program"}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  // Program Styles
  programScrollContainer: {
    // paddingRight: 24,
    // width: "100%",
    paddingHorizontal: 4,
  },
  programCard: {
    width: 300,
  },
  separator: {
    width: 12,
  },
  programEmptyContainer: {
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 40,
    marginTop: 10,
  },
  programEmptyIconContainer: {
    marginBottom: 16,
  },
  programEmptyText: {
    color: "#9CA3AF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  programEmptySubText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  programEmptyButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  programRetryButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  programEmptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RecommendProgram;
