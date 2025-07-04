import React, { useState } from "react";
import BookingScreen from "./BookingScreen";
import Toast from "../../components/common/Toast";

const BookingScreenWrapper = ({ navigation }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  return (
    <>
      <BookingScreen
        navigation={navigation}
        setShowToast={setShowToast}
        setToastMessage={setToastMessage}
        setToastType={setToastType}
      />
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setShowToast(false)}
      />
    </>
  );
};

export default BookingScreenWrapper;
