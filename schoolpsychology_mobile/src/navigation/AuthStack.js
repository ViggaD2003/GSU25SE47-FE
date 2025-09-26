import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Authentication/Login";
import VerifyEmail from "../screens/Authentication/VerifyEmailScreen";
import VerifyOtp from "../screens/Authentication/VerifyOtpScreen";
import ChangePassword from "../screens/Authentication/ChangePassWordScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
      <Stack.Screen
        name="ChangePassword"
        options={{
          gestureEnabled: false,
          headerBackVisible: false,
        }}
        component={ChangePassword}
      />
      <Stack.Screen
        name="Done"
        options={{
          gestureEnabled: false,
          headerBackVisible: false,
        }}
        component={require("../screens/Authentication/DoneScreen").default}
      />
      {/* <Stack.Screen name="Register" component={Register} /> */}
    </Stack.Navigator>
  );
}
