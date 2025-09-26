import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Container } from "../../components";
import { GlobalStyles } from "../../constants";
import Loading from "../../components/common/Loading";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
} from "@/services/api/AppointmentService";
import CalendarService from "@/services/CalendarService";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useTranslation } from "react-i18next";
import { Button } from "react-native-paper";

const AppointmentDetails = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { appointment } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError(null);
      const appointmentData = await getAppointmentById(appointment.id);
      setAppointmentData(appointmentData);
    } catch (error) {
      console.warn("Error fetching appointment:", error);
      setError("Failed to load appointment details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [appointment]);

  // Cancel reasons
  const cancelReasons = [
    {
      id: 1,
      title: t("appointment.cancelReasons.0"),
    },
    {
      id: 2,
      title: t("appointment.cancelReasons.1"),
    },
    {
      id: 3,
      title: t("appointment.cancelReasons.2"),
    },
    {
      id: 4,
      title: t("appointment.cancelReasons.3"),
    },
    {
      id: 0,
      title: t("appointment.cancelReasons.4"),
    },
  ];

  // Utility functions
  const formatDateTime = (dateTimeString) => {
    try {
      return dayjs(dateTimeString).format("HH:mm");
    } catch (error) {
      return t("appointment.common.notDetermined");
    }
  };

  const formatDate = (dateTimeString) => {
    try {
      return dayjs(dateTimeString).format("DD/MM/YYYY");
    } catch (error) {
      return t("appointment.common.notDetermined");
    }
  };

  const formatDayOfWeek = (dateTimeString) => {
    try {
      return dayjs(dateTimeString).locale("vi").format("dddd");
    } catch (error) {
      return "";
    }
  };

  const removeEventFromCalendar = async (appointmentId) => {
    try {
      console.log("Starting calendar cleanup for appointment:", appointmentId);

      // Kiểm tra xem appointment có được sync với calendar không
      let isSynced = false;
      // try {
      //   isSynced = await CalendarService.isAppointmentAlreadySynced(
      //     appointmentId
      //   );
      //   console.log("Appointment sync status:", isSynced);
      // } catch (syncError) {
      //   console.warn("Error checking sync status:", syncError);
      //   // Nếu không thể kiểm tra, giả sử không sync
      //   isSynced = false;
      // }

      if (!isSynced) {
        console.log("Appointment not synced, skipping calendar cleanup");
        return {
          success: true,
          message: "Appointment not synced with calendar",
        };
      }

      // Lấy event ID từ mapping
      let eventId = null;
      try {
        eventId = await CalendarService.getEventIdForAppointment(appointmentId);
        console.log("Event ID from mapping:", eventId);
      } catch (mappingError) {
        console.warn("Error getting event mapping:", mappingError);
        // Nếu không thể lấy mapping, xóa mapping để tránh inconsistency
        try {
          await CalendarService.removeEventMapping(appointmentId);
        } catch (removeMappingError) {
          console.warn("Error removing event mapping:", removeMappingError);
        }
        return {
          success: true,
          message: "No event mapping found, mapping removed",
        };
      }

      if (!eventId) {
        console.log("No event ID found for appointment, removing mapping");
        try {
          await CalendarService.removeEventMapping(appointmentId);
        } catch (removeMappingError) {
          console.warn("Error removing event mapping:", removeMappingError);
        }
        return {
          success: true,
          message: "No event ID found, mapping removed",
        };
      }

      // Xóa event khỏi calendar
      let deleteSuccess = false;
      try {
        deleteSuccess = await CalendarService.deleteEvent(eventId);
        console.log("Event deletion result:", deleteSuccess);
      } catch (deleteError) {
        console.warn("Error deleting calendar event:", deleteError);
        deleteSuccess = false;
      }

      // Luôn xóa mapping sau khi xử lý
      try {
        await CalendarService.removeEventMapping(appointmentId);
        console.log("Event mapping removed successfully");
      } catch (removeMappingError) {
        console.warn("Error removing event mapping:", removeMappingError);
      }

      if (deleteSuccess) {
        return {
          success: true,
          message: "Calendar event deleted successfully",
        };
      } else {
        return {
          success: false,
          message: "Failed to delete calendar event, but mapping removed",
        };
      }
    } catch (error) {
      console.warn("Unexpected error in removeEventFromCalendar:", error);
      // Xóa mapping để tránh inconsistency
      try {
        await CalendarService.removeEventMapping(appointmentId);
        console.log("Event mapping removed after error");
      } catch (removeMappingError) {
        console.warn(
          "Error removing event mapping after error:",
          removeMappingError
        );
      }
      return {
        success: false,
        message: "Calendar cleanup failed due to unexpected error",
      };
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      CONFIRMED: {
        color: "#10B981",
        bgColor: "#ECFDF5",
        text: t("appointment.status.confirmed"),
        icon: "checkmark-circle",
      },
      PENDING: {
        color: "#F59E0B",
        bgColor: "#FFFBEB",
        text: t("appointment.status.pending"),
        icon: "time",
      },
      CANCELLED: {
        color: "#EF4444",
        bgColor: "#FEF2F2",
        text: t("appointment.status.cancelled"),
        icon: "close-circle",
      },
      COMPLETED: {
        color: "#10B981",
        bgColor: "#ECFDF5",
        text: t("appointment.status.completed"),
        icon: "checkmark-circle",
      },
      IN_PROGRESS: {
        color: "#3B82F6",
        bgColor: "#EFF6FF",
        text: t("appointment.status.inProgress"),
        icon: "checkmark-done-circle",
      },
    };
    return (
      configs[status] || {
        color: "#6B7280",
        bgColor: "#F9FAFB",
        text: status,
        icon: "help-circle",
      }
    );
  };

  const getHostTypeConfig = (hostType) => {
    const configs = {
      TEACHER: {
        text: t("appointment.host.teacher"),
        icon: "school-outline",
        color: "#8B5CF6",
      },
      COUNSELOR: {
        text: t("appointment.host.counselor"),
        icon: "person-outline",
        color: "#06B6D4",
      },
    };
    return (
      configs[hostType] || {
        text: hostType,
        icon: "person",
        color: GlobalStyles.colors.primary,
      }
    );
  };

  const canCancel = () => {
    if (!appointmentData || user?.role === "PARENTS") return false;

    const now = dayjs();
    const startTime = dayjs(appointmentData.startDateTime);
    const isFuture = startTime.isAfter(now);
    const canCancelStatus = ["CONFIRMED"].includes(appointmentData.status);

    return isFuture && canCancelStatus;
  };

  const canConfirmOrReject = () => {
    if (!appointmentData || user?.role === "PARENTS") return false;
    return appointmentData.status === "PENDING";
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
    if (user?.role === "PARENT" && user?.id === appointmentData.bookedBy?.id) {
      return false;
    }
    return true;
  };

  // Event handlers
  const handleCancelAppointment = () => setShowCancelModal(true);

  const handleConfirmAppointment = () => setShowConfirmModal(true);

  const handleRejectAppointment = () => setShowRejectModal(true);

  const handleConfirmAppointmentAction = async () => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointmentData.id, "CONFIRMED");

      Alert.alert(
        t("common.alerts.success"),
        t("appointment.success.confirmAppointment"),
        [
          {
            text: t("common.ok"),
            onPress: () => {
              try {
                setShowConfirmModal(false);
                navigation.goBack();
              } catch (error) {
                console.warn("Error after confirming appointment:", error);
                // Fallback navigation
                setTimeout(() => {
                  try {
                    navigation.goBack();
                  } catch (navError) {
                    console.warn("Fallback navigation failed:", navError);
                  }
                }, 100);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.warn("Error confirming appointment:", error);
      Alert.alert(
        t("common.alerts.error"),
        t("appointment.errors.confirmError"),
        [{ text: t("common.ok") }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointmentAction = async () => {
    try {
      setLoading(true);
      console.log("Rejecting appointment:", appointmentData.id);

      Alert.alert(
        t("common.alerts.success"),
        t("appointment.success.rejectAppointment"),
        [
          {
            text: t("common.ok"),
            onPress: () => {
              try {
                setShowRejectModal(false);
                navigation.goBack();
              } catch (error) {
                console.warn("Error after rejecting appointment:", error);
                // Fallback navigation
                setTimeout(() => {
                  try {
                    navigation.goBack();
                  } catch (navError) {
                    console.warn("Fallback navigation failed:", navError);
                  }
                }, 100);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.warn("Error rejecting appointment:", error);
      Alert.alert(
        t("common.alerts.error"),
        t("appointment.errors.rejectError"),
        [{ text: t("common.ok") }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setLoading(true);
      console.log(
        "Starting calendar cleanup for appointment:",
        appointmentData.id
      );

      // Kiểm tra và xóa event trong calendar
      let calendarResult = null;
      try {
        calendarResult = await removeEventFromCalendar(appointmentData.id);
        console.log("Calendar cleanup result:", calendarResult);
      } catch (calendarError) {
        console.warn("Calendar cleanup error:", calendarError);
        // Tạo kết quả mặc định nếu calendar có lỗi
        calendarResult = {
          success: false,
          message: "Calendar cleanup failed due to error",
        };
      }

      if (!calendarResult) {
        console.warn("Calendar cleanup returned null, using default result");
        calendarResult = {
          success: false,
          message: "Calendar cleanup returned null",
        };
      }

      if (!calendarResult.success) {
        console.warn("Calendar cleanup warning:", calendarResult.message);
        // Không dừng quá trình hủy hẹn nếu calendar có lỗi
      }
    } catch (error) {
      console.warn("Unexpected error during calendar cleanup:", error);
      // Không dừng quá trình hủy hẹn nếu có lỗi bất ngờ
    } finally {
      setLoading(false);
    }

    // Luôn đảm bảo modal được hiển thị
    try {
      setShowCancelModal(false);
      setShowReasonModal(true);
      console.log("Successfully showed reason modal");
    } catch (modalError) {
      console.warn("Error showing reason modal:", modalError);
      // Fallback: thử hiển thị modal một lần nữa
      setTimeout(() => {
        try {
          setShowCancelModal(false);
          setShowReasonModal(true);
        } catch (fallbackError) {
          console.warn("Fallback modal display failed:", fallbackError);
        }
      }, 100);
    }
  };

  const handleSelectReason = (reason) => {
    console.log("Selecting reason:", reason);
    setSelectedReason(reason);
    setCustomReason(reason === 0 ? "" : "");
    console.log("Selected reason set to:", reason);
    console.log("Custom reason reset to:", reason === 0 ? "" : "");

    // Validate button state after selection
    const isButtonDisabled =
      reason === null || (reason === 0 && !customReason.trim());
    console.log("Button should be disabled:", isButtonDisabled);
  };

  const handleSubmitCancel = async () => {
    console.log("Submit Reason - selectedReason:", selectedReason);
    console.log("Submit Reason - customReason:", customReason);
    console.log("Submit Reason - selectedReason type:", typeof selectedReason);

    const finalReason =
      selectedReason === 0
        ? customReason
        : cancelReasons.find((reason) => reason.id === selectedReason)?.title;

    console.log("Submit Reason - finalReason:", finalReason);
    console.log("Submit Reason - finalReason.trim():", finalReason?.trim());

    if (!finalReason || !finalReason.trim()) {
      console.log(
        "Submit Reason - Validation failed: no reason selected or empty"
      );
      Alert.alert(
        t("common.alerts.error"),
        t("appointment.errors.selectCancelReason")
      );
      return;
    }

    console.log(
      "Submit Reason - Validation passed, proceeding with cancellation"
    );
    setLoading(true);

    try {
      console.log("Final reason:", finalReason);

      // Hủy cuộc hẹn
      const result = await cancelAppointment(appointmentData.id, finalReason);
      console.log("Cancelling appointment with reason:", result);

      // Kiểm tra và xóa event trong calendar
      let calendarResult = null;
      try {
        calendarResult = await removeEventFromCalendar(appointmentData.id);
      } catch (calendarError) {
        console.warn("Calendar cleanup error in submit:", calendarError);
        calendarResult = {
          success: false,
          message: "Calendar cleanup failed",
        };
      }

      try {
        setShowReasonModal(false);
        setSelectedReason(null);
        setCustomReason("");
      } catch (modalError) {
        console.warn("Error hiding reason modal:", modalError);
      }

      // Hiển thị thông báo thành công với thông tin về calendar
      let message = t("appointment.cancelSuccess.message");

      if (
        calendarResult &&
        calendarResult.success &&
        calendarResult.message.includes("deleted successfully")
      ) {
        message += "\n\n" + t("appointment.cancelSuccess.calendarEventDeleted");
      } else if (
        calendarResult &&
        calendarResult.message &&
        calendarResult.message.includes("not synced")
      ) {
        message += "\n\n" + t("appointment.cancelSuccess.notSynced");
      } else if (calendarResult && !calendarResult.success) {
        message += "\n\n" + t("appointment.cancelSuccess.calendarDeletionNote");
      }

      Alert.alert(t("appointment.cancelSuccess.title"), message, [
        {
          text: t("common.ok"),
          onPress: () => {
            try {
              navigation.goBack();
            } catch (navError) {
              console.warn("Navigation error after cancel:", navError);
              // Fallback navigation
              setTimeout(() => {
                try {
                  navigation.goBack();
                } catch (fallbackNavError) {
                  console.warn("Fallback navigation failed:", fallbackNavError);
                }
              }, 100);
            }
          },
        },
      ]);
    } catch (error) {
      console.warn("Error cancelling appointment:", error);
      Alert.alert(
        t("common.alerts.error"),
        t("appointment.errors.cancelError"),
        [{ text: t("common.ok") }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <Container edges={["top", "bottom"]}>
        <Loading text={t("appointment.common.processing")} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container edges={["top", "bottom"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{t("appointment.details.error")}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              fetchAppointment();
            }}
          >
            <Text style={styles.retryButtonText}>
              {t("appointment.common.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  if (!appointmentData) {
    return (
      <Container edges={["top", "bottom"]}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="information-circle-outline"
            size={48}
            color="#6B7280"
          />
          <Text style={styles.errorText}>
            {t("appointment.common.appointmentNotFound")}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              fetchAppointment();
            }}
          >
            <Text style={styles.retryButtonText}>
              {t("appointment.common.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  // Check if bookFor and bookBy are the same person
  const isSamePerson = () => {
    if (!appointmentData.bookedFor || !appointmentData.bookedBy) return false;
    return appointmentData.bookedFor.id === appointmentData.bookedBy.id;
  };

  const statusConfig = getStatusConfig(appointmentData.status);
  const hostConfig = getHostTypeConfig(
    appointmentData.hostedBy?.roleName || appointmentData.slot?.roleName
  );

  const openMeet = async (url) => {
    try {
      console.log(url);

      if (!url) return;
      let appUrl = url;

      if (Platform.OS === "ios") {
        // iOS dùng meet://
        // Ví dụ: https://meet.google.com/abc-defg-hij  => meet://meet.google.com/abc-defg-hij
        appUrl = url.replace("https://", "meet://");
      } else {
        // Android dùng package name Google Meet
        appUrl = url.replace("https://", "com.google.android.apps.meetings://");
      }

      const supported = await Linking.canOpenURL(appUrl);
      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(url); // fallback sang browser
      }
    } catch (err) {
      console.error("Error opening Meet:", err);
    }
  };

  const disabledOpenMeet = () => {
    const currentDay = dayjs();
    const appointmentDate = dayjs(appointmentData.startDateTime);

    return !currentDay.isSame(appointmentDate, "day");
  };

  return (
    <Container edges={["top", "bottom"]}>
      {/* Header */}
      <HeaderWithoutTab
        title={t("appointment.details.title")}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={16}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>

          <View style={styles.appointmentTitle}>
            <Text style={styles.titleText}>
              {t("appointment.details.appointmentWith")}
            </Text>
            <Text style={styles.hostNameText}>
              {appointmentData.hostedBy?.fullName ||
                appointmentData.slot?.fullName}
            </Text>
          </View>
        </View>

        {/* Host Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="person-circle"
              size={20}
              color={GlobalStyles.colors.primary}
            />
            <Text style={styles.sectionTitle}>
              {t("appointment.details.hostInfo")}
            </Text>
          </View>

          <View style={styles.hostCard}>
            <LinearGradient
              colors={[hostConfig.color + "20", hostConfig.color + "10"]}
              style={styles.hostIconContainer}
            >
              <Ionicons
                name={hostConfig.icon}
                size={30}
                color={hostConfig.color}
              />
            </LinearGradient>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>
                {appointmentData.hostedBy?.fullName ||
                  appointmentData.slot?.fullName}
              </Text>
              <Text style={styles.hostType}>{hostConfig.text}</Text>
              <View style={styles.onlineStatus}>
                <View
                  style={[
                    styles.onlineDot,
                    {
                      backgroundColor: appointmentData.isOnline
                        ? "#10B981"
                        : "#6B7280",
                    },
                  ]}
                />
                <Text style={styles.onlineText}>
                  {appointmentData.isOnline
                    ? t("appointment.booking.online")
                    : t("appointment.booking.inPerson")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="calendar"
              size={20}
              color={GlobalStyles.colors.primary}
            />
            <Text style={styles.sectionTitle}>
              {t("appointment.details.appointmentInfo")}
            </Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {t("appointment.labels.date")}
                </Text>
                <Text style={styles.detailValue}>
                  {formatDate(appointmentData.startDateTime)}
                </Text>
                <Text style={styles.detailSubtext}>
                  {formatDayOfWeek(appointmentData.startDateTime)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {t("appointment.labels.time")}
                </Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(appointmentData.startDateTime)} -{" "}
                  {formatDateTime(appointmentData.endDateTime)}
                </Text>
                <Text style={styles.detailSubtext}>
                  {t("appointment.labels.durationMinutes", {
                    minutes: dayjs(appointmentData.endDateTime).diff(
                      dayjs(appointmentData.startDateTime),
                      "minute"
                    ),
                  })}
                </Text>
              </View>
            </View>

            {appointmentData.location && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#6B7280"
                    />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {t("appointment.labels.location")}
                    </Text>
                    {appointmentData?.isOnline ? (
                      <Button
                        mode="text"
                        labelStyle={{
                          fontSize: 14,
                        }}
                        textColor="#1a73e8"
                        onPress={() => openMeet(appointmentData?.location)}
                        disabled={disabledOpenMeet()}
                      >
                        {t("appointment.labels.joinMeeting")}
                      </Button>
                    ) : (
                      <Text style={styles.detailValue}>
                        {appointmentData.location}
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Booking Information - conditionally displayed */}
        {shouldShowBookedFor() && appointmentData.bookedFor && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="people"
                size={20}
                color={GlobalStyles.colors.primary}
              />
              <Text style={styles.sectionTitle}>
                {t("appointment.details.bookingInfo")}
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    {isSamePerson()
                      ? t("appointment.labels.bookedBy")
                      : t("appointment.labels.bookedFor")}
                  </Text>
                  <Text style={styles.detailValue}>
                    {isSamePerson()
                      ? appointmentData.bookedBy?.fullName
                      : appointmentData.bookedFor?.fullName}
                  </Text>
                </View>
              </View>

              {!isSamePerson() &&
                shouldShowBookedBy() &&
                appointmentData.bookedBy && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <Ionicons
                          name="people-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>
                          {t("appointment.labels.bookedBy")}
                        </Text>
                        <Text style={styles.detailValue}>
                          {appointmentData.bookedBy?.fullName}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
            </View>
          </View>
        )}

        {/* Show booked by only if booked for is not shown and we should show booked by */}
        {!shouldShowBookedFor() &&
          shouldShowBookedBy() &&
          appointment.bookedBy && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="people"
                  size={20}
                  color={GlobalStyles.colors.primary}
                />
                <Text style={styles.sectionTitle}>
                  {t("appointment.details.bookingInfo")}
                </Text>
              </View>

              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="people-outline" size={20} color="#6B7280" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {t("appointment.labels.bookedBy")}
                    </Text>
                    <Text style={styles.detailValue}>
                      {appointment.bookedBy?.fullName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

        {/* Reason */}
        {appointment.reasonBooking && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="chatbubble"
                size={20}
                color={GlobalStyles.colors.primary}
              />
              <Text style={styles.sectionTitle}>
                {t("appointment.labels.reason")}
              </Text>
            </View>

            <View style={styles.reasonCard}>
              <Text style={styles.reasonText}>{appointment.reasonBooking}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Warning Card - chỉ hiển thị khi không thể hủy lịch hẹn */}
      {!canCancel() && user?.role === "STUDENT" && (
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <Text style={styles.warningTitle}>
              {t("appointment.cannotCancel.title")}
            </Text>
          </View>
          <Text style={styles.warningText}>
            {appointment.status === "PENDING"
              ? t("appointment.cannotCancel.pending")
              : appointment.status === "CONFIRMED"
              ? t("appointment.cannotCancel.confirmed")
              : t("appointment.cannotCancel.default")}
          </Text>
        </View>
      )}

      {/* Action Button */}
      {canCancel() && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelAppointment}
          >
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.cancelButtonText}>
              {t("appointment.actions.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirm/Reject Buttons for PENDING status */}
      {canConfirmOrReject() && (
        <View style={styles.actionContainer}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleRejectAppointment}
            >
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.rejectButtonText}>
                {t("appointment.actions.reject")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmAppointment}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#10B981"
              />
              <Text style={styles.confirmButtonText}>
                {t("appointment.actions.confirm")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modals */}
      <ConfirmModal
        visible={showCancelModal}
        title={t("appointment.confirmModal.cancel.title")}
        message={t("appointment.confirmModal.cancel.message")}
        confirmText={t("appointment.confirmModal.cancel.confirmText")}
        cancelText={t("appointment.confirmModal.cancel.cancelTextKeep")}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          try {
            setShowCancelModal(false);
          } catch (error) {
            console.warn("Error hiding cancel modal:", error);
          }
        }}
        type="danger"
      />

      <ConfirmModal
        visible={showConfirmModal}
        title={t("appointment.confirmModal.confirm.title")}
        message={t("appointment.confirmModal.confirm.message")}
        confirmText={t("appointment.confirmModal.confirm.confirmText")}
        cancelText={t("appointment.confirmModal.confirm.cancelText")}
        onConfirm={handleConfirmAppointmentAction}
        onCancel={() => {
          try {
            setShowConfirmModal(false);
          } catch (error) {
            console.warn("Error hiding confirm modal:", error);
          }
        }}
        type="success"
      />

      <ConfirmModal
        visible={showRejectModal}
        title={t("appointment.actions.reject")}
        message={t("appointment.confirmModal.reject.message")}
        confirmText={t("appointment.actions.reject")}
        cancelText={t("common.cancel")}
        onConfirm={handleRejectAppointmentAction}
        onCancel={() => {
          try {
            setShowRejectModal(false);
          } catch (error) {
            console.warn("Error hiding reject modal:", error);
          }
        }}
        type="danger"
      />

      <Modal
        visible={showReasonModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          try {
            setShowReasonModal(false);
          } catch (error) {
            console.warn("Error hiding reason modal:", error);
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.reasonModal}>
            <View style={styles.reasonModalHeader}>
              <Text style={styles.reasonModalTitle}>
                {t("appointment.reasonModal.title")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  try {
                    setShowReasonModal(false);
                  } catch (error) {
                    console.warn("Error hiding reason modal:", error);
                  }
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.reasonList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {cancelReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason.id && styles.reasonItemSelected,
                  ]}
                  onPress={() => handleSelectReason(reason.id)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason.id && styles.reasonTextSelected,
                    ]}
                  >
                    {reason.title}
                  </Text>
                  {selectedReason === reason.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={GlobalStyles.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedReason === 0 && (
              <View style={styles.customReasonContainer}>
                <Text style={styles.customReasonLabel}>
                  {t("appointment.reasonModal.otherLabel")}
                </Text>
                <TextInput
                  style={styles.customReasonInput}
                  placeholder={t("appointment.reasonModal.placeholder")}
                  value={customReason}
                  onChangeText={(text) => {
                    console.log("Custom reason changed:", text);
                    setCustomReason(text);
                    // Validate button state after text change
                    const isButtonDisabled =
                      selectedReason === null ||
                      (selectedReason === 0 && !text.trim());
                    console.log(
                      "Button should be disabled after text change:",
                      isButtonDisabled
                    );
                  }}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>
            )}

            <View style={styles.reasonModalButtons}>
              <TouchableOpacity
                style={styles.reasonCancelButton}
                onPress={() => setShowReasonModal(false)}
              >
                <Text style={styles.reasonCancelButtonText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reasonSubmitButton,
                  (selectedReason === null ||
                    (selectedReason === 0 && !customReason.trim())) &&
                    styles.reasonSubmitButtonDisabled,
                ]}
                onPress={handleSubmitCancel}
                disabled={
                  selectedReason === null ||
                  (selectedReason === 0 && !customReason.trim())
                }
              >
                <Text style={styles.reasonSubmitButtonText}>
                  {t("common.confirm")}
                  {console.log(
                    "Button disabled state:",
                    selectedReason === null ||
                      (selectedReason === 0 && !customReason.trim())
                  )}
                  {console.log("selectedReason:", selectedReason)}
                  {console.log("customReason:", customReason)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  appointmentTitle: {
    alignItems: "center",
  },
  titleText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  hostNameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  hostIconContainer: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  hostType: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: "#6B7280",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    // flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 2,
  },
  detailSubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  reasonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reasonText: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 24,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  cancelButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  rejectButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  confirmButtonText: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: GlobalStyles.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  reasonModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: Platform.OS === "ios" ? "85%" : "90%",
    minHeight: Platform.OS === "ios" ? "50%" : "60%",
    width: "100%",
  },
  reasonModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  reasonModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  reasonList: {
    flex: 1,
    // maxHeight: Platform.OS === "ios" ? 200 : 250,
    paddingHorizontal: 0,
    backgroundColor: "#FFFFFF",
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  reasonItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  reasonText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
    marginRight: 10,
  },
  reasonTextSelected: {
    color: GlobalStyles.colors.primary,
    fontWeight: "600",
  },
  customReasonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  customReasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  customReasonInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 80,
    backgroundColor: "#FFFFFF",
    maxHeight: 120,
  },
  reasonModalButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  reasonCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  reasonCancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  reasonSubmitButton: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  reasonSubmitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  reasonSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  warningCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderLeftWidth: 5,
    borderLeftColor: "#F59E0B",
    marginVertical: 5,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
  },
  warningText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
});

export default AppointmentDetails;
