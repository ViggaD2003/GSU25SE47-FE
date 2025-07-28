import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Container } from "../../components";
import { GlobalStyles } from "../../constants";
import Loading from "../../components/common/Loading";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  cancelAppointment,
  updateAppointmentStatus,
} from "@/services/api/AppointmentService";
import CalendarService from "@/services/CalendarService";
import { LinearGradient } from "expo-linear-gradient";

const AppointmentDetails = ({ route, navigation }) => {
  const { appointment } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Cancel reasons
  const cancelReasons = [
    "Có việc đột xuất",
    "Bị ốm",
    "Có lịch hẹn khác",
    "Thay đổi thời gian",
    "Khác",
  ];

  // Utility functions
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

  const removeEventFromCalendar = async (appointmentId) => {
    try {
      // Kiểm tra xem appointment có được sync với calendar không
      const isSynced = await CalendarService.isAppointmentAlreadySynced(
        appointmentId
      );

      if (!isSynced) {
        console.log(
          "Appointment not synced with calendar, skipping calendar deletion"
        );
        return {
          success: true,
          message: "Appointment not synced with calendar",
        };
      }

      // Lấy event ID từ mapping
      const eventId = await CalendarService.getEventIdForAppointment(
        appointmentId
      );

      if (!eventId) {
        console.log("No event ID found for appointment, removing mapping");
        await CalendarService.removeEventMapping(appointmentId);
        return { success: true, message: "No calendar event found" };
      }

      // Xóa event khỏi calendar
      const deleteSuccess = await CalendarService.deleteEvent(eventId);

      if (deleteSuccess) {
        // Xóa mapping sau khi xóa event thành công
        await CalendarService.removeEventMapping(appointmentId);
        return {
          success: true,
          message: "Calendar event deleted successfully",
        };
      } else {
        // Nếu xóa event thất bại, vẫn xóa mapping để tránh inconsistency
        await CalendarService.removeEventMapping(appointmentId);
        return { success: false, message: "Failed to delete calendar event" };
      }
    } catch (error) {
      console.error("Error removing event from calendar:", error);
      // Xóa mapping để tránh inconsistency
      await CalendarService.removeEventMapping(appointmentId);
      return { success: false, message: "Error removing calendar event" };
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      CONFIRMED: {
        color: "#10B981",
        bgColor: "#ECFDF5",
        text: "Đã xác nhận",
        icon: "checkmark-circle",
      },
      PENDING: {
        color: "#F59E0B",
        bgColor: "#FFFBEB",
        text: "Chờ xác nhận",
        icon: "time",
      },
      // CANCELLED: {
      //   color: "#EF4444",
      //   bgColor: "#FEF2F2",
      //   text: "Đã hủy",
      //   icon: "close-circle",
      // },
      IN_PROGRESS: {
        color: "#3B82F6",
        bgColor: "#EFF6FF",
        text: "Đang diễn ra",
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
        text: "Giáo viên",
        icon: "school-outline",
        color: "#8B5CF6",
      },
      COUNSELOR: {
        text: "Tư vấn viên",
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
    if (!appointment) return false;

    const now = dayjs();
    const startTime = dayjs(appointment.startDateTime);
    const isFuture = startTime.isAfter(now);
    const canCancelStatus = !["PENDING", "IN_PROGRESS"].includes(
      appointment.status
    );

    return isFuture && canCancelStatus;
  };

  const canConfirmOrReject = () => {
    if (!appointment) return false;
    return appointment.status === "PENDING";
  };

  // Event handlers
  const handleCancelAppointment = () => setShowCancelModal(true);

  const handleConfirmAppointment = () => setShowConfirmModal(true);

  const handleRejectAppointment = () => setShowRejectModal(true);

  const handleConfirmAppointmentAction = async () => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointment.id, "CONFIRMED");

      Alert.alert("Thành công", "Đã xác nhận lịch hẹn thành công!", [
        {
          text: "OK",
          onPress: () => {
            setShowConfirmModal(false);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      Alert.alert("Lỗi", "Không thể xác nhận lịch hẹn. Vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointmentAction = async () => {
    try {
      setLoading(true);
      console.log("Rejecting appointment:", appointment.id);

      Alert.alert("Thành công", "Đã từ chối lịch hẹn!", [
        {
          text: "OK",
          onPress: () => {
            setShowRejectModal(false);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      Alert.alert("Lỗi", "Không thể từ chối lịch hẹn. Vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setLoading(true);

      // Kiểm tra và xóa event trong calendar
      const calendarResult = await removeEventFromCalendar(appointment.id);

      if (!calendarResult.success) {
        console.warn("Calendar cleanup warning:", calendarResult.message);
        // Không dừng quá trình hủy hẹn nếu calendar có lỗi
      }
    } catch (error) {
      console.error("Error during calendar cleanup:", error);
      // Không dừng quá trình hủy hẹn nếu calendar có lỗi
    } finally {
      setLoading(false);
    }

    setShowCancelModal(false);
    setShowReasonModal(true);
  };

  const handleSelectReason = (reason) => {
    setSelectedReason(reason);
    setCustomReason(reason === "Khác" ? "" : reason);
  };

  const handleSubmitCancel = async () => {
    const finalReason =
      selectedReason === "Khác" ? customReason : selectedReason;

    if (!finalReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng chọn hoặc nhập lý do hủy hẹn");
      return;
    }

    setLoading(true);

    try {
      // Hủy cuộc hẹn
      const result = await cancelAppointment(appointment.id, finalReason);
      console.log("Cancelling appointment with reason:", result);

      // Kiểm tra và xóa event trong calendar
      const calendarResult = await removeEventFromCalendar(appointment.id);

      setShowReasonModal(false);
      setSelectedReason("");
      setCustomReason("");

      // Hiển thị thông báo thành công với thông tin về calendar
      let message = "Đã hủy lịch hẹn thành công!";

      if (
        calendarResult.success &&
        calendarResult.message.includes("deleted successfully")
      ) {
        message += "\n\n📅 Sự kiện đã được xóa khỏi lịch của bạn.";
      } else if (calendarResult.message.includes("not synced")) {
        message += "\n\n📅 Lịch hẹn này chưa được đồng bộ với lịch.";
      } else if (!calendarResult.success) {
        message +=
          "\n\n⚠️ Lưu ý: Không thể xóa sự kiện khỏi lịch. Bạn có thể xóa thủ công.";
      }

      Alert.alert("Thành công", message, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      Alert.alert("Lỗi", "Không thể hủy lịch hẹn. Vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <Container>
        <Loading text="Đang xử lý yêu cầu..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              /* TODO: Retry logic */
            }}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Ionicons
            name="information-circle-outline"
            size={48}
            color="#6B7280"
          />
          <Text style={styles.errorText}>
            Không tìm thấy thông tin lịch hẹn
          </Text>
        </View>
      </Container>
    );
  }

  // Check if bookFor and bookBy are the same person
  const isSamePerson = () => {
    if (!appointment.bookedFor || !appointment.bookedBy) return false;
    return appointment.bookedFor.id === appointment.bookedBy.id;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const hostConfig = getHostTypeConfig(appointment.slot?.roleName);

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết lịch hẹn</Text>
        <View style={styles.headerSpacer} />
      </View>

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
            <Text style={styles.titleText}>Lịch hẹn với</Text>
            <Text style={styles.hostNameText}>
              {appointment.slot?.fullName}
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
            <Text style={styles.sectionTitle}>Thông tin người hẹn</Text>
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
              <Text style={styles.hostName}>{appointment.slot?.fullName}</Text>
              <Text style={styles.hostType}>{hostConfig.text}</Text>
              <View style={styles.onlineStatus}>
                <View
                  style={[
                    styles.onlineDot,
                    {
                      backgroundColor: appointment.isOnline
                        ? "#10B981"
                        : "#6B7280",
                    },
                  ]}
                />
                <Text style={styles.onlineText}>
                  {appointment.isOnline ? "Trực tuyến" : "Trực tiếp"}
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
            <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Ngày hẹn</Text>
                <Text style={styles.detailValue}>
                  {formatDate(appointment.startDateTime)}
                </Text>
                <Text style={styles.detailSubtext}>
                  {formatDayOfWeek(appointment.startDateTime)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Thời gian</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(appointment.startDateTime)} -{" "}
                  {formatDateTime(appointment.endDateTime)}
                </Text>
                <Text style={styles.detailSubtext}>
                  Kéo dài{" "}
                  {dayjs(appointment.endDateTime).diff(
                    dayjs(appointment.startDateTime),
                    "minute"
                  )}{" "}
                  phút
                </Text>
              </View>
            </View>

            {appointment.location && (
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
                    <Text style={styles.detailLabel}>Địa điểm</Text>
                    <Text style={styles.detailValue}>
                      {appointment.location}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Booking Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="people"
              size={20}
              color={GlobalStyles.colors.primary}
            />
            <Text style={styles.sectionTitle}>Thông tin đặt hẹn</Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {isSamePerson() ? "Người đặt lịch" : "Đặt cho"}
                </Text>
                <Text style={styles.detailValue}>
                  {isSamePerson()
                    ? appointment.bookedBy?.fullName
                    : appointment.bookedFor?.fullName}
                </Text>
              </View>
            </View>

            {!isSamePerson() && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="people-outline" size={20} color="#6B7280" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Đặt bởi</Text>
                    <Text style={styles.detailValue}>
                      {appointment.bookedBy?.fullName}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Reason */}
        {appointment.reasonBooking && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="chatbubble"
                size={20}
                color={GlobalStyles.colors.primary}
              />
              <Text style={styles.sectionTitle}>Lý do hẹn</Text>
            </View>

            <View style={styles.reasonCard}>
              <Text style={styles.reasonText}>{appointment.reasonBooking}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      {canCancel() && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelAppointment}
          >
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Hủy lịch hẹn</Text>
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
              <Text style={styles.rejectButtonText}>Từ chối</Text>
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
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modals */}
      <ConfirmModal
        visible={showCancelModal}
        title="Hủy lịch hẹn"
        message={`Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.\n\n*Lưu ý: Nếu lịch hẹn đã được đồng bộ với lịch của bạn, sự kiện cũng sẽ được xóa khỏi lịch.`}
        confirmText="Hủy lịch hẹn"
        cancelText="Giữ lại"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
        type="danger"
      />

      <ConfirmModal
        visible={showConfirmModal}
        title="Xác nhận lịch hẹn"
        message="Bạn có chắc chắn muốn xác nhận lịch hẹn này không?"
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={handleConfirmAppointmentAction}
        onCancel={() => setShowConfirmModal(false)}
        type="success"
      />

      <ConfirmModal
        visible={showRejectModal}
        title="Từ chối lịch hẹn"
        message="Bạn có chắc chắn muốn từ chối lịch hẹn này không?"
        confirmText="Từ chối"
        cancelText="Hủy"
        onConfirm={handleRejectAppointmentAction}
        onCancel={() => setShowRejectModal(false)}
        type="danger"
      />

      <Modal
        visible={showReasonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReasonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reasonModal}>
            <View style={styles.reasonModalHeader}>
              <Text style={styles.reasonModalTitle}>Chọn lý do hủy hẹn</Text>
              <TouchableOpacity
                onPress={() => setShowReasonModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reasonList}>
              {cancelReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason && styles.reasonItemSelected,
                  ]}
                  onPress={() => handleSelectReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.reasonTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                  {selectedReason === reason && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={GlobalStyles.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedReason === "Khác" && (
              <View style={styles.customReasonContainer}>
                <Text style={styles.customReasonLabel}>Nhập lý do khác:</Text>
                <TextInput
                  style={styles.customReasonInput}
                  placeholder="Nhập lý do hủy hẹn..."
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            <View style={styles.reasonModalButtons}>
              <TouchableOpacity
                style={styles.reasonCancelButton}
                onPress={() => setShowReasonModal(false)}
              >
                <Text style={styles.reasonCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reasonSubmitButton,
                  (!selectedReason ||
                    (selectedReason === "Khác" && !customReason.trim())) &&
                    styles.reasonSubmitButtonDisabled,
                ]}
                onPress={handleSubmitCancel}
                disabled={
                  !selectedReason ||
                  (selectedReason === "Khác" && !customReason.trim())
                }
              >
                <Text style={styles.reasonSubmitButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    flex: 1,
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
    maxHeight: "80%",
  },
  reasonModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  reasonModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  reasonList: {
    maxHeight: 300,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  reasonItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  reasonTextSelected: {
    color: GlobalStyles.colors.primary,
    fontWeight: "600",
  },
  customReasonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
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
  },
  reasonModalButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
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
});

export default AppointmentDetails;
