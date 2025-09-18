import { Container } from "@/components";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { View, Text } from "react-native";

export default function DoneScreen({navigation}) {
    return (
        <Container style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
                <View style={{ height: 64, width: 64, borderRadius: 18, backgroundColor: "#004B48", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Feather name="check" size={24} color="white" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>Password changed successfully</Text>
                <Text style={{ marginTop: 8, fontSize: 14, color: "#6B7280" }}>You can now sign in with your new password.</Text>
            </View>
            <View style={{ marginTop: 12, alignItems: "center" }}>
                <Text style={{ fontWeight: "600", color: "#004B48", textDecorationLine: 'underline' }} onPress={() => navigation.navigate('Login')}>
                    Go back to sign in
                </Text>
            </View>
        </Container>
    );
}