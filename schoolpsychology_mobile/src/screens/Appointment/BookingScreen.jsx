import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
} from "react-native";
import { Container, Loading } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts";
import { Dropdown, SlotDayCard } from "../../components";
import { getSlotsWithHostById } from "../../services/api/SlotService";
import {
  getAllCounselors,
  createAppointment,
} from "../../services/api/AppointmentService";
import { Toast } from "../../components";
import CalendarService from "../../services/CalendarService";
import dayjs from "dayjs";
import {
  processAndFilterSlots,
  getAvailableDaysWithTimeValidation,
  countTotalAvailableSlotsWithTimeValidation,
  hasAvailableSlots,
} from "../../utils/slotUtils";
import { ActivityIndicator } from "react-native-paper";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useServerErrorHandler } from "../../utils/hooks";

// Constants
const VISIBLE_DAYS = 2;
const VN_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";

// Custom hook for toast management
const useToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const showToastMessage = useCallback((message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  const hideToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    showToast,
    toastMessage,
    toastType,
    showToastMessage,
    hideToast,
  };
};

// Custom hook for booking state management
const useBookingState = (user) => {
  const [hostType, setHostType] = useState(null);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);
  const [bookedForId, setBookedForId] = useState(null);

  const [selectedBookedFor, setSelectedBookedFor] = useState(() => ({
    id: user?.id,
    fullName: user?.fullName,
    gender: user?.gender,
    dob: user?.dob,
    teacherId: user?.teacherId,
  }));

  // Reset booking state
  const resetBookingState = useCallback(() => {
    setHostType(null);
    setSelectedCounselor(null);
    setSelectedSlot(null);
    setIsOnline(false);
    setReason("");
  }, []);

  // Update selected child and related state
  const updateSelectedChild = useCallback(
    (child) => {
      setSelectedChild(child);
      setBookedForId(child?.userId);
      setSelectedBookedFor({
        id: child?.userId,
        fullName: child?.fullName,
        gender: child?.gender,
        dob: child?.dob,
        teacherId: child?.teacherId,
      });
      resetBookingState();
    },
    [resetBookingState]
  );

  // Update selectedBookedFor when user changes
  const updateSelectedBookedFor = useCallback((userData) => {
    setSelectedBookedFor({
      id: userData?.id,
      fullName: userData?.fullName,
      gender: userData?.gender,
      dob: userData?.dob,
      teacherId: userData?.teacherId,
    });
    setBookedForId(userData?.id);
  }, []);

  return {
    hostType,
    setHostType,
    selectedCounselor,
    setSelectedCounselor,
    selectedSlot,
    setSelectedSlot,
    isOnline,
    setIsOnline,
    reason,
    setReason,
    selectedChild,
    setSelectedChild,
    bookedForId,
    setBookedForId,
    selectedBookedFor,
    setSelectedBookedFor: updateSelectedBookedFor,
    resetBookingState,
    updateSelectedChild,
  };
};

