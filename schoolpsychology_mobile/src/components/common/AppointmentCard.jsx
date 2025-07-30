import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;

const AppointmentCard = ({ appointment, onPress }) => {
  const { user } = useAuth();

  const formatDateTime = (dateTimeString) => {
    try {
      return dayjs(dateTimeString).format("HH:mm");
    } catch (error) {
      return "N/A";
    }
  };

  const formatDate = (dateTimeString) => {
    try {
      return dayjs(dateTimeString).format("DD/MM/YYYY");
    } catch (error) {
      return "N/A";
    }
  };

  const formatDayOfWeek = (dateTimeString) => {
    try {
      return dayjs(dateTimeString).locale("vi").format("dddd");
    } catch (error) {
      return "";
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          color: "#10B981",
          bgColor: "#ECFDF5",
          borderColor: "#D1FAE5",
          gradient: ["#10B981", "#059669"],
        };
      case "PENDING":
        return {
          color: "#F59E0B",
          bgColor: "#FFFBEB",
          borderColor: "#FED7AA",
          gradient: ["#F59E0B", "#D97706"],
        };
      case "IN_PROGRESS":
        return {
          color: "#051396",
          bgColor: "#EFF6FF",
          borderColor: "#BFDBFE",
          gradient: ["#051396", "#2563EB"],
        };
      default:
        return {
          color: "#6B7280",
          bgColor: "#F9FAFB",
          borderColor: "#E5E7EB",
          gradient: ["#6B7280", "#4B5563"],
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PENDING":
        return "Chờ xác nhận";
      case "IN_PROGRESS":
        return "Đang diễn ra";
      default:
        return status;
    }
  };

  const getHostTypeText = (hostType) => {
    switch (hostType) {
      case "TEACHER":
        return "Giáo viên";
      case "COUNSELOR":
        return "Tư vấn viên";
      default:
        return hostType;
    }
  };

  const getHostTypeIcon = (hostType) => {
    switch (hostType) {
      case "TEACHER":
        return "school-outline";
      case "COUNSELOR":
        return "person-outline";
      default:
        return "person-outline";
    }
  };

  const getHostTypeColor = (hostType) => {
    switch (hostType) {
      case "TEACHER":
        return "#8B5CF6";
      case "COUNSELOR":
        return "#06B6D4";
      default:
        return "#3B82F6";
    }
  };

  // Check if bookFor and bookBy are the same person
  const isSamePerson = () => {
    if (!appointment.bookedFor || !appointment.bookedBy) return false;
    return appointment.bookedFor.id === appointment.bookedBy.id;
  };

  // Determine what booking information to show based on user role and ID
  const shouldShowBookedFor = () => {
    // If user is STUDENT, don't show "booked for" person
    if (user?.role === "STUDENT") {
      return false;
    }
    return true;
  };

  const shouldShowBookedBy = () => {
    // If user is PARENT and userId matches bookedBy.id, don't show "booked by" person
    if (user?.role === "PARENT" && user?.id === appointment.bookedBy?.id) {
      return false;
    }
    return true;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const hostTypeColor = getHostTypeColor(
    appointment.hostedBy?.roleName || appointment.slot?.roleName
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Status badge with gradient */}
      <View style={styles.statusBadgeContainer}>
        <LinearGradient
          colors={statusConfig.gradient}
          style={styles.statusBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {getStatusText(appointment.status)}
          </Text>
        </LinearGradient>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Host information with enhanced design */}
        <View style={styles.hostSection}>
          <LinearGradient
            colors={[hostTypeColor + "20", hostTypeColor + "10"]}
            style={styles.hostIconContainer}
          >
            <Ionicons
              name={getHostTypeIcon(
                appointment.hostedBy?.roleName || appointment.slot?.roleName
              )}
              size={20}
              color={hostTypeColor}
            />
          </LinearGradient>
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>
              {appointment.hostedBy?.fullName || appointment.slot?.fullName}
            </Text>
            <View style={styles.hostTypeContainer}>
              <Text style={[styles.hostType, { color: hostTypeColor }]}>
                {getHostTypeText(
                  appointment.hostedBy?.roleName || appointment.slot?.roleName
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Online/Offline indicator */}
        <View style={styles.onlineIndicator}>
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: appointment.isOnline ? "#10B981" : "#6B7280" },
            ]}
          />
          <Text style={styles.onlineText}>
            {appointment.isOnline ? "Trực tuyến" : "Trực tiếp"}
          </Text>
        </View>

        {/* Date and time with improved layout */}
        <View style={styles.datetimeSection}>
          <View style={styles.dateContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                {formatDate(appointment.startDateTime)}
              </Text>
              <Text style={styles.dayText}>
                {formatDayOfWeek(appointment.startDateTime)}
              </Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
            </View>
            <Text style={styles.timeText}>
              {formatDateTime(appointment.startDateTime)} -{" "}
              {formatDateTime(appointment.endDateTime)}
            </Text>
          </View>
        </View>

        {/* Booking information - conditionally displayed */}
        {shouldShowBookedFor() && appointment.bookedFor && (
          <View style={styles.bookingSection}>
            <View style={styles.iconWrapper}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>
                {isSamePerson() ? "Người đặt lịch" : "Đặt cho"}
              </Text>
              <Text style={styles.bookingName}>
                {isSamePerson()
                  ? appointment.bookedBy?.fullName
                  : appointment.bookedFor?.fullName}
              </Text>
              {!isSamePerson() &&
                shouldShowBookedBy() &&
                appointment.bookedBy && (
                  <Text style={styles.bookingBy}>
                    Đặt bởi: {appointment.bookedBy?.fullName}
                  </Text>
                )}
            </View>
          </View>
        )}

        {/* Show booked by only if booked for is not shown and we should show booked by */}
        {!shouldShowBookedFor() &&
          shouldShowBookedBy() &&
          appointment.bookedBy && (
            <View style={styles.bookingSection}>
              <View style={styles.iconWrapper}>
                <Ionicons name="people-outline" size={16} color="#6B7280" />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingLabel}>Đặt bởi</Text>
                <Text style={styles.bookingName}>
                  {appointment.bookedBy?.fullName}
                </Text>
              </View>
            </View>
          )}

        {/* Reason with enhanced styling */}
        {/* {appointment.reasonBooking && (
          <View style={styles.reasonSection}>
            <View style={styles.iconWrapper}>
              <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
            </View>
            <Text style={styles.reasonText} numberOfLines={2}>
              {appointment.reasonBooking}
            </Text>
          </View>
        )} */}

        {/* Location with enhanced styling */}
        {appointment.location && (
          <View style={styles.locationSection}>
            <View style={styles.iconWrapper}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {appointment.location}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    overflow: "hidden",
  },
  statusBadgeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FFFFFF",
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  hostSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  hostIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  hostTypeContainer: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  hostType: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  onlineText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  datetimeSection: {
    marginBottom: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 1,
  },
  dayText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  timeText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
  bookingSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 2,
  },
  bookingName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
    marginBottom: 2,
  },
  bookingBy: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  reasonSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
  },
  reasonText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
    lineHeight: 18,
    fontWeight: "500",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    fontWeight: "500",
  },
});

export default AppointmentCard;
