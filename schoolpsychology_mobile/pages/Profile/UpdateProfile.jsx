import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ScrollView,
  ToastAndroid,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
import Container from "../../components/Container";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axios";
import Toast from "../../components/common/Toast";

export default function UpdateProfile({ route }) {
  const navigation = useNavigation();
  const [data, setData] = useState({});
  const { user } = useAuth();
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState(true);
  const [dob, setDob] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [isEnableSurvey, setIsEnableSurvey] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [codeClass, setCodeClass] = useState("");
  const [classYear, setClassYear] = useState("");

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: "", type: "info" });
  };

  useFocusEffect(
    React.useCallback(() => {
      const profileData = route?.params?.data;
      if (profileData) {
        setData(profileData);
        setFullName(profileData.fullName || "");
        setEmail(profileData.email || "");
        setPhoneNumber(profileData.phoneNumber || "");
        setGender(profileData.gender ?? true);
        setDob(profileData.dob || "");
        setStudentCode(profileData.studentCode || "");
        setIsEnableSurvey(profileData.isEnableSurvey ?? false);
        setTeacherName(profileData.classDto?.teacher?.fullName || "");
        setTeacherEmail(profileData.classDto?.teacher?.email || "");
        setCodeClass(profileData.classDto?.codeClass || "");
        setClassYear(profileData.classDto?.classYear || "");
      }
    }, [route?.params?.data])
  );

  const handleSave = async () => {
    try {
      const payload = {
        fullName,
        phoneNumber,
        gender,
        dob,
        isEnableSurvey,
      };
      const response = await api.put("/api/v1/account", payload);
      setData(response.data);

      showToast("Profile Updated 🎉", "success");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong while updating profile.";
      showToast(message, "error");
    }
  };

  const handleConfirmDate = (selectedDate) => {
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split("T")[0];
      setDob(isoDate);
    }
    setDatePickerVisibility(false);
  };

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Container>
      <View style={{ flex: 1, paddingVertical: 16 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cập nhật thông tin</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarWrapper}>
              <Icon name="account" size={90} color="#222" />
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderToggle}>
                <TouchableOpacity
                  onPress={() => setGender(true)}
                  style={[styles.genderBtn, gender && styles.genderActive]}
                >
                  <Text style={gender && styles.genderActiveText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setGender(false)}
                  style={[styles.genderBtn, !gender && styles.genderActive]}
                >
                  <Text style={!gender && styles.genderActiveText}>Female</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                <TextInput
                  style={styles.input}
                  value={dob}
                  placeholder="YYYY-MM-DD"
                  editable={false}
                />
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisibility(false)}
                maximumDate={new Date()}
              />

              {user.role === "STUDENT" && (
                <>
                  <Text style={styles.label}>Enable Survey</Text>
                  <Switch
                    value={isEnableSurvey}
                    onValueChange={setIsEnableSurvey}
                  />

                  <Text style={styles.label}>Student Code</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={studentCode}
                    editable={false}
                  />

                  <Text style={styles.label}>Class</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={codeClass}
                    editable={false}
                  />

                  <Text style={styles.label}>Class Year</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={classYear}
                    editable={false}
                  />

                  <Text style={styles.label}>Teacher Name</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={teacherName}
                    editable={false}
                  />

                  <Text style={styles.label}>Teacher Email</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={teacherEmail}
                    editable={false}
                  />
                </>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Toast */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </View>
    </Container>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  avatarWrapper: {
    backgroundColor: "#F3F3F3",
    borderRadius: 100,
    padding: 18,
    alignSelf: "center",
    marginBottom: 18,
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  form: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  label: {
    fontSize: 15,
    color: "#181A3D",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  disabledInput: {
    opacity: 0.5,
  },
  saveButton: {
    backgroundColor: "#181A3D",
    borderRadius: 10,
    marginTop: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  genderToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  genderBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  genderActive: {
    backgroundColor: "#181A3D",
    borderColor: "#181A3D",
  },
  genderActiveText: {
    color: "#fff",
  },
});
