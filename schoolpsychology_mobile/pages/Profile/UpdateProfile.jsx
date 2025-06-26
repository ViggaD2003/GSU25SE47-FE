import React, { useEffect, useState } from "react";
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
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import Container from "../../components/Container";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axios";

export default function UpdateProfile({ route }) {
  const navigation = useNavigation();
  const [data, setData] = useState({});
  const { user } = useAuth();

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
      if (Platform.OS === "android") {
        ToastAndroid.show("Profile updated successfully!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        console.error("API error:", error.response.data.message);
        Alert.alert("Error", error.response.data.message);
      } else {
        console.error("Unexpected error:", error.message);
        Alert.alert("Error", "Something went wrong while fetching profile.");
      }
    }
  };

  const showAndroidDatePicker = () => {
    DateTimePickerAndroid.open({
      value: dob ? new Date(dob) : new Date(),
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          const isoDate = selectedDate.toISOString().split("T")[0];
          setDob(isoDate);
        }
      },
      mode: "date",
      is24Hour: true,
      maximumDate: new Date(),
    });
  };

  return (
    <Container>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

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
          <TouchableOpacity onPress={showAndroidDatePicker}>
            <TextInput
              style={styles.input}
              value={dob}
              placeholder="YYYY-MM-DD"
              editable={false}
            />
          </TouchableOpacity>

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

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#181A3D",
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
  saveBtn: {
    backgroundColor: "#181A3D",
    borderRadius: 10,
    marginTop: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
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
