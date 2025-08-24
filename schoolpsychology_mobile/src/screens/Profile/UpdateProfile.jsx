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
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
import { Container } from "../../components";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { api } from "../../services";
import { useAuth } from "../../contexts";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useTranslation } from "react-i18next";

export default function UpdateProfile({ route }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const profileData = route?.params?.profileData;

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    gender: true,
    dob: "",
    isEnableSurvey: false,
  });

  // Class information (read-only)
  const [classInfo, setClassInfo] = useState({
    studentCode: "",
    codeClass: "",
    schoolYear: "",
  });

  // Teacher information (read-only)
  const [teacherInfo, setTeacherInfo] = useState({
    teacherName: "",
    teacherEmail: "",
    teacherPhone: "",
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useFocusEffect(
    React.useCallback(() => {
      if (profileData) {
        setFormData({
          fullName: profileData.fullName || "",
          phoneNumber: profileData.phoneNumber || "",
          gender: profileData.gender ?? true,
          dob: profileData.dob || "",
          isEnableSurvey: profileData.isEnableSurvey ?? false,
        });

        // Set class information
        setClassInfo({
          studentCode: profileData.studentCode || "",
          codeClass: profileData.classDto?.codeClass || "",
          schoolYear: profileData.classDto?.schoolYear || "",
        });

        // Set teacher information
        setTeacherInfo({
          teacherName: profileData.classDto?.teacher?.fullName || "",
          teacherEmail: profileData.classDto?.teacher?.email || "",
          teacherPhone: profileData.classDto?.teacher?.phoneNumber || "",
        });
      }
    }, [])
  );

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dob: formData.dob,
      };
      const response = await api.put("/api/v1/account", payload);
      console.log("Update Profile:", response.data);

      // Update user context with new data
      setFormData({
        ...response.data,
      });

      // Update class information if available
      if (response.data.classDto) {
        setClassInfo({
          studentCode: response.data.studentCode || "",
          codeClass: response.data.classDto.codeClass || "",
          schoolYear: response.data.classDto.schoolYear || "",
        });

        // Update teacher information if available
        if (response.data.classDto.teacher) {
          setTeacherInfo({
            teacherName: response.data.classDto.teacher.fullName || "",
            teacherEmail: response.data.classDto.teacher.email || "",
            teacherPhone: response.data.classDto.teacher.phoneNumber || "",
          });
        }
      }

      // Show success message using Alert
      Alert.alert("Thành công", "Thông tin đã được cập nhật thành công! 🎉", [
        {
          text: "OK",
          onPress: () => {
            updateUser(response.data);
            refreshUser();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDate = (selectedDate) => {
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split("T")[0];
      updateFormData("dob", isoDate);
    }
    setDatePickerVisibility(false);
  };

  const handleBackPress = useCallback(() => {
    // Check if form has been modified
    const profileData = route?.params?.data;
    const hasChanges =
      profileData &&
      (formData.fullName !== profileData.fullName ||
        formData.phoneNumber !== profileData.phoneNumber ||
        formData.gender !== profileData.gender ||
        formData.dob !== profileData.dob ||
        formData.isEnableSurvey !== profileData.isEnableSurvey);

    if (hasChanges) {
      Alert.alert(
        "Bạn có chắc chắn?",
        "Những thay đổi chưa được lưu sẽ bị mất. Bạn có muốn thoát không?",
        [
          {
            text: "Ở lại",
            style: "cancel",
          },
          {
            text: "Thoát",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [navigation, formData, route?.params?.data]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Container>
      {/* Header */}
      <HeaderWithoutTab
        title={"Cập nhật thông tin"}
        onBackPress={handleBackPress}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Icon name="account" size={80} color="#6B7280" />
          </View>
          <Text style={styles.avatarText}>Ảnh đại diện</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => updateFormData("fullName", text)}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ""}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.helperText}>Email không thể thay đổi</Text>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) => updateFormData("phoneNumber", text)}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender && styles.genderButtonActive,
                ]}
                onPress={() => updateFormData("gender", true)}
              >
                <Ionicons
                  name="male"
                  size={20}
                  color={formData.gender ? "#FFFFFF" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.genderText,
                    formData.gender && styles.genderTextActive,
                  ]}
                >
                  Nam
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  !formData.gender && styles.genderButtonActive,
                ]}
                onPress={() => updateFormData("gender", false)}
              >
                <Ionicons
                  name="female"
                  size={20}
                  color={!formData.gender ? "#FFFFFF" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.genderText,
                    !formData.gender && styles.genderTextActive,
                  ]}
                >
                  Nữ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setDatePickerVisibility(true)}
            >
              <Text
                style={formData.dob ? styles.dateText : styles.datePlaceholder}
              >
                {formData.dob ? formatDate(formData.dob) : "Chọn ngày sinh"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Class Information (Student only) */}
          {user?.role === "STUDENT" &&
            (user?.classDto ? (
              <>
                {/* Student Code */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mã học sinh</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={classInfo.studentCode}
                    editable={false}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.helperText}>
                    Mã học sinh không thể thay đổi
                  </Text>
                </View>

                {/* Class Code */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Lớp</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={classInfo.codeClass}
                    editable={false}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.helperText}>
                    Thông tin lớp không thể thay đổi
                  </Text>
                </View>

                {/* School Year */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Năm học</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={classInfo.schoolYear.name}
                    editable={false}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.helperText}>
                    Năm học không thể thay đổi
                  </Text>
                </View>

                {/* Teacher Information Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Thông tin giáo viên chủ nhiệm
                  </Text>
                </View>

                {/* Teacher Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tên giáo viên</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={teacherInfo.teacherName}
                    editable={false}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.helperText}>Tên giáo viên chủ nhiệm</Text>
                </View>

                {/* Teacher Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email giáo viên</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={teacherInfo.teacherEmail}
                    editable={false}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.helperText}>
                    Email liên hệ với giáo viên
                  </Text>
                </View>

                {/* Teacher Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại giáo viên</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={teacherInfo.teacherPhone}
                    editable={false}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.helperText}>
                    Số điện thoại liên hệ với giáo viên
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="warning" size={24} color="#F59E0B" />
                  <Text style={styles.warningTitle}>
                    {t("appointment.booking.warning.title")}
                  </Text>
                </View>
                <Text style={styles.warningText}>
                  {t("appointment.booking.warning.noTeacher")}
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.saveButtonText}>Đang cập nhật...</Text>
          </View>
        ) : (
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        )}
      </TouchableOpacity>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
        maximumDate={new Date()}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    position: "relative",
  },
  warningCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 24,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {},
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
  },
  helperText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  genderButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  genderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  genderTextActive: {
    color: "#FFFFFF",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  dateText: {
    fontSize: 16,
    color: "#1F2937",
  },
  datePlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 16,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toastContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    zIndex: 9999,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
