import React from "react";
import { View, Text } from "react-native";


export default function StrengthBar({ score, color }) {
    const pct = (score / 4) * 100;
    return (
        <View style={{ marginTop: 8 }}>
            <View style={{ height: 8, width: "100%", backgroundColor: "#E5E7EB", borderRadius: 6, overflow: "hidden" }}>
                <View style={{ height: 8, width: `${pct}%`, backgroundColor: color, borderRadius: 6 }} />
            </View>
            <Text style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>
                {["Too weak", "Weak", "Fair", "Good", "Strong"][score]}
            </Text>
        </View>
    );
}