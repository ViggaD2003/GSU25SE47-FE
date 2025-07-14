import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";

const { width, height } = Dimensions.get("window");

const StatusScreen = ({ route }) => {
  const { title, message, response } = route.params;
  const navigation = useNavigation();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handleGoHome = () => {
    navigation.popTo("Home");
  };

  const handleViewAppointments = () => {
    navigation.navigate("Appointments");
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa xác định";
    try {
      return dayjs(dateTimeString).format("HH:mm");
    } catch (error) {
      return dateTimeString;
    }
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "Chưa xác định";
    try {
      return dayjs(dateTimeString).format("DD/MM/YYYY");
    } catch (error) {
      return dateTimeString;
    }
  };

  const getAppointmentType = (isOnline) => {
    return isOnline ? "Tư vấn trực tuyến" : "Tư vấn trực tiếp";
  };

  return (
    <View style={styles.container}>
      {/* Background with gradient effect */}
      <LinearGradient
        colors={["#4CAF50", "#45a049", "#2E7D32"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Success icon with enhanced animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["#4CAF50", "#45a049", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBackground}
            >
              <View style={styles.iconInnerCircle}>
                <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
              </View>
            </LinearGradient>
          </Animated.View>
          {/* Title with gradient text effect */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {title || "Đặt lịch hẹn thành công!"}
            </Text>
            <View style={styles.titleUnderline} />
          </View>
          {/* Message */}
          <Text style={styles.message}>
            {message ||
              "Lịch hẹn của bạn đã được xác nhận. Chúng tôi sẽ gửi thông báo chi tiết qua email."}
          </Text>
          {/* Appointment details with enhanced design */}
          {response && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailsHeader}>
                <View style={styles.detailsHeaderIcon}>
                  <MaterialIcons
                    name="event-available"
                    size={23}
                    color="#4CAF50"
                  />
                </View>
                <Text style={styles.detailsHeaderText}>Chi tiết lịch hẹn</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialIcons name="schedule" size={20} color="#4CAF50" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Ngày tư vấn</Text>
                  <Text style={styles.detailText}>
                    {formatDate(response.startDateTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialIcons
                    name="access-alarm"
                    size={20}
                    color="#4CAF50"
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Thời gian tư vấn</Text>
                  <Text style={styles.detailText}>
                    {formatTime(response.startDateTime)} -{" "}
                    {formatTime(response.endDateTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialIcons name="location-on" size={20} color="#4CAF50" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Địa điểm</Text>
                  <Text style={styles.detailText}>
                    {response.isOnline
                      ? response.location || "Link meeting"
                      : "Địa điểm sẽ được cập nhật sau"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialIcons name="video-call" size={20} color="#4CAF50" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Hình thức</Text>
                  <Text style={styles.detailText}>
                    {getAppointmentType(response.isOnline)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          {/* Action buttons with enhanced design */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewAppointments}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#4CAF50", "#45a049"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>
                  Xem lịch hẹn của tôi
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["rgba(76, 175, 80, 0.1)", "rgba(69, 160, 73, 0.1)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.secondaryButtonGradient}
              >
                <MaterialIcons
                  name="home"
                  size={20}
                  color="#4CAF50"
                  style={styles.buttonIcon}
                />
                <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {/* Additional info with enhanced design */}
          <View style={styles.infoContainer}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="info-outline" size={18} color="#4CAF50" />
            </View>
            <Text style={styles.infoText}>
              Bạn có thể hủy lịch hẹn trong phần "Lịch hẹn của tôi"
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confetti1: {
    position: "absolute",
    top: "15%",
    left: "10%",
  },
  confetti2: {
    position: "absolute",
    top: "25%",
    right: "15%",
  },
  confetti3: {
    position: "absolute",
    top: "35%",
    left: "20%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
  },
  contentContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    margin: 20,
    width: width - 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  iconContainer: {
    marginBottom: 10,
  },
  iconBackground: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconInnerCircle: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  detailsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    paddingTop: 16,
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  detailsHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 8,
  },
  detailsHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    fontWeight: "500",
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#4CAF50",
    overflow: "hidden",
  },
  secondaryButtonGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 24,
    paddingHorizontal: 10,
    gap: 8,
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    color: "#888",
    textAlign: "left",
    flex: 1,
    lineHeight: 18,
  },
});

export default StatusScreen;