// Custom hook for slots management
const useSlotsManagement = (
  hostType,
  selectedCounselor,
  selectedBookedFor,
  showToastMessage,
  setSelectedSlot
) => {
  const [groupedSlots, setGroupedSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [visibleDays, setVisibleDays] = useState(VISIBLE_DAYS);
  const [loadingMoreDays, setLoadingMoreDays] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (!hostType) return;

    // Get hostId based on host type
    let hostId = null;
    if (hostType.value === "TEACHER") {
      hostId = selectedBookedFor?.teacherId;
      if (!hostId) {
        showToastMessage(
          "Không thể đặt lịch với giáo viên chủ nhiệm vì học sinh chưa được phân công",
          "warning"
        );
        return;
      }
    } else if (hostType.value === "COUNSELOR") {
      hostId = selectedCounselor?.id;
      if (!hostId) {
        // Don't show error for counselor, just return early
        return;
      }
    }

    // Only fetch if we have a valid hostId
    if (!hostId) return;

    setLoadingSlots(true);
    setSelectedSlot(null);

    try {
      const response = await getSlotsWithHostById(hostId);
      const slotsData = Array.isArray(response)
        ? response
        : response.data || [];
      const processedGrouped = processAndFilterSlots(slotsData);
      setGroupedSlots(processedGrouped);
    } catch (error) {
      console.error("Lỗi khi tải danh sách slot:", error);
      showToastMessage("Không thể tải danh sách lịch hẹn", "error");
      setGroupedSlots({});
      setVisibleDays(VISIBLE_DAYS);
    } finally {
      setLoadingSlots(false);
    }
  }, [
    hostType,
    selectedCounselor,
    selectedBookedFor?.teacherId,
    showToastMessage,
    setSelectedSlot,
  ]);

  const loadMoreDays = useCallback(async () => {
    const availableDays = getAvailableDaysWithTimeValidation(groupedSlots);
    if (loadingMoreDays || visibleDays >= availableDays.length) return;

    setLoadingMoreDays(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setVisibleDays((prev) => Math.min(prev + 2, availableDays.length));
    setLoadingMoreDays(false);
  }, [loadingMoreDays, visibleDays, groupedSlots]);

  const resetSlots = useCallback(() => {
    setGroupedSlots({});
    setVisibleDays(VISIBLE_DAYS);
    setSelectedSlot(null);
  }, [setSelectedSlot]);

  return {
    groupedSlots,
    loadingSlots,
    visibleDays,
    loadingMoreDays,
    fetchSlots,
    loadMoreDays,
    resetSlots,
  };
};

// Custom hook for counselors management
const useCounselorsManagement = (hostType, showToastMessage) => {
  const [counselors, setCounselors] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(false);

  const fetchCounselors = useCallback(async () => {
    if (hostType?.value !== "COUNSELOR") return;

    setLoadingCounselors(true);
    try {
      const response = await getAllCounselors();
      const counselorsData = Array.isArray(response)
        ? response
        : response.data || [];

      const mappedCounselors = counselorsData.map((counselor) => ({
        ...counselor,
        label: `${counselor.counselorCode} - ${counselor.fullName} - ${
          counselor.gender === true ? "Nam" : "Nữ"
        }`,
        name: counselor.fullName,
      }));

      setCounselors(mappedCounselors);
      return mappedCounselors[0]; // Return first counselor for auto-selection
    } catch (error) {
      console.error("Lỗi khi tải danh sách tư vấn viên:", error);
      showToastMessage("Không thể tải danh sách tư vấn viên", "error");
      return null;
    } finally {
      setLoadingCounselors(false);
    }
  }, [hostType, showToastMessage]);

  return {
    counselors,
    loadingCounselors,
    fetchCounselors,
  };
};

// Custom hook for calendar management
const useCalendarManagement = () => {
  const [calendarSettings, setCalendarSettings] = useState({
    syncEnabled: false,
    autoSync: false,
    reminderEnabled: false,
    reminderTime: 15,
  });

  useEffect(() => {
    const loadCalendarSettings = async () => {
      try {
        await CalendarService.initialize();
        const settings = CalendarService.getSettings();
        setCalendarSettings(settings);
      } catch (error) {
        console.error("Error loading calendar settings:", error);
      }
    };

    loadCalendarSettings();
  }, []);

  return { calendarSettings };
};

// Utility functions
const formatReminderTime = (minutes) => {
  if (minutes < 60) return `${minutes} phút`;
  if (minutes === 60) return "1 giờ";
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes === 0
      ? `${hours} giờ`
      : `${hours} giờ ${remainingMinutes} phút`;
  }
  const days = Math.floor(minutes / 1440);
  const remainingHours = Math.floor((minutes % 1440) / 60);
  return remainingHours === 0
    ? `${days} ngày`
    : `${days} ngày ${remainingHours} giờ`;
};

