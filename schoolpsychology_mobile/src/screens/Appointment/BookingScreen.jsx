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
import { ChildSelector, Container, Loading } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useChildren } from "../../contexts";
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
import { useTranslation } from "react-i18next";

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
  const userId = user?.id || user?.userId;
  const [hostType, setHostType] = useState(null);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [reason, setReason] = useState("");
  const [bookedForId, setBookedForId] = useState(userId);

  console.log("userId", user.id);

  // Add selectedChild state to the hook
  const [selectedBookedFor, setSelectedBookedFor] = useState({
    id: userId,
    fullName: user?.fullName,
    gender: user?.gender,
    dob: user?.dob,
    teacherId: user?.classDto?.teacher?.id,
  });

  // Reset booking state
  const resetBookingState = useCallback(() => {
    setHostType(null);
    setSelectedCounselor(null);
    setSelectedSlot(null);
    setIsOnline(false);
    setReason("");
    // Reset bookedForId based on current user role and selectedChild
    setBookedForId(userId);
  }, [userId]);

  // Update selected child and related state
  const updateSelectedChild = useCallback(
    (child) => {
      if (user?.role === "PARENTS" && child) {
        console.log("Updating for PARENTS role with child:", child);
        // For PARENTS: book for the selected child
        setBookedForId(child?.userId || child?.id);
        setSelectedBookedFor({
          id: child?.userId || child?.id,
          fullName: child.fullName,
          gender: child.gender,
          dob: child.dob,
          teacherId: child.classDto?.teacher?.id,
        });
      } else if (user?.role === "STUDENT") {
        console.log("Updating for STUDENT role");
        // For STUDENT: book for themselves
        setBookedForId(user?.id || user?.userId);
        setSelectedBookedFor({
          id: user?.id || user?.userId,
          fullName: user.fullName,
          gender: user.gender,
          dob: user.dob,
          teacherId: user.classDto?.teacher?.id,
        });
      }

      // Only reset form-specific state, not the bookedForId
      setHostType(null);
      setSelectedCounselor(null);
      setSelectedSlot(null);
      setIsOnline(false);
      setReason("");
    },
    [user?.role, user?.id]
  );

  // Update selectedBookedFor when user changes
  const updateSelectedBookedFor = useCallback(
    (userData) => {
      console.log("userdata");

      const userDataId = userData?.userId || userData?.id;
      setSelectedBookedFor({
        id: userDataId,
        fullName: userData?.fullName,
        gender: userData?.gender,
        dob: userData?.dob,
        teacherId: userData.classDto?.teacher?.id,
      });

      if (user?.role === "STUDENT") {
        // For STUDENT: use the user's id
        setBookedForId(userId);
      }
    },
    [user]
  );

  console.log("BookForId", bookedForId);

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
  setSelectedSlot,
  t
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
      console.warn("Lỗi khi tải danh sách slot:", error);
      showToastMessage(t("common.errorLoadData"), "error");
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
    t,
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
const useCounselorsManagement = (hostType, showToastMessage, t) => {
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
      console.warn("Lỗi khi tải danh sách tư vấn viên:", error);
      showToastMessage(t("common.errorLoadData"), "error");
      return null;
    } finally {
      setLoadingCounselors(false);
    }
  }, [hostType, showToastMessage, t]);

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
        console.warn("Error loading calendar settings:", error);
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
  selectedChild,
  hostType,
  t
) => {
  // Validate required parameters
  if (!selectedSlot || !user || !hostType) {
    console.warn("createBookingData: Missing required parameters", {
      selectedSlot: !!selectedSlot,
      user: !!user,
      hostType: !!hostType,
      selectedChild: !!selectedChild,
    });
    return null;
  }
  console.log(selectedChild);

  // Determine bookedForId based on user role
  let bookedForId;
  if (user?.role === "PARENTS") {
    bookedForId = selectedChild?.id || selectedChild?.userId;
  } else {
    bookedForId = user?.id;
  }

  // Validate bookedForId
  if (!bookedForId) {
    console.warn("createBookingData: No valid bookedForId found", {
      userRole: user?.role,
      selectedChildUserId: selectedChild?.userId,
      userId: user?.id,
    });
    return null;
  }

  return {
    slotId: selectedSlot.id,
    bookedForId: bookedForId,
    isOnline,
    startDateTime: dayjs(selectedSlot.selectedStartTime).format(VN_FORMAT),
    endDateTime: dayjs(selectedSlot.selectedEndTime).format(VN_FORMAT),
    reasonBooking: reason || t("appointment.booking.noReason"),
    hostType: hostType,
    caseId: user.caseId || null,
  };
};

