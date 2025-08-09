import { Container } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import HeaderWithTab from "@/components/ui/header/HeaderWithTab";
import { useAuth } from "@/contexts";
import { getCaseByCaseId } from "@/services/api/caseApi";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

const CaseDetails = ({ route, navigation }) => {
  const { user } = useAuth();
  const { caseId, headerTitle, emptyTitle, from, subTitle } = route.params;
  const [caseDetails, setCaseDetails] = useState(null);

  useEffect(() => {
    if (!caseId || !user?.caseId) return;

    const fetchCaseDetails = async () => {
      const caseDetails = await getCaseByCaseId(caseId || user?.caseId);
      console.log(caseDetails);
      setCaseDetails(caseDetails);
    };

    fetchCaseDetails();
  }, [caseId, user?.caseId]);

  return (
    <Container>
      {from === "tab" ? (
        <HeaderWithTab title={headerTitle} subtitle={subTitle} />
      ) : (
        <HeaderWithoutTab
          title={headerTitle}
          onBackPress={() => {
            navigation.goBack();
          }}
        />
      )}
      <View>
        {caseDetails ? (
          <View>
            <Text>Case ID: {caseDetails.id}</Text>
            <Text>Case Name: {caseDetails.name}</Text>
          </View>
        ) : (
          <View>
            <Text>{emptyTitle}</Text>
          </View>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({});

export default CaseDetails;
