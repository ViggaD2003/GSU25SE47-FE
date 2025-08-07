import { Container } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { getClosedCases } from "@/services/api/caseApi";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const ClosedCases = ({ navigation }) => {
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
        headerTitle: "Chi tiết trường hợp",
        emptyTitle: "Không tìm thấy thông tin",
      },
    });
  };

  return (
    <Container>
      <HeaderWithoutTab
        title={"Các trường hợp đã đóng"}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
    </Container>
  );
};

const styles = StyleSheet.create({});

export default ClosedCases;
