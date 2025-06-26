import React from "react";
import { Button, Text, View } from "react-native";
import Container from "../../components/Container";
import api from "../../utils/axios";

export default function HomeScreen() {
  return (
    <Container>
      <View>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Home Screen</Text>
      </View>
    </Container>
  );
}