const createBookingData = (
  selectedSlot,
  isOnline,
  reason,
  user,
  selectedChild
) => ({
  slotId: selectedSlot.id,
  bookedForId: user?.role === "PARENTS" ? selectedChild?.userId : user?.userId,
  isOnline,
  startDateTime: dayjs(selectedSlot.selectedStartTime).format(VN_FORMAT),
  endDateTime: dayjs(selectedSlot.selectedEndTime).format(VN_FORMAT),
  reasonBooking: reason || "Không có lý do",
});

const createConfirmationMessage = (
  hostType,
  selectedCounselor,
  selectedChild,
  selectedSlot,
  isOnline,
  reason,
  calendarSettings
) => {
  let message = `Xác nhận thông tin lịch hẹn:

• Người tư vấn: ${
    hostType?.value === "TEACHER"
      ? "Giáo viên chủ nhiệm"
      : selectedCounselor?.name || "Tư vấn viên"
  }
${selectedChild && `• Học sinh: ${selectedChild.fullName}`}
• Ngày: ${dayjs(selectedSlot.startDateTime).format("dddd, DD/MM/YYYY")}
• Thời gian: ${
    dayjs(selectedSlot.selectedStartTime || selectedSlot.startDateTime).format(
      "HH:mm"
    ) +
    " - " +
    dayjs(selectedSlot.selectedEndTime || selectedSlot.endDateTime).format(
      "HH:mm"
    )
  }
• Hình thức: ${isOnline ? "Trực tuyến" : "Trực tiếp"}
• Lý do: ${reason || "Không có lý do"}`;

  if (calendarSettings.autoSync && CalendarService.isSyncEnabled()) {
    message += `\n\n📅 Đồng bộ lịch: Sẽ được thêm vào calendar`;
    if (calendarSettings.reminderEnabled) {
      message += `\n⏰ Nhắc nhở: ${formatReminderTime(
        calendarSettings.reminderTime
      )} trước`;
    }
  }

  return message + `\n\nBạn có chắc chắn muốn đặt lịch hẹn này?`;
};

