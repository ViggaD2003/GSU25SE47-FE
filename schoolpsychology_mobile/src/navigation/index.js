import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import AuthStack from "./AuthStack";
import { useAuth } from "@/contexts";

const Stack = createNativeStackNavigator();

const RootStack = () => {
  const { user } = useAuth();
  return user ? <MainTabs /> : <AuthStack />;
};
export default RootStack;
