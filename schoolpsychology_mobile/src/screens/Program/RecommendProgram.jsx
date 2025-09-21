import { ProgramCard } from "@/components";
import { useAuth } from "@/contexts";
import { fetchAllRecommendedPrograms } from "@/services/api/ProgramService";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const RecommendProgram = ({ navigation }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [recommendedPrograms, setRecommandedPrograms] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([fetchAllRecommendedPrograms(user.id)])
        .then((data) => setRecommandedPrograms(data[0] || []))
        .catch((error) => {
          console.warn(`Error loading recommended programs:`, error);
          setRecommandedPrograms([]);
        });
    }, [])
  );

  return recommendedPrograms.length === 0 ? (
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
  ) : (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.programScrollContainer}
    >
      {recommendedPrograms.map((item) => {
        return (
          <View key={item.id} style={styles.programCard}>
            <ProgramCard
              program={item}
              onPress={() =>
                navigation.navigate("Program", {
                  screen: "ProgramDetail",
                  params: { programId: item.id },
                })
              }
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Program Styles
  programScrollContainer: {
    // paddingRight: 24,
    width: "100%",
  },
  programCard: {
    // width: 30,
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
  programEmptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RecommendProgram;