const createConfirmationMessage = (
  hostType,
  selectedCounselor,
  selectedChild,
  selectedSlot,
  isOnline,
  reason,
  calendarSettings,
  t
) => {
  const messageParts = [
    `${t("appointment.booking.confirmation.title")}:\n`,
    `  • ${t("appointment.booking.confirmation.counselor")}: ${
      hostType?.value === "TEACHER"
        ? t("appointment.host.teacher")
        : selectedCounselor?.fullName || t("appointment.host.counselor")
    }`,
    selectedChild &&
      `  • ${t("appointment.booking.confirmation.student")}: ${
        selectedChild.fullName
      }`,
    `  • ${t("appointment.booking.confirmation.date")}: ${dayjs(
      selectedSlot.startDateTime
    ).format("dddd, DD/MM/YYYY")}`,
    `  • ${t("appointment.booking.confirmation.time")}: ${
      dayjs(
        selectedSlot.selectedStartTime || selectedSlot.startDateTime
      ).format("HH:mm") +
      " - " +
      dayjs(selectedSlot.selectedEndTime || selectedSlot.endDateTime).format(
        "HH:mm"
      )
    }`,
    `  • ${t("appointment.booking.confirmation.format")}: ${
      isOnline
        ? t("appointment.booking.online")
        : t("appointment.booking.offline")
    }`,
    `  • ${t("appointment.booking.confirmation.reason")}: ${
      reason || t("appointment.booking.noReason")
    }`,
  ];

  let message = messageParts.filter(Boolean).join("\n");

  // Thêm thông tin về calendar sync nếu có
  if (calendarSettings?.autoSync && CalendarService.isSyncEnabled()) {
    message += `\n\n📅 ${t("appointment.booking.confirmation.calendarSync")}`;
    if (calendarSettings?.reminderEnabled) {
      message += `\n⏰ ${t("appointment.booking.confirmation.reminder", {
        time: formatReminderTime(calendarSettings.reminderTime),
      })}`;
    }
  }

  // Thêm câu hỏi xác nhận
  message += `\n\n${t("appointment.booking.confirmation.confirmQuestion")}`;

  console.log("[Confirmation Message]: end");
  return message;
};