// Main component
const BookingScreen = ({ navigation }) => {
  const { user } = useAuth();

  // Custom hooks
  const toast = useToast();
  const bookingState = useBookingState(user);
  const slotsManagement = useSlotsManagement(
    bookingState.hostType,
    bookingState.selectedCounselor,
    bookingState.selectedBookedFor,
    toast.showToastMessage,
    bookingState.setSelectedSlot
  );
  const counselorsManagement = useCounselorsManagement(
    bookingState.hostType,
    toast.showToastMessage
  );
  const calendarManagement = useCalendarManagement();
  const { handleServerError, showToast, toastMessage, toastType, hideToast } =
    useServerErrorHandler();

  // Local state
  const [bookingLoading, setBookingLoading] = useState(false);

  // Computed values
  const hostTypeOptions = useMemo(
    () => [
      {
        id: "teacher",
        label: "Giáo viên chủ nhiệm",
        value: "TEACHER",
        disabled: !bookingState.selectedBookedFor?.teacherId,
      },
      { id: "counselor", label: "Tư vấn viên", value: "COUNSELOR" },
    ],
    [bookingState.selectedBookedFor?.teacherId]
  );

  const canBook = bookingState.selectedSlot && !bookingLoading;

  // Event handlers
  const handleHostTypeSelect = useCallback(
    async (type) => {
      if (type.disabled) {
        toast.showToastMessage("Tùy chọn này không khả dụng", "warning");
        return;
      }
      bookingState.setHostType(type);
      bookingState.setSelectedCounselor(null);
      bookingState.setSelectedSlot(null);
      type.value !== "TEACHER" && slotsManagement.resetSlots();
    },
    [
      bookingState.setHostType,
      bookingState.setSelectedCounselor,
      bookingState.setSelectedSlot,
      slotsManagement.resetSlots,
      toast.showToastMessage,
    ]
  );

  const handleCounselorSelect = useCallback(
    (counselor) => {
      bookingState.setSelectedCounselor(counselor);
      bookingState.setSelectedSlot(null);
      slotsManagement.resetSlots();
    },
    [
      bookingState.setSelectedCounselor,
      bookingState.setSelectedSlot,
      slotsManagement.resetSlots,
    ]
  );

  const handleSlotSelect = useCallback(
    (slot) => {
      bookingState.setSelectedSlot(slot);
    },
    [bookingState.setSelectedSlot]
  );

  const handleChildSelect = useCallback(
    (child) => {
      bookingState.updateSelectedChild(child);
      slotsManagement.resetSlots();
    },
    [bookingState.updateSelectedChild, slotsManagement.resetSlots]
  );

  const handleBooking = useCallback(async () => {
    if (!bookingState.selectedSlot) {
      toast.showToastMessage("Vui lòng chọn một lịch hẹn", "warning");
      return;
    }

    const confirmationMessage = createConfirmationMessage(
      bookingState.hostType,
      bookingState.selectedCounselor,
      bookingState.selectedChild,
      bookingState.selectedSlot,
      bookingState.isOnline,
      bookingState.reason,
      calendarManagement.calendarSettings
    );

    Alert.alert("Xác nhận đặt lịch", confirmationMessage, [
      { text: "Hủy", style: "destructive" },
      {
        text: "Đặt lịch",
        onPress: async () => {
          setBookingLoading(true);
          try {
            const bookingData = createBookingData(
              bookingState.selectedSlot,
              bookingState.isOnline,
              bookingState.reason,
              user,
              bookingState.selectedChild
            );

            console.log("bookingData", bookingData);

            const response = await createAppointment(bookingData);

            // Handle calendar sync
            if (
              calendarManagement.calendarSettings.autoSync &&
              CalendarService.isSyncEnabled()
            ) {
              try {
                const syncResult = await CalendarService.syncEvent(
                  "appointment",
                  [response]
                );
                if (syncResult.success) {
                  Alert.alert("Đã đồng bộ lịch");
                } else {
                  Alert.alert("Không thể đồng bộ lịch");
                }
              } catch (error) {
                Alert.alert("Không thể đồng bộ lịch");
                console.error("Error syncing appointment to calendar:", error);
              }
            }

            setTimeout(() => {
              navigation.navigate("StatusScreen", {
                title: "Đặt lịch hẹn thành công",
                message: "Bạn đã đặt lịch hẹn thành công",
                response: response,
              });
            }, 1000);
          } catch (error) {
            console.error("Lỗi khi đặt lịch hẹn:", error);

            // Xử lý lỗi server
            if (
              error.response?.status >= 502 &&
              error.response?.status <= 504
            ) {
              handleServerError(error, true);
            } else {
              toast.showToastMessage(
                "Không thể đặt lịch hẹn. Vui lòng thử lại",
                "error"
              );
            }
          } finally {
            setBookingLoading(false);
          }
        },
      },
    ]);
  }, [
    bookingState.selectedSlot,
    bookingState.hostType,
    bookingState.selectedCounselor,
    bookingState.selectedChild,
    bookingState.isOnline,
    bookingState.reason,
    calendarManagement.calendarSettings,
    user,
    navigation,
    toast.showToastMessage,
    handleServerError,
  ]);

  const handleBackPress = useCallback(() => {
    Alert.alert(
      "Thông báo",
      "Bạn có chắc chắn muốn thoát không? Tất cả dữ liệu sẽ bị mất",
      [
        { text: "Hủy", style: "destructive" },
        { text: "Đồng ý", onPress: () => navigation.goBack() },
      ]
    );
  }, [navigation]);

  // Load child from global variable
  useEffect(() => {
    if (global.selectedChildForAppointment) {
      if (user?.role === "PARENTS") {
        bookingState.updateSelectedChild(global.selectedChildForAppointment);
      } else {
        bookingState.updateSelectedBookedFor(user);
      }
      global.selectedChildForAppointment = null;
    }
  }, [
    user,
    bookingState.updateSelectedChild,
    bookingState.updateSelectedBookedFor,
  ]);

  // Auto-select counselor when teacherId is null
  useEffect(() => {
    if (
      bookingState.selectedBookedFor &&
      !bookingState.selectedBookedFor.teacherId
    ) {
      // Tự động chọn tư vấn viên khi không có teacher
      const counselorOption = hostTypeOptions.find(
        (option) => option.id === "counselor"
      );
      if (counselorOption && !bookingState.hostType) {
        handleHostTypeSelect(counselorOption);
      }
    }
  }, [
    bookingState.selectedBookedFor?.teacherId,
    hostTypeOptions,
    bookingState.hostType,
    handleHostTypeSelect,
  ]);

  // Auto-fetch counselors when host type is counselor
  useEffect(() => {
    if (bookingState.hostType?.value === "COUNSELOR") {
      counselorsManagement.fetchCounselors().then((firstCounselor) => {
        if (firstCounselor && !bookingState.selectedCounselor) {
          bookingState.setSelectedCounselor(firstCounselor);
        }
      });
    }
  }, [
    bookingState.hostType?.value,
    counselorsManagement.fetchCounselors,
    bookingState.selectedCounselor,
    bookingState.setSelectedCounselor,
  ]);

  // Auto-fetch slots when host type or counselor changes
  useEffect(() => {
    if (bookingState.hostType) {
      slotsManagement.fetchSlots();
    }
  }, [
    bookingState.hostType,
    bookingState.selectedCounselor?.id,
    bookingState.selectedBookedFor?.teacherId,
    slotsManagement.fetchSlots,
  ]);

  // Reset form on focus
  useFocusEffect(
    useCallback(() => {
      const resetFormState = () => {
        bookingState.resetBookingState();
        slotsManagement.resetSlots();
        toast.hideToast();

        if (!global.selectedChildForAppointment) {
          bookingState.setSelectedChild(null);
          bookingState.setBookedForId(user?.id || null);
        }
      };

      const timeoutId = setTimeout(resetFormState, 100);
      return () => clearTimeout(timeoutId);
    }, [
      user?.id,
      bookingState.resetBookingState,
      bookingState.setSelectedChild,
      bookingState.setBookedForId,
      slotsManagement.resetSlots,
      toast.hideToast,
    ])
  );

  // Render helpers
  const renderWarningCard = useCallback(() => {
    if (bookingState.selectedBookedFor?.teacherId) return null;

    return (
      <View style={styles.warningCard}>
        <View style={styles.warningHeader}>
          <Ionicons name="warning" size={24} color="#F59E0B" />
          <Text style={styles.warningTitle}>Thông báo quan trọng</Text>
        </View>
        <Text style={styles.warningText}>
          Học sinh này chưa được phân công giáo viên chủ nhiệm. Vui lòng chọn tư
          vấn viên để đặt lịch hẹn.
        </Text>
      </View>
    );
  }, [bookingState.selectedBookedFor?.teacherId]);

  const renderChildSelection = useCallback(() => {
    if (
      user?.role !== "PARENTS" ||
      !user?.children ||
      user.children.length <= 1
    ) {
      return null;
    }

    return (
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
            value={bookingState.selectedChild?.userId}
            onSelect={handleChildSelect}
          />
        </View>
        {bookingState.selectedChild && (
          <View style={styles.selectedChildIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.selectedChildText}>
              Đã chọn: {bookingState.selectedChild.fullName}
            </Text>
          </View>
        )}
      </View>
    );
  }, [
    user?.role,
    user?.children,
    bookingState.selectedChild,
    handleChildSelect,
  ]);

  const renderHostSelection = useCallback(
    () => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn người tư vấn</Text>
        <View style={styles.radioGroup}>
          {hostTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.radioOption,
                bookingState.hostType?.id === option.id &&
                  styles.radioOptionSelected,
                option.disabled && styles.radioOptionDisabled,
              ]}
              onPress={() => !option.disabled && handleHostTypeSelect(option)}
              disabled={option.disabled}
            >
              <View
                style={[
                  styles.radioButton,
                  bookingState.hostType?.id === option.id &&
                    styles.radioButtonSelected,
                  option.disabled && styles.radioButtonDisabled,
                ]}
              >
                {bookingState.hostType?.id === option.id &&
                  !option.disabled && <View style={styles.radioButtonInner} />}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  bookingState.hostType?.id === option.id &&
                    styles.radioLabelSelected,
                  option.disabled && styles.radioLabelDisabled,
                ]}
              >
                {option.label}
                {option.disabled && " (Không khả dụng)"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ),
    [hostTypeOptions, bookingState.hostType, handleHostTypeSelect]
  );

  const renderCounselorSelection = useCallback(() => {
    if (bookingState.hostType?.value !== "COUNSELOR") return null;

    return (
      <View style={styles.section}>
        <Dropdown
          label="Chọn tư vấn viên"
          placeholder="Chọn tư vấn viên"
          data={counselorsManagement.counselors}
          value={bookingState.selectedCounselor?.id}
          key={bookingState.selectedCounselor?.id}
          onSelect={handleCounselorSelect}
          loading={counselorsManagement.loadingCounselors}
        />
      </View>
    );
  }, [
    bookingState.hostType?.value,
    counselorsManagement.counselors,
    bookingState.selectedCounselor?.id,
    counselorsManagement.loadingCounselors,
    handleCounselorSelect,
  ]);

  const renderAppointmentDetails = useCallback(() => {
    if (
      !bookingState.hostType ||
      (bookingState.hostType.value !== "TEACHER" &&
        !bookingState.selectedCounselor)
    ) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.inputLabel}>Hình thức tư vấn</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {bookingState.isOnline ? "Trực tuyến" : "Trực tiếp"}
            </Text>
            <Switch
              value={bookingState.isOnline}
              onValueChange={bookingState.setIsOnline}
              trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputLabelContainer}>
            <Text style={styles.inputLabel}>Lý do tư vấn</Text>
            <Text style={styles.optionalText}>(Tùy chọn)</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Nhập lý do tư vấn (VD: Tư vấn học tập, Tư vấn tâm lý...)"
            value={bookingState.reason}
            onChangeText={bookingState.setReason}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>
    );
  }, [
    bookingState.hostType,
    bookingState.selectedCounselor,
    bookingState.isOnline,
    bookingState.reason,
    bookingState.setIsOnline,
    bookingState.setReason,
  ]);

  const renderSlotsSection = useCallback(() => {
    const { hostType, selectedCounselor } = bookingState;
    const {
      groupedSlots,
      loadingSlots,
      visibleDays,
      loadingMoreDays,
      loadMoreDays,
    } = slotsManagement;

    if (!hostType || (hostType.value !== "TEACHER" && !selectedCounselor)) {
      return null;
    }

    const availableDays = getAvailableDaysWithTimeValidation(groupedSlots);
    const totalSlots = countTotalAvailableSlotsWithTimeValidation(groupedSlots);
    const hasSlots = Object.keys(groupedSlots).length > 0;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Lịch hẹn khả dụng
            {loadingSlots && (
              <Text style={styles.loadingText}> (Đang tải...)</Text>
            )}
          </Text>
          {hasSlots && (
            <View style={styles.slotsOverview}>
              <Text style={styles.slotsOverviewText}>
                {availableDays.length} ngày • {totalSlots} khung giờ khả dụng
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
            {availableDays.slice(0, visibleDays).map((date) => (
              <SlotDayCard
                key={date}
                daySlots={groupedSlots[date]}
                selectedSlot={bookingState.selectedSlot}
                onSelectSlot={handleSlotSelect}
                disabled={false}
              />
            ))}

            {visibleDays < availableDays.length && (
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
                      Tải thêm {Math.min(2, availableDays.length - visibleDays)}{" "}
                      ngày
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.daysInfoContainer}>
              <Text style={styles.daysInfoText}>
                Hiển thị {Math.min(visibleDays, availableDays.length)} trong
                tổng số {availableDays.length} ngày khả dụng
              </Text>
              {visibleDays < availableDays.length && (
                <Text style={styles.lazyLoadHint}>Nhấn nút để xem thêm</Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }, [
    bookingState.hostType,
    bookingState.selectedCounselor,
    bookingState.selectedSlot,
    slotsManagement,
    handleSlotSelect,
  ]);

  const renderBookingSummary = useCallback(() => {
    const { selectedSlot, hostType, selectedCounselor, isOnline, reason } =
      bookingState;

    if (!selectedSlot) return null;

    const counselorName =
      hostType?.value === "TEACHER"
        ? selectedSlot.fullName || "Giáo viên chủ nhiệm"
        : selectedCounselor?.name || "Tư vấn viên";

    const startTime = dayjs(
      selectedSlot.selectedStartTime || selectedSlot.startDateTime
    ).format("HH:mm");
    const endTime = dayjs(
      selectedSlot.selectedEndTime || selectedSlot.endDateTime
    ).format("HH:mm");
    const date = dayjs(selectedSlot.startDateTime).format("dddd, DD/MM/YYYY");

    return (
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Thông tin lịch hẹn</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text style={styles.summaryLabel}>Người tư vấn:</Text>
            <Text style={styles.summaryValue}>{counselorName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.summaryLabel}>Ngày:</Text>
            <Text style={styles.summaryValue}>{date}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.summaryLabel}>Thời gian:</Text>
            <Text style={styles.summaryValue}>
              {startTime} - {endTime}
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
    );
  }, [
    bookingState.selectedSlot,
    bookingState.hostType,
    bookingState.selectedCounselor,
    bookingState.isOnline,
    bookingState.reason,
  ]);

  const renderCalendarSyncInfo = useCallback(() => {
    const { calendarSettings } = calendarManagement;

    if (!calendarSettings.autoSync || !CalendarService.isSyncEnabled()) {
      return null;
    }

    return (
      <View style={[styles.section, { marginBottom: 5 }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Đồng bộ lịch</Text>
        </View>
        <View style={styles.calendarInfoContainer}>
          <View style={styles.calendarInfoRow}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.calendarInfoText}>
              Lịch hẹn sẽ được thêm vào calendar của bạn
            </Text>
          </View>
          {calendarSettings.reminderEnabled && (
            <View style={styles.calendarInfoRow}>
              <Ionicons name="alarm" size={16} color="#F59E0B" />
              <Text style={styles.calendarInfoText}>
                Nhắc nhở {formatReminderTime(calendarSettings.reminderTime)}{" "}
                trước
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }, [calendarManagement.calendarSettings]);

  return (
    <Container>
      <HeaderWithoutTab title="Đặt lịch tư vấn" onBackPress={handleBackPress} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderWarningCard()}
        {renderChildSelection()}
        {renderHostSelection()}
        {renderCounselorSelection()}
        {renderAppointmentDetails()}
        {renderSlotsSection()}
        {renderBookingSummary()}
        {renderCalendarSyncInfo()}
      </ScrollView>

      {bookingState.hostType && (
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
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.bookingButtonText}>Đang đặt lịch...</Text>
              </>
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
        visible={toast.showToast}
        message={toast.toastMessage}
        type={toast.toastType}
        onDismiss={toast.hideToast}
      />

      {/* Server Error Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
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
  radioOptionDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    opacity: 0.6,
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
  radioButtonDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
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
  radioLabelDisabled: {
    color: "#9CA3AF",
    fontWeight: "400",
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
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  calendarInfoContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 12,
  },
  calendarInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  calendarInfoText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
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
  warningButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  warningButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default BookingScreen;
