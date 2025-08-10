import { Container } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { getClosedCases } from "@/services/api/caseApi";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

const ClosedCases = ({ navigation }) => {
  const { t } = useTranslation();
  const [closedCases, setClosedCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClosedCases = async () => {
      setLoading(true);
      try {
        const cases = await getClosedCases();
        console.log(cases);
        setClosedCases(cases);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchClosedCases();
  }, []);

  const handleCasePress = (caseId) => {
    navigation.navigate("Case", {
      screen: "CaseDetails",
      params: {
        from: "closedCases",
        caseId,
        headerTitle: t("case.details"),
        emptyTitle: t("case.emptyTitle"),
      },
    });
  };

  return (
    <Container>
      <HeaderWithoutTab
        title={t("case.closedCases")}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
    </Container>
  );
};

const styles = StyleSheet.create({});

export default ClosedCases;