// Main component
const BookingScreen = ({ navigation }) => {
  const { user, loading: authLoading } = useAuth();
  const { selectedChild, children } = useChildren();
  const { t } = useTranslation();

  // Show loading state while auth is loading
  if (authLoading || !user) {
    return null;
  }

  // Custom hooks - MUST be called before any conditional returns
  const toast = useToast();
  const selectedUser = user.role === "PARENTS" ? selectedChild : user;
  const bookingState = useBookingState(selectedUser);

  const { handleServerError, showToast, toastMessage, toastType, hideToast } =
    useServerErrorHandler();

  // Custom hooks that depend on translation and other state
  const slotsManagement = useSlotsManagement(
    bookingState.hostType,
    bookingState.selectedCounselor,
    bookingState.selectedBookedFor,
    toast.showToastMessage,
    bookingState.setSelectedSlot,
    t
  );
  const counselorsManagement = useCounselorsManagement(
    bookingState.hostType,
    toast.showToastMessage,
    t
  );
  const calendarManagement = useCalendarManagement();

  // Local state
  const [bookingLoading, setBookingLoading] = useState(false);

  // Computed values
  const hostTypeOptions = useMemo(
    () => [
      {
        id: "teacher",
        label: t("appointment.host.teacher"),
        value: "TEACHER",
        disabled: !bookingState.selectedBookedFor?.teacherId,
      },
      {
        id: "counselor",
        label: t("appointment.host.counselor"),
        value: "COUNSELOR",
      },
    ],
    [bookingState.selectedBookedFor?.teacherId, t]
  );

  const canBook = bookingState.selectedSlot && !bookingLoading;

  // Event handlers
  const handleHostTypeSelect = useCallback(
    async (type) => {
      if (type.disabled) {
        toast.showToastMessage(t("common.notAvailable"), "warning");
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
      t, // Add t to dependency array
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

  const handleBooking = useCallback(async () => {
    // console.log("submit");

    if (!bookingState.selectedSlot) {
      toast.showToastMessage(
        t("appointment.booking.selectSlotFirst"),
        "warning"
      );
      return;
    }

    console.log("bookingState", bookingState);

    const confirmationMessage = createConfirmationMessage(
      bookingState.hostType,
      bookingState.selectedCounselor,
      bookingState.selectedChild,
      bookingState.selectedSlot,
      bookingState.isOnline,
      bookingState.reason,
      calendarManagement.calendarSettings,
      t
    );
    // console.log(bookingState);

    Alert.alert(t("appointment.booking.title"), confirmationMessage, [
      { text: t("common.cancel"), style: "destructive" },
      {
        text: t("appointment.booking.submit"),
        onPress: async () => {
          setBookingLoading(true);
          try {
            // Debug logging to see what data we have
            console.log("Debug - user:", user);
            console.log(
              "Debug - bookingState.selectedBookedFor:",
              bookingState.selectedBookedFor
            );
            console.log(
              "Debug - bookingState.hostType:",
              bookingState.hostType
            );

            // Get the appropriate data for the selected person
            const selectedPerson =
              user?.role === "PARENTS" ? selectedChild : user;

            const bookingData = createBookingData(
              bookingState.selectedSlot,
              bookingState.isOnline,
              bookingState.reason,
              user,
              selectedPerson,
              bookingState.hostType.value,
              t
            );

            // Validate bookingData
            if (!bookingData) {
              console.warn("Failed to create booking data");
              toast.showToastMessage(
                t("appointment.errors.bookingError") ||
                  "Không thể tạo dữ liệu đặt lịch",
                "error"
              );
              setBookingLoading(false);
              return;
            }

            console.log("user", user);
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
                  Alert.alert(
                    t("appointment.toast.calendarSyncSuccessMessage")
                  );
                } else {
                  Alert.alert(t("appointment.toast.calendarSyncErrorMessage"));
                }
              } catch (error) {
                Alert.alert(t("appointment.toast.calendarSyncErrorMessage"));
                console.warn("Error syncing appointment to calendar:", error);
              }
            }

            setTimeout(() => {
              navigation.navigate("StatusScreen", {
                title: t("appointment.statusScreen.bookingSuccessTitle"),
                message: t("appointment.statusScreen.bookingSuccessMessage"),
                response: response,
              });
            }, 1000);
          } catch (error) {
            console.warn("Lỗi khi đặt lịch hẹn:", error);

            // Xử lý lỗi server
            if (
              error.response?.status >= 502 &&
              error.response?.status <= 504
            ) {
              handleServerError(error, true);
            } else {
              toast.showToastMessage(
                t("appointment.errors.bookingError"),
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
    t, // Add t to dependency array
  ]);

  const handleBackPress = useCallback(() => {
    // Kiểm tra t có tồn tại không
    if (!t) {
      console.warn("Translation function 't' is not available");
      return;
    }

    Alert.alert(
      t("common.notification"),
      t("appointment.booking.exitConfirmation"),
      [
        { text: t("common.cancel"), style: "destructive" },
        { text: t("common.confirm"), onPress: () => navigation.goBack() },
      ]
    );
  }, [navigation, t]);

  // Debug translation
  useEffect(() => {
    console.log("Translation status:", { t: !!t, tType: typeof t });
  }, [t]);

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

  // Check and update host when selectedChild changes
  useEffect(() => {
    if (user?.role === "PARENTS" && bookingState.selectedChild) {
      // When selectedChild changes, check if current host type is still valid
      const currentHostType = bookingState.hostType;

      if (currentHostType?.value === "TEACHER") {
        // If current host is TEACHER, check if the new child has a teacherId
        if (!bookingState.selectedBookedFor?.teacherId) {
          // New child doesn't have a teacher, switch to counselor
          const counselorOption = hostTypeOptions.find(
            (option) => option.id === "counselor"
          );
          if (counselorOption) {
            handleHostTypeSelect(counselorOption);
          }
        }
      }

      // Reset slots to fetch new ones based on the new child
      slotsManagement.resetSlots();
    }
  }, [
    bookingState.selectedChild,
    user?.role,
    bookingState.hostType,
    bookingState.selectedBookedFor?.teacherId,
    hostTypeOptions,
    handleHostTypeSelect,
    slotsManagement.resetSlots,
  ]);

  // Reset form on focus
  useFocusEffect(
    useCallback(() => {
      const resetFormState = () => {
        bookingState.resetBookingState();
        slotsManagement.resetSlots();
        toast.hideToast();

        if (!global.selectedChildForAppointment) {
          // Set bookedForId based on user role
          const newBookedForId =
            user?.role === "PARENTS" ? selectedChild?.id : user?.id;
          bookingState.setBookedForId(newBookedForId);
        }
      };

      const timeoutId = setTimeout(resetFormState, 100);
      return () => clearTimeout(timeoutId);
    }, [
      user?.id,
      bookingState.resetBookingState,
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
          <Text style={styles.warningTitle}>
            {t("appointment.booking.warning.title")}
          </Text>
        </View>
        <Text style={styles.warningText}>
          {t("appointment.booking.warning.noTeacher")}
        </Text>
      </View>
    );
  }, [bookingState.selectedBookedFor?.teacherId, t]);

  const renderHostSelection = useCallback(
    () => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("appointment.booking.selectCounselor")}
        </Text>
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
                {option.disabled &&
                  ` (${t("appointment.booking.unavailable")})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ),
    [hostTypeOptions, bookingState.hostType, handleHostTypeSelect, t]
  );

  const renderCounselorSelection = useCallback(() => {
    if (bookingState.hostType?.value !== "COUNSELOR") return null;

    return (
      <View style={styles.section}>
        <Dropdown
          label={t("appointment.booking.selectCounselor")}
          placeholder={t("appointment.booking.selectCounselor")}
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
    t, // Add t to dependency array
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
        <Text style={styles.sectionTitle}>
          {t("appointment.booking.appointmentInfo")}
        </Text>

        <View style={styles.switchContainer}>
          <Text style={styles.inputLabel}>
            {t("appointment.booking.consultationFormat")}
          </Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {bookingState.isOnline
                ? t("appointment.booking.online")
                : t("appointment.booking.offline")}
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
            <Text style={styles.inputLabel}>
              {t("appointment.booking.reason")}
            </Text>
            <Text style={styles.optionalText}>
              ({t("appointment.booking.optional")})
            </Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder={t("appointment.booking.reasonPlaceholder")}
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
    t, // Add t to dependency array
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
            {t("appointment.booking.slots.title")}
            {loadingSlots && (
              <Text style={styles.loadingText}> ({t("common.loading")})</Text>
            )}
          </Text>
          {hasSlots && (
            <View style={styles.slotsOverview}>
              <Text style={styles.slotsOverviewText}>
                {t("appointment.booking.slots.overview", {
                  days: availableDays.length,
                  slots: totalSlots,
                })}
              </Text>
            </View>
          )}
        </View>

        {loadingSlots ? (
          <Loading text={t("appointment.booking.loadingSlots")} />
        ) : !hasAvailableSlots(groupedSlots) ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              {t("appointment.booking.slots.empty.title")}
            </Text>
            <Text style={styles.emptySubtext}>
              {t("appointment.booking.slots.empty.subtitle")}
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
                t={t}
              />
            ))}

            {visibleDays < availableDays.length && (
              <TouchableOpacity
                style={styles.loadMoreDaysButton}
                onPress={loadMoreDays}
                disabled={loadingMoreDays}
              >
                {loadingMoreDays ? (
                  <Loading text={t("appointment.booking.loadingMoreDays")} />
                ) : (
                  <>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#3B82F6"
                    />
                    <Text style={styles.loadMoreDaysText}>
                      {t("appointment.booking.loadMoreDays", {
                        count: Math.min(2, availableDays.length - visibleDays),
                      })}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.daysInfoContainer}>
              <Text style={styles.daysInfoText}>
                {t("appointment.booking.daysInfo", {
                  shown: Math.min(visibleDays, availableDays.length),
                  total: availableDays.length,
                })}
              </Text>
              {visibleDays < availableDays.length && (
                <Text style={styles.lazyLoadHint}>
                  {t("appointment.booking.lazyLoadHint")}
                </Text>
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
        ? selectedSlot.fullName || t("appointment.host.classTeacher")
        : selectedCounselor?.name || t("appointment.host.counselor");

    const startTime = dayjs(
      selectedSlot.selectedStartTime || selectedSlot.startDateTime
    ).format("HH:mm");
    const endTime = dayjs(
      selectedSlot.selectedEndTime || selectedSlot.endDateTime
    ).format("HH:mm");
    const date = dayjs(selectedSlot.startDateTime).format("dddd, DD/MM/YYYY");

    return (
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>
          {t("appointment.details.appointmentInfo")}
        </Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text style={styles.summaryLabel}>
              {t("appointment.host.counselor")}:
            </Text>
            <Text style={styles.summaryValue}>{counselorName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.summaryLabel}>
              {t("appointment.labels.date")}:
            </Text>
            <Text style={styles.summaryValue}>{date}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.summaryLabel}>
              {t("appointment.labels.time")}:
            </Text>
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
            <Text style={styles.summaryLabel}>
              {t("appointment.booking.form.mode")}:
            </Text>
            <Text style={styles.summaryValue}>
              {isOnline
                ? t("appointment.booking.online")
                : t("appointment.booking.offline")}
            </Text>
          </View>
          {reason && (
            <View style={styles.summaryRow}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#6B7280"
              />
              <Text style={styles.summaryLabel}>
                {t("appointment.labels.reason")}:
              </Text>
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
          <Text style={styles.sectionTitle}>
            {t("appointment.calendarSync.title")}
          </Text>
        </View>
        <View style={styles.calendarInfoContainer}>
          <View style={styles.calendarInfoRow}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.calendarInfoText}>
              {t("appointment.calendarSync.enabled")}
            </Text>
          </View>
          {calendarSettings.reminderEnabled && (
            <View style={styles.calendarInfoRow}>
              <Ionicons name="alarm" size={16} color="#F59E0B" />
              <Text style={styles.calendarInfoText}>
                {t("appointment.calendarSync.reminderBefore", {
                  time: formatReminderTime(calendarSettings.reminderTime),
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }, [calendarManagement.calendarSettings]);

  return (
    <Container>
      <HeaderWithoutTab
        title={t("appointment.booking.title")}
        onBackPress={handleBackPress}
      />
      {user?.role === "PARENTS" && children.length > 0 && (
        <View style={styles.childSelectorContainer}>
          <ChildSelector />
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderWarningCard()}
        {/* {renderChildSelection()} */}
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
                <Text style={styles.bookingButtonText}>
                  {t("appointment.booking.bookingInProgress")}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.bookingButtonText}>
                  {t("appointment.booking.bookAppointment")}
                </Text>
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
  childSelectorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
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
