import React, { useState, useCallback, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Dimensions,
  TextInput,
  Switch,
} from "react-native";
import { Container, Loading, Alert as AlertComponent } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts";
import Dropdown from "../../components/common/Dropdown";
import SlotDayCard from "../../components/common/SlotDayCard";
import {
  getSlotsForStudent,
  getSlotsWithHostById,
} from "../../services/api/SlotService";
import {
  getAllCounselors,
  createAppointment,
} from "../../services/api/AppointmentService";
import { Toast } from "../../components";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/vi";
import {
  processAndFilterSlots,
  getAvailableDaysWithTimeValidation,
  countTotalAvailableSlotsWithTimeValidation,
  hasAvailableSlots,
} from "../../utils/slotUtils";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.locale("vi");

const { width } = Dimensions.get("window");
const VISIBLE_DAYS = 2;
const VN_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";
const LOCALES = "vi-VN";

const BookingScreen = ({ navigation }) => {
  const { user } = useAuth();

  // State for host type selection (teacher/counselor)
  const [hostType, setHostType] = useState(null);

  // State for counselor selection
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(false);

  // State for slot selection
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [groupedSlots, setGroupedSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // State for lazy loading days
  const [visibleDays, setVisibleDays] = useState(VISIBLE_DAYS); // Show first 2 days initially
  const [loadingMoreDays, setLoadingMoreDays] = useState(false);

  // State for booking
  const [bookingLoading, setBookingLoading] = useState(false);

  // New fields for appointment request
  const [isOnline, setIsOnline] = useState(true);
  const [reason, setReason] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const [selectedChild, setSelectedChild] = useState(
    global.selectedChildForAppointment
  );

  // Get child from global variable or route params or use current user
  const childFromGlobal = global.selectedChildForAppointment;

  const [bookedForId, setBookedForId] = useState(
    childFromGlobal?.userId || user?.id || null
  );

  // Host type options
  const hostTypeOptions = [
    { id: "teacher", label: "Giáo viên chủ nhiệm", value: "teacher" },
    { id: "counselor", label: "Tư vấn viên", value: "counselor" },
  ];

  /**
   * Fetch counselors when host type is counselor
   * Lấy danh sách tư vấn viên và map data cho dropdown
   */
  const fetchCounselors = useCallback(async () => {
    if (hostType?.value !== "counselor") return;

    setLoadingCounselors(true);
    try {
      const response = await getAllCounselors();
      const counselorsData = Array.isArray(response)
        ? response
        : response.data || [];

      // Map data để phù hợp với Dropdown component
      // Format: "Mã - Tên - Giới tính"
      const mappedCounselors = counselorsData.map((counselor) => ({
        ...counselor,
        label: `${counselor.counselorCode} - ${counselor.fullName} - ${
          counselor.gender === true ? "Nam" : "Nữ"
        }`,
        name: counselor.fullName, // Fallback
      }));

      setCounselors(mappedCounselors);
      // Tự động chọn counselor đầu tiên
      setSelectedCounselor(mappedCounselors[0]);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tư vấn viên:", error);
      setToastMessage("Không thể tải danh sách tư vấn viên");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoadingCounselors(false);
    }
  }, [hostType, setToastMessage, setToastType, setShowToast]);

  const fetchSlots = useCallback(async () => {
    if (!hostType) return;

    setLoadingSlots(true);
    setSelectedSlot(null);

    try {
      let response;

      // Xác định API call dựa trên role và host type
      if (hostType.value === "teacher") {
        response = await getSlotsWithHostById(
          selectedChild?.teacherId || user?.teacherId
        );
      } else if (hostType.value === "counselor" && selectedCounselor) {
        response = await getSlotsWithHostById(selectedCounselor.id);
      } else {
        setSlots([]);
        setLoadingSlots(false);
        return;
      }

      // console.log("Slots response:", response);

      const slotsData = Array.isArray(response)
        ? response
        : response.data || [];
      setSlots(slotsData);

      // Process and filter slots by date with time validation
      const processedGrouped = processAndFilterSlots(slotsData);
      setGroupedSlots(processedGrouped);
    } catch (error) {
      console.error("Lỗi khi tải danh sách slot:", error);
      setToastMessage("Không thể tải danh sách lịch hẹn");
      setToastType("error");
      setShowToast(true);
      setSlots([]);
      setGroupedSlots({});
      setVisibleDays(VISIBLE_DAYS); // Reset to initial state
    } finally {
      setLoadingSlots(false);
    }
  }, [
    hostType,
    selectedCounselor,
    setToastMessage,
    setToastType,
    setShowToast,
  ]);

  // Handle host type selection
  const handleHostTypeSelect = async (type) => {
    setHostType(type);
    setSelectedCounselor(null);
    setSelectedSlot(null);
    setSlots([]);
    setGroupedSlots({});
    setVisibleDays(VISIBLE_DAYS); // Reset to initial state
  };

  // Handle counselor selection
  const handleCounselorSelect = (counselor) => {
    setSelectedCounselor(counselor);
    setSelectedSlot(null);
    setSlots([]);
    setGroupedSlots({});
    setVisibleDays(VISIBLE_DAYS); // Reset to initial state
  };

  // Get available days using utility function with time validation
  const getAvailableDaysCallback = useCallback(() => {
    return getAvailableDaysWithTimeValidation(groupedSlots);
  }, [groupedSlots]);

  // Load more days
  const loadMoreDays = useCallback(async () => {
    const availableDays = getAvailableDaysCallback();

    if (loadingMoreDays || visibleDays >= availableDays.length) return;

    setLoadingMoreDays(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setVisibleDays((prev) => Math.min(prev + 2, availableDays.length));
    setLoadingMoreDays(false);
  }, [loadingMoreDays, visibleDays, getAvailableDaysCallback]);

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  // Handle booking confirmation
  const handleBooking = async () => {
    if (!selectedSlot) {
      setToastMessage("Vui lòng chọn một lịch hẹn");
      setToastType("warning");
      setShowToast(true);
      return;
    }

    // Create confirmation message with all details
    const confirmationMessage = `Xác nhận thông tin lịch hẹn:

• Người tư vấn: ${
      hostType?.value === "teacher"
        ? "Giáo viên chủ nhiệm"
        : selectedCounselor?.name || "Tư vấn viên"
    }
• Ngày: ${dayjs(selectedSlot.startDateTime).format("dddd, DD/MM/YYYY")}
• Thời gian: ${
      dayjs(
        selectedSlot.selectedStartTime || selectedSlot.startDateTime
      ).format("HH:mm") +
      " - " +
      dayjs(selectedSlot.selectedEndTime || selectedSlot.endDateTime).format(
        "HH:mm"
      )
    }
• Hình thức: ${isOnline ? "Trực tuyến" : "Trực tiếp"}
• Lý do: ${reason || "Không có lý do"}

Bạn có chắc chắn muốn đặt lịch hẹn này?`;

    Alert.alert("Xác nhận đặt lịch", confirmationMessage, [
      {
        text: "Hủy",
        style: "destructive",
      },
      {
        text: "Đặt lịch",
        onPress: async () => {
          setBookingLoading(true);
          try {
            const bookingData = {
              slotId: selectedSlot.id,
              bookedForId: bookedForId,
              isOnline: isOnline,
              startDateTime: dayjs(selectedSlot.selectedStartTime).format(
                VN_FORMAT
              ),
              endDateTime: dayjs(selectedSlot.selectedEndTime).format(
                VN_FORMAT
              ),
              reason: reason || "Không có lý do",
            };

            await createAppointment(bookingData);

            // Navigate back or to appointment history
            navigation.navigate("StatusScreen", {
              title: "Đặt lịch hẹn thành công",
              message: "Bạn đã đặt lịch hẹn thành công",
              response: bookingData,
            });
          } catch (error) {
            console.error("Lỗi khi đặt lịch hẹn:", error);
            setToastMessage("Không thể đặt lịch hẹn. Vui lòng thử lại");
            setToastType("error");
            setShowToast(true);
          } finally {
            setBookingLoading(false);
          }
        },
      },
    ]);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchCounselors();
  }, [fetchCounselors]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Load child from global variable when component mounts
  useEffect(() => {
    if (global.selectedChildForAppointment) {
      // console.log(
      //   "Found child in global variable:",
      //   global.selectedChildForAppointment
      // );
      setBookedForId(global.selectedChildForAppointment.userId);

      // Clear the global variable after reading
      global.selectedChildForAppointment = null;
    }
  }, []);

  const handleBackPress = () => {
    Alert.alert(
      "Thông báo",
      "Bạn có chắc chắn muốn thoát không? Tất cả dữ liệu sẽ bị mất",
      [
        {
          text: "Hủy",
          style: "destructive",
        },
        {
          text: "Đồng ý",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const canBook = selectedSlot && !bookingLoading;

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch tư vấn</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Child Selection (if user is parent with multiple children) */}
        {user?.role === "PARENTS" &&
          user?.children &&
          user.children.length > 1 && (
            <View style={styles.section}>
              <View style={styles.dropdownContainer}>
                <Dropdown
                  label=""
                  placeholder="Chọn học sinh để đặt lịch"
                  data={user.children.map((child) => ({
                    ...child,
                    label: child.fullName,
                    value: child.userId,
                  }))}
                  value={selectedChild?.userId}
                  onSelect={(child) => {
                    setSelectedChild(child);
                    setBookedForId(child.userId);
                    // Reset other selections when child changes
                    setHostType(null);
                    setSelectedCounselor(null);
                    setSelectedSlot(null);
                    setSlots([]);
                    setGroupedSlots({});
                  }}
                />
              </View>
              {selectedChild && (
                <View style={styles.selectedChildIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.selectedChildText}>
                    Đã chọn: {selectedChild.fullName}
                  </Text>
                </View>
              )}
            </View>
          )}

        {/* Host Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn người tư vấn</Text>
          <View style={styles.radioGroup}>
            {hostTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.radioOption,
                  hostType?.id === option.id && styles.radioOptionSelected,
                ]}
                onPress={() => handleHostTypeSelect(option)}
              >
                <View
                  style={[
                    styles.radioButton,
                    hostType?.id === option.id && styles.radioButtonSelected,
                  ]}
                >
                  {hostType?.id === option.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    hostType?.id === option.id && styles.radioLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Counselor Selection (only if host type is counselor) */}
        {hostType?.value === "counselor" && (
          <View style={styles.section}>
            <Dropdown
              label="Chọn tư vấn viên"
              placeholder="Chọn tư vấn viên"
              data={counselors}
              value={selectedCounselor?.id}
              key={selectedCounselor?.id}
              onSelect={handleCounselorSelect}
              loading={loadingCounselors}
            />
          </View>
        )}

        {/* Appointment Details Section */}
        {hostType && (hostType.value === "teacher" || selectedCounselor) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>

            {/* Online/Offline Toggle */}
            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>Hình thức tư vấn</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {isOnline ? "Trực tuyến" : "Trực tiếp"}
                </Text>
                <Switch
                  value={isOnline}
                  onValueChange={setIsOnline}
                  trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                  thumbColor={isOnline ? "#FFFFFF" : "#FFFFFF"}
                />
              </View>
            </View>

            {/* Reason */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Lý do tư vấn</Text>
                <Text style={styles.optionalText}>(Tùy chọn)</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Nhập lý do tư vấn (VD: Tư vấn học tập, Tư vấn tâm lý...)"
                value={reason}
                onChangeText={setReason}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Slots Section */}
        {hostType && (hostType.value === "teacher" || selectedCounselor) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Lịch hẹn khả dụng
                {loadingSlots && (
                  <Text style={styles.loadingText}> (Đang tải...)</Text>
                )}
              </Text>
              {Object.keys(groupedSlots).length > 0 && (
                <View style={styles.slotsOverview}>
                  <Text style={styles.slotsOverviewText}>
                    {getAvailableDaysCallback().length} ngày •{" "}
                    {countTotalAvailableSlotsWithTimeValidation(groupedSlots)}{" "}
                    khung giờ khả dụng
                  </Text>
                </View>
              )}
            </View>

            {loadingSlots ? (
              <Loading text="Đang tải lịch hẹn..." />
            ) : !hasAvailableSlots(groupedSlots) ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>Không có lịch hẹn khả dụng</Text>
                <Text style={styles.emptySubtext}>
                  Vui lòng thử lại sau hoặc liên hệ để được hỗ trợ
                </Text>
              </View>
            ) : (
              <View style={styles.slotsContainer}>
                {getAvailableDaysCallback()
                  .slice(0, visibleDays)
                  .map((date) => (
                    <SlotDayCard
                      key={date}
                      daySlots={groupedSlots[date]}
                      selectedSlot={selectedSlot}
                      onSelectSlot={handleSlotSelect}
                      disabled={false}
                    />
                  ))}

                {/* Load More Days Button */}
                {(() => {
                  const availableDays = getAvailableDaysCallback();

                  return visibleDays < availableDays.length ? (
                    <TouchableOpacity
                      style={styles.loadMoreDaysButton}
                      onPress={loadMoreDays}
                      disabled={loadingMoreDays}
                    >
                      {loadingMoreDays ? (
                        <Loading text="Đang tải thêm ngày..." />
                      ) : (
                        <>
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color="#3B82F6"
                          />
                          <Text style={styles.loadMoreDaysText}>
                            Tải thêm{" "}
                            {Math.min(2, availableDays.length - visibleDays)}{" "}
                            ngày
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : null;
                })()}

                {/* Days Info */}
                <View style={styles.daysInfoContainer}>
                  {(() => {
                    const availableDays = getAvailableDaysCallback();

                    return (
                      <>
                        <Text style={styles.daysInfoText}>
                          Hiển thị {Math.min(visibleDays, availableDays.length)}{" "}
                          trong tổng số {availableDays.length} ngày khả dụng
                        </Text>
                        {visibleDays < availableDays.length && (
                          <Text style={styles.lazyLoadHint}>
                            Nhấn nút để xem thêm
                          </Text>
                        )}
                      </>
                    );
                  })()}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Booking Summary */}
        {selectedSlot && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Thông tin lịch hẹn</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <Text style={styles.summaryLabel}>Người tư vấn:</Text>
                <Text style={styles.summaryValue}>
                  {hostType?.value === "teacher"
                    ? selectedSlot.fullName || "Giáo viên chủ nhiệm"
                    : selectedCounselor?.name || "Tư vấn viên"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.summaryLabel}>Ngày:</Text>
                <Text style={styles.summaryValue}>
                  {dayjs(selectedSlot.startDateTime).format("dddd, DD/MM/YYYY")}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.summaryLabel}>Thời gian:</Text>
                <Text style={styles.summaryValue}>
                  {dayjs(
                    selectedSlot.selectedStartTime || selectedSlot.startDateTime
                  ).format("HH:mm")}{" "}
                  -{" "}
                  {dayjs(
                    selectedSlot.selectedEndTime || selectedSlot.endDateTime
                  ).format("HH:mm")}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons
                  name={isOnline ? "wifi-outline" : "business-outline"}
                  size={20}
                  color="#6B7280"
                />
                <Text style={styles.summaryLabel}>Hình thức:</Text>
                <Text style={styles.summaryValue}>
                  {isOnline ? "Trực tuyến" : "Trực tiếp"}
                </Text>
              </View>
              {reason && (
                <View style={styles.summaryRow}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#6B7280"
                  />
                  <Text style={styles.summaryLabel}>Lý do:</Text>
                  <Text style={styles.summaryValue}>{reason}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Booking Button */}
      {hostType && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.bookingButton,
              !canBook && styles.bookingButtonDisabled,
            ]}
            onPress={handleBooking}
            disabled={!canBook}
          >
            {bookingLoading ? (
              <Loading text="Đang đặt lịch..." />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.bookingButtonText}>Đặt lịch hẹn</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setShowToast(false)}
      />
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
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  slotsOverview: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  slotsOverviewText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  radioOptionSelected: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: "#3B82F6",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  radioLabel: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  radioLabelSelected: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  slotsContainer: {
    gap: 8,
  },
  loadMoreDaysButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
    gap: 8,
  },
  loadMoreDaysText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
  },
  daysInfoContainer: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  daysInfoText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  slotsCountText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
    marginTop: 4,
  },
  lazyLoadHint: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 4,
  },
  summarySection: {
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
  },
  // New styles for appointment details
  inputContainer: {
    marginBottom: 16,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  optionalText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  validationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  validationText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  bookingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  bookingButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  childInfoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  childAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  childHeaderInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  childSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  dropdownContainer: {
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  selectedChildIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 0,
    gap: 6,
  },
  selectedChildText: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
  },
  childInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  childInfoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    marginRight: 12,
    minWidth: 60,
    fontWeight: "500",
  },
  childInfoValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    flex: 1,
  },
  debugSection: {
    marginBottom: 24,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    alignItems: "center",
  },
  testButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default BookingScreen;
