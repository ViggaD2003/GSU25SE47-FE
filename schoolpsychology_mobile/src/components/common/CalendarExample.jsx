import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import {
  addEventToCalendar,
  addAppointmentToCalendar,
  addSurveyReminderToCalendar,
  requestCalendarPermissions,
  checkCalendarPermissions,
  isCalendarSupported,
} from "../../utils/calendarUtils";

const CalendarExample = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPermissions = async () => {
    try {
      setIsLoading(true);
      const granted = await requestCalendarPermissions();
      if (granted) {
        Alert.alert("Thành công", "Đã cấp quyền truy cập lịch");
      } else {
        Alert.alert("Lỗi", "Cần cấp quyền để thêm sự kiện vào lịch");
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSimpleEvent = async () => {
    try {
      setIsLoading(true);

      // Tạo sự kiện đơn giản
      const eventData = {
        title: "Cuộc họp quan trọng",
        description: "Cuộc họp với team về dự án mới",
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Ngày mai
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 giờ sau
        location: "Phòng họp A",
        alarms: [
          {
            relativeOffset: -30, // 30 phút trước
            method: 1, // ALERT
          },
        ],
      };

      const eventId = await addEventToCalendar(eventData);
      Alert.alert("Thành công", `Đã thêm sự kiện vào lịch với ID: ${eventId}`);
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAppointment = async () => {
    try {
      setIsLoading(true);

      // Tạo cuộc hẹn tư vấn
      const appointment = {
        title: "Tư vấn tâm lý",
        description: "Cuộc hẹn tư vấn tâm lý định kỳ",
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 ngày sau
        endTime: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000
        ), // 45 phút sau
        location: "Phòng tư vấn 301",
        psychologistName: "TS. Nguyễn Văn A",
      };

      const eventId = await addAppointmentToCalendar(appointment);
      Alert.alert("Thành công", `Đã thêm cuộc hẹn vào lịch với ID: ${eventId}`);
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSurveyReminder = async () => {
    try {
      setIsLoading(true);

      // Tạo nhắc nhở khảo sát
      const survey = {
        title: "Khảo sát đánh giá tâm lý",
        description: "Khảo sát định kỳ để đánh giá tình trạng tâm lý",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 tuần sau
      };

      const eventId = await addSurveyReminderToCalendar(survey);
      Alert.alert(
        "Thành công",
        `Đã thêm nhắc nhở khảo sát vào lịch với ID: ${eventId}`
      );
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckSupport = async () => {
    try {
      setIsLoading(true);
      const supported = await isCalendarSupported();
      const hasPermission = await checkCalendarPermissions();

      Alert.alert(
        "Thông tin lịch",
        `Hỗ trợ lịch: ${supported ? "Có" : "Không"}\nQuyền truy cập: ${
          hasPermission ? "Đã cấp" : "Chưa cấp"
        }`
      );
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ví dụ sử dụng Calendar Utils</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestPermissions}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Đang xử lý..." : "Yêu cầu quyền truy cập lịch"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCheckSupport}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Đang kiểm tra..." : "Kiểm tra hỗ trợ lịch"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddSimpleEvent}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Đang thêm..." : "Thêm sự kiện đơn giản"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddAppointment}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Đang thêm..." : "Thêm cuộc hẹn tư vấn"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddSurveyReminder}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Đang thêm..." : "Thêm nhắc nhở khảo sát"}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Hướng dẫn sử dụng:</Text>
        <Text style={styles.infoText}>
          1. Nhấn "Yêu cầu quyền truy cập lịch" để cấp quyền{"\n"}
          2. Sử dụng các hàm trong calendarUtils.js để thêm sự kiện{"\n"}
          3. Các sự kiện sẽ được thêm vào lịch hệ thống của thiết bị{"\n"}
          4. Hỗ trợ thêm nhắc nhở và báo thức cho sự kiện
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
});

export default CalendarExample;
