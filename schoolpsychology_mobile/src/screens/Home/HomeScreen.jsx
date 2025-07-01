import React, { useState } from "react";
import { Container } from "../../components";
import Toast from "../../components/common/Toast";
import { useAuth } from "../../contexts";
import StudentHome from "./StudentHome";
import ParentHome from "./ParentHome";

// const isLargeDevice = width >= 414;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  return (
    <Container>
      {user.role === "STUDENT" ? (
        <StudentHome
          navigation={navigation}
          setShowToast={setShowToast}
          setToastMessage={setToastMessage}
          setToastType={setToastType}
        />
      ) : (
        <ParentHome navigation={navigation} />
      )}
      <Toast message={toastMessage} type={toastType} visible={showToast} />
    </Container>
  );
}
