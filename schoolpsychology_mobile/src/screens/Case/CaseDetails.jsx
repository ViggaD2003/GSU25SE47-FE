import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { Container } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import HeaderWithTab from "@/components/ui/header/HeaderWithTab";
import StatisticsCard from "@/components/dashboard/StatisticsCard";
import BarChart from "@/components/charts/BarChart";
import Loading from "@/components/common/Loading";
import { useAuth, useChildren, useRealTime } from "@/contexts";
import { confirmCase, getCaseByCaseId } from "@/services/api/caseApi";
import { getLevelConfig } from "@/constants/levelConfig";
import ChildSelector, {
  ChildSelectorWithTitle,
} from "@/components/common/ChildSelector";
import { useFocusEffect } from "@react-navigation/native";
import { Toast } from "@/components/common";
import { getChatMessages, getChatRooms } from "@/services/api/chatApi";
import dayjs from "dayjs";

const CaseDetails = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const {
    sendMessage,
    chatMessages,
    setChatMessages,
    sendMessageToCounselor,
    onlineUsers: activeChat,
    setRoomChatId,
    roomChatId,
    isConnectionReady,
  } = useRealTime();
  const { caseId, headerTitle, from, subTitle } = route.params;
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));
  const { children, selectedChild } = useChildren();
  const isNewCase = caseDetails && caseDetails?.caseInfo?.status === "NEW";
  // const isNewCase = true;
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const hasActiveCase = user?.caseId || selectedChild?.caseId;

  // Chat states
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [chatFadeAnim] = useState(new Animated.Value(0));

  const chatRef = useRef(null);

  const fetchChatMessages = async (roomId) => {
    if (roomId) {
      const data = await getChatMessages(roomId);
      // console.log("[CaseDetails] Fetch chat messages", data);
      setChatMessages(data);
    }
  };

  // Fetch chat rooms
  const fetchRoomChat = async (id) => {
    try {
      if (caseId) {
        return;
      }
      const res = await getChatRooms(id);
      console.log("[CaseDetails_fetchRoomChat] Fetch chat rooms", res);

      if (res) {
        sendMessageToCounselor("ADD_USER");

        setRoomChatId(res.id);

        await fetchChatMessages(res.id);
      }
    } catch (err) {
      console.warn("Error fetching chat rooms:", err);
    }
  };

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      // console.log("[CaseDetails] caseId", caseId);

      const id =
        user?.role === "PARENTS" && selectedChild
          ? selectedChild?.caseId
          : user?.caseId;

      console.log("[CaseDetails] id", id);

      // console.log("[CaseDetails] id", id);

      if (!caseId && !id) return setCaseDetails(null);

      const data = await getCaseByCaseId(caseId || id);
      console.log("[CaseDetails] data", data);

      setCaseDetails(data);

      if (data && !caseId && data?.caseInfo?.status === "IN_PROGRESS") {
        await fetchRoomChat(id);
      }

      // Animate content appearance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.warn("Error fetching case details:", error);
      setCaseDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCaseDetails(), refreshUser()])
      .then(() => {
        console.log("[CaseDetails] Refreshed");
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      fetchCaseDetails();
    }, [selectedChild])
  );

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0 && chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [chatMessages]);

  const handleRequestToCreate = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show confirmation alert after animation
    setTimeout(() => {
      Alert.alert(
        t("case.emptyState.requestToCreate"),
        t("case.emptyState.requestToCreateConfirm"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => {
              console.log("Request cancelled by user");
            },
          },
          {
            text: t("common.confirm"),
            style: "default",
            onPress: () => {
              console.log(user);
              console.log({
                title: "Request to create case",
                content: user.fullName + " request to create case",
                username: user.classDto?.teacher?.email,
                notificationType: "CASE_DANGER",
              });

              // Send request message
              sendMessage({
                title: "Request to create case",
                content: user.fullName + " request to create case",
                username: user.classDto?.teacher?.email,
                notificationType: "CASE_DANGER",
              });
            },
          },
        ],
        { cancelable: true }
      );
    }, 200);
  };

  const handleConfirmCase = async (status) => {
    try {
      if (!isNewCase || user?.role === "STUDENT") {
        return;
      }

      if (caseDetails && status) {
        Alert.alert(
          t(`case.${status.toLowerCase()}.title`),
          t(`case.${status.toLowerCase()}.message`),
          [
            {
              text: t("common.cancel"),
              style: "destructive",
            },
            {
              text: t("common.confirm"),
              onPress: async () => {
                setLoading(true);
                try {
                  const body = {
                    priority: caseDetails?.caseInfo?.priority,
                    status: status,
                    progressTrend: caseDetails?.caseInfo?.progressTrend,
                    currentLevelId: caseDetails?.caseInfo?.currentLevel?.id,
                  };

                  const caseId =
                    user?.role === "PARENTS" && selectedChild
                      ? selectedChild.caseId
                      : user?.caseId;

                  const data = await confirmCase(caseId, body);

                  console.log(data);

                  if (data && data.status === "CONFIRMED") {
                    setCaseDetails({ caseInfo: data });
                  } else if (data && data.status === "REJECTED") {
                    refreshUser();
                    setCaseDetails(null);
                  }

                  setToast({
                    visible: true,
                    message: t(`case.${status.toLowerCase()}.success`),
                    type: "success",
                  });
                } catch (error) {
                  console.log(
                    "[CaseDetails] Error confirming case:",
                    error.response.data
                  );
                } finally {
                  setLoading(false);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.warn("Error confirming case:", error);
    }
  };

  // Chat functions
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
    Animated.timing(chatFadeAnim, {
      toValue: isChatVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Scroll to bottom when opening chat
    if (!isChatVisible && chatMessages.length > 0) {
      setTimeout(() => {
        chatRef.current?.scrollToEnd({ animated: true });
      }, 400); // Wait for animation to complete
    }
  };

  const sendMesg = () => {
    if (currentMessage.trim()) {
      const newMessage = {
        message: currentMessage,
        sender: user.email,
        timestamp: dayjs(),
        messageType: "CHAT",
      };

      sendMessageToCounselor("CHAT", roomChatId, newMessage);

      setCurrentMessage("");

      // Scroll to bottom after sending message
      setTimeout(() => {
        chatRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Helper functions
  const getStatusConfig = (status) => {
    switch (status) {
      case "NEW":
        return {
          color: "#3B82F6",
          icon: "add-circle",
          label: t("case.status.new"),
          backgroundColor: "#DBEAFE",
          gradient: ["#3B82F6", "#1D4ED8"],
        };
      case "CONFIRMED":
        return {
          color: "#10B981",
          icon: "checkmark-circle",
          label: t("case.status.confirmed"),
          backgroundColor: "#D1FAE5",
          gradient: ["#10B981", "#059669"],
        };
      case "REJECTED":
        return {
          color: "#EF4444",
          icon: "close-circle",
          label: t("case.status.rejected"),
          backgroundColor: "#FEE2E2",
          gradient: ["#EF4444", "#DC2626"],
        };
      case "IN_PROGRESS":
        return {
          color: "#F59E0B",
          icon: "time-outline",
          label: t("case.status.inProgress"),
          backgroundColor: "#FEF3C7",
          gradient: ["#F59E0B", "#D97706"],
        };
      case "CLOSED":
        return {
          color: "#10B981",
          icon: "checkmark-circle",
          label: t("case.status.closed"),
          backgroundColor: "#D1FAE5",
          gradient: ["#10B981", "#059669"],
        };
      default:
        return {
          color: "#6B7280",
          icon: "help-circle",
          label: t("case.status.unknown"),
          backgroundColor: "#F3F4F6",
          gradient: ["#6B7280", "#4B5563"],
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "HIGH":
        return {
          color: "#EF4444",
          icon: "alert-circle",
          label: t("case.priority.high"),
          backgroundColor: "#FEE2E2",
          gradient: ["#EF4444", "#DC2626"],
        };
      case "MEDIUM":
        return {
          color: "#F59E0B",
          icon: "warning-outline",
          label: t("case.priority.medium"),
          backgroundColor: "#FEF3C7",
          gradient: ["#F59E0B", "#D97706"],
        };
      case "LOW":
        return {
          color: "#10B981",
          icon: "checkmark",
          label: t("case.priority.low"),
          backgroundColor: "#D1FAE5",
          gradient: ["#10B981", "#059669"],
        };
      default:
        return {
          color: "#6B7280",
          icon: "help-circle",
          label: t("case.priority.unknown"),
          backgroundColor: "#F3F4F6",
          gradient: ["#6B7280", "#4B5563"],
        };
    }
  };

  // console.log("[CaseDetails] caseDetails", caseDetails);

  const getProgressTrendConfig = (trend) => {
    switch (trend) {
      case "IMPROVED":
        return {
          color: "#10B981",
          icon: "trending-up",
          label: t("case.progressTrend.improved"),
          backgroundColor: "#D1FAE5",
          gradient: ["#10B981", "#059669"],
        };
      case "STABLE":
        return {
          color: "#3B82F6",
          icon: "remove-outline",
          label: t("case.progressTrend.stable"),
          backgroundColor: "#DBEAFE",
          gradient: ["#3B82F6", "#1D4ED8"],
        };
      case "DECLINED":
        return {
          color: "#EF4444",
          icon: "trending-down",
          label: t("case.progressTrend.declined"),
          backgroundColor: "#FEE2E2",
          gradient: ["#EF4444", "#DC2626"],
        };
      default:
        return {
          color: "#6B7280",
          icon: "help-circle",
          label: t("case.progressTrend.unknown"),
          backgroundColor: "#F3F4F6",
          gradient: ["#6B7280", "#4B5563"],
        };
    }
  };

  const renderEmptyState = (status) => {
    const statusConfig = getStatusConfig(status);
    // console.log(user.isEnableSurvey);

    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={statusConfig.gradient}
          style={styles.emptyIconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={statusConfig.icon} size={48} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.emptyTitle}>
          {status === "CLOSED"
            ? t("case.emptyState.noCase")
            : status === "NEW"
            ? t("case.emptyState.waitingForConfirmation")
            : status === "CONFIRMED"
            ? t("case.emptyState.confirmedTitle")
            : t("case.emptyState.noCaseAssigned")}
        </Text>
        <Text style={styles.emptySubtitle}>
          {status === "CLOSED"
            ? t("case.emptyState.allCasesClosedSubtitle")
            : status === "NEW"
            ? t("case.emptyState.waitingForConfirmationSubtitle")
            : status === "CONFIRMED"
            ? t("case.emptyState.confirmedSubtitle")
            : t("case.emptyState.noCaseAssignedSubtitle")}
        </Text>
        {user.role === "STUDENT" && !caseId && !hasActiveCase && (
          <View style={styles.requestButtonContainer}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                onPress={handleRequestToCreate}
                style={styles.requestButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#3B82F6", "#3B82F6"]}
                  style={styles.requestButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.requestButtonContent}>
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#FFFFFF"
                      style={styles.requestButtonIcon}
                    />
                    <Text style={styles.requestButtonText}>
                      {t("case.emptyState.requestToCreate")}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.requestButtonSubtext}>
              {t("case.emptyState.requestToCreateConfirm")}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCaseInfo = () => {
    console.log("[CaseDetails] renderCaseInfo", caseDetails);

    // Safety check for caseInfo
    if (!caseDetails && !caseDetails?.caseInfo) {
      return null;
    }

    const { caseInfo } = caseDetails;

    const statusConfig = getStatusConfig(caseInfo?.status);
    const priorityConfig = getPriorityConfig(caseInfo?.priority);
    const progressConfig = getProgressTrendConfig(caseInfo?.progressTrend);
    const currentLevelConfig = getLevelConfig(
      caseInfo?.currentLevel?.levelType || caseInfo?.currentLevel?.code
    );
    const initialLevelConfig = getLevelConfig(
      caseInfo?.initialLevel?.levelType || caseInfo?.initialLevel?.code
    );

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.caseInfoCard]}>
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={[styles.cardGradient]}
          >
            <View style={[styles.cardContent]}>
              {/* Header with gradient background */}
              <LinearGradient
                colors={statusConfig.gradient}
                style={styles.caseHeaderGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.caseHeader}>
                  <View style={styles.caseTitleContainer}>
                    <Text style={styles.caseTitle}>{caseInfo?.title}</Text>
                    <Text style={styles.caseId}>#{caseInfo?.id}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={styles.statusBadge}>
                      <Ionicons
                        name={statusConfig.icon}
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.statusBadgeText}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
              <View style={{ padding: 16, width: "100%" }}>
                {/* Description */}
                <View style={styles.descriptionContainer}>
                  <Text style={styles.description}>
                    {caseInfo?.description}
                  </Text>
                </View>

                {/* Status Indicators */}
                <View style={styles.statusIndicators}>
                  <View style={styles.statusRow}>
                    <LinearGradient
                      colors={priorityConfig.gradient}
                      style={styles.statusIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="flag" size={16} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statusLabel}>
                      {t("case.caseInfo.priority")}:
                    </Text>
                    <View style={styles.priorityChip}>
                      <Ionicons
                        name={priorityConfig.icon}
                        size={14}
                        color={priorityConfig.color}
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          { color: priorityConfig.color },
                        ]}
                      >
                        {priorityConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <LinearGradient
                      colors={progressConfig.gradient}
                      style={styles.statusIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statusLabel}>
                      {t("case.caseInfo.progressTrend")}:
                    </Text>
                    <View style={styles.progressChip}>
                      <Ionicons
                        name={progressConfig.icon}
                        size={14}
                        color={progressConfig.color}
                      />
                      <Text
                        style={[
                          styles.progressText,
                          { color: progressConfig.color },
                        ]}
                      >
                        {progressConfig.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Level Information */}
                <View style={styles.levelSection}>
                  <Text style={styles.sectionTitle}>
                    {t("case.level.title")}
                  </Text>
                  <View style={styles.levelCards}>
                    <LinearGradient
                      colors={
                        currentLevelConfig?.gradient || ["#3B82F6", "#1D4ED8"]
                      }
                      style={styles.levelCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.levelLabel}>
                        {t("case.level.current")}
                      </Text>
                      <View style={styles.levelBadge}>
                        <Ionicons
                          name={currentLevelConfig?.icon}
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.levelText}>
                          {t(`survey.level.${caseInfo?.currentLevel?.code}`)}
                        </Text>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={
                        initialLevelConfig?.gradient || ["#6B7280", "#4B5563"]
                      }
                      style={styles.levelCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.levelLabel}>
                        {t("case.level.initial")}
                      </Text>
                      <View style={styles.levelBadge}>
                        <Ionicons
                          name={initialLevelConfig?.icon}
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.levelText}>
                          {t(`survey.level.${caseInfo?.initialLevel?.code}`)}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  };

  const renderStatistics = () => {
    // Safety check for groupedStatic
    if (!caseDetails || !caseDetails?.groupedStatic) {
      return null;
    }
    const { groupedStatic } = caseDetails;

    return (
      <Animated.View style={[styles.statisticsSection, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>{t("case.statistics.title")}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: "row", gap: 10 }}
        >
          <View style={{ marginRight: 10 }}>
            <StatisticsCard
              title={t("case.statistics.surveys")}
              value={
                (groupedStatic?.survey?.activeSurveys || 0) +
                (groupedStatic?.survey?.completedSurveys || 0)
              }
              subtitle={`${groupedStatic.survey?.completedSurveys || 0} ${t(
                "case.statistics.completed"
              )}`}
              icon="document-text"
              iconColor="#F59E0B"
              valueColor="#F59E0B"
              size="small"
            />
          </View>
          <View style={{ marginRight: 10 }}>
            <StatisticsCard
              title={t("case.statistics.appointments")}
              value={
                (groupedStatic.appointment?.activeAppointments || 0) +
                (groupedStatic.appointment?.completedAppointments || 0)
              }
              subtitle={`${
                groupedStatic.appointment?.completedAppointments || 0
              } ${t("case.statistics.completed")}`}
              icon="calendar"
              iconColor="#10B981"
              valueColor="#10B981"
              size="small"
            />
          </View>
          <View style={{ marginRight: 10 }}>
            <StatisticsCard
              title={t("case.statistics.programs")}
              value={
                (groupedStatic.program?.activePrograms || 0) +
                (groupedStatic.program?.completedPrograms || 0)
              }
              subtitle={`${groupedStatic.program?.completedPrograms || 0} ${t(
                "case.statistics.completed"
              )}`}
              icon="school"
              iconColor="#F59E0B"
              valueColor="#F59E0B"
              size="small"
            />
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderCharts = () => {
    // Safety check for groupedStatic
    if (!caseDetails || !caseDetails?.groupedStatic) {
      return null;
    }
    const { groupedStatic } = caseDetails;

    // Prepare chart data with proper formatting for 0.0-4.0 scale
    const formatChartData = (dataSet, title) => {
      if (!dataSet || dataSet.length === 0) {
        return [{ x: t("case.charts.noData"), y: 0 }];
      }

      return dataSet.map((item, index) => ({
        x: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
          : `Lần ${index + 1}`,
        y: item.score || 0,
        label: t("case.charts.scoreFormat", { score: item.score || 0 }),
      }));
    };

    const surveyData = formatChartData(
      groupedStatic.survey?.dataSet,
      "Khảo sát"
    );
    const appointmentData = formatChartData(
      groupedStatic.appointment?.dataSet,
      "Lịch hẹn"
    );
    const programData = formatChartData(
      groupedStatic.program?.dataSet,
      "Chương trình"
    );

    return (
      <Animated.View style={[styles.chartsSection, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>{t("case.charts.title")}</Text>

        <View style={styles.chartContainer}>
          <BarChart
            data={surveyData}
            title={t("case.charts.surveys")}
            barColor="#3B82F6"
            height={180}
            yAxisMax={4.0}
            valueFormatter={(value) =>
              t("case.charts.scoreFormat", { score: value.toFixed(1) })
            }
            showGrid={true}
          />
        </View>

        <View style={styles.chartContainer}>
          <BarChart
            data={appointmentData}
            title={t("case.charts.appointments")}
            barColor="#10B981"
            height={180}
            yAxisMax={4.0}
            valueFormatter={(value) =>
              t("case.charts.scoreFormat", { score: value.toFixed(1) })
            }
            showGrid={true}
          />
        </View>

        <View style={styles.chartContainer}>
          <BarChart
            data={programData}
            title={t("case.charts.programs")}
            barColor="#F59E0B"
            height={180}
            yAxisMax={4.0}
            valueFormatter={(value) =>
              t("case.charts.scoreFormat", { score: value.toFixed(1) })
            }
            showGrid={true}
          />
        </View>
      </Animated.View>
    );
  };

  const renderChatModal = () => {
    if (!isChatVisible) return null;
    const counselor = caseDetails?.caseInfo?.counselor?.email;

    return (
      <Animated.View style={[styles.chatModal, { opacity: chatFadeAnim }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          style={styles.chatContainer}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.chatTitle}>{t("chat.title")}</Text>
              {Array(...(activeChat || [])).includes(counselor) ? (
                <Text style={styles.onlineStatus}>{t("chat.online")}</Text>
              ) : (
                <Text style={styles.offlineStatus}>{t("chat.offline")}</Text>
              )}
            </View>
            <TouchableOpacity onPress={toggleChat} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          {isConnectionReady() ? (
            <ScrollView
              ref={chatRef}
              style={styles.chatMessages}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((message, index) => (
                <View key={index} style={styles.messageContainer}>
                  <View
                    style={[
                      styles.contentContainer,
                      message.sender === user.email
                        ? styles.userMessage
                        : styles.botMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.sender === user.email
                          ? styles.userMessageText
                          : styles.botMessageText,
                      ]}
                    >
                      {message.message}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.messageTime,
                      message.sender === user.email
                        ? styles.userMessage
                        : styles.botMessage,
                    ]}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                // marginTop: 100,
              }}
            >
              <Loading />
            </View>
          )}

          {/* Chat Input */}
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              value={currentMessage}
              onChangeText={setCurrentMessage}
              placeholder={t("chat.placeholder")}
              multiline
              maxLength={500}
              placeholderTextColor="#6B7280"
            />
            <TouchableOpacity
              onPress={sendMesg}
              style={[
                styles.sendButton,
                !currentMessage.trim() && { opacity: 0.5 },
              ]}
              disabled={!currentMessage.trim() || !isConnectionReady()}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    );
  };

  const renderChatButton = () => {
    if (caseId || caseDetails?.caseInfo?.status !== "IN_PROGRESS") {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.chatFloatingButton}
        onPress={toggleChat}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#3B82F6", "#1D4ED8"]}
          style={styles.chatButtonGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderButton = () => {
    if (user.role === "STUDENT" || !isNewCase) {
      return null;
    }

    return (
      <Animated.View style={[{ opacity: fadeAnim }]}>
        <View style={styles.buttonContent}>
          <TouchableOpacity
            onPress={() => handleConfirmCase("CONFIRMED")}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>
              {t("case.confirmed.button")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleConfirmCase("REJECTED")}
            style={styles.rejectButton}
          >
            <Text style={styles.rejectButtonText}>
              {t("case.rejected.button")}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <Container edges={from !== "tab" ? ["top", "bottom"] : []}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ visible: false, message: "", type: "info" })}
      />
      {from === "tab" ? (
        <HeaderWithTab
          title={t("case.tab.title")}
          subtitle={t("case.tab.subtitle") || subTitle}
        />
      ) : (
        <HeaderWithoutTab
          title={t("case.details.title") || headerTitle}
          onBackPress={() => navigation.goBack()}
        />
      )}

      {/* Child selector */}
      {user?.role === "PARENTS" &&
        children &&
        children.length > 0 &&
        from === "tab" && (
          <View style={styles.childSelectorContainer}>
            <ChildSelector style={styles.childSelector} />
          </View>
        )}

      {loading ? (
        <Loading />
      ) : (
        <>
          {renderButton()}

          <ScrollView
            style={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {!hasActiveCase && !caseId ? (
              renderEmptyState("CLOSED")
            ) : user.role === "STUDENT" && isNewCase ? (
              renderEmptyState("NEW")
            ) : user?.caseProfile?.status === "CONFIRMED" ? (
              renderEmptyState("CONFIRMED")
            ) : (
              <View style={styles.content}>
                {renderCaseInfo()}
                {!isNewCase && renderStatistics()}
                {!isNewCase && renderCharts()}
              </View>
            )}
          </ScrollView>

          {/* Chat Components */}
          {renderChatButton()}
          {renderChatModal()}
        </>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  // Chat Styles
  chatFloatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  chatButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  chatModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1001,
    justifyContent: "flex-end",
  },
  chatContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: "98%",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    padding: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  chatTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  titleContainer: {
    gap: 8,
  },
  onlineStatus: {
    color: "#11FF51FF",
    fontSize: 13,
    fontWeight: "600",
  },
  offlineStatus: {
    color: "#C21C1CFF",
    fontSize: 13,
    fontWeight: "600",
  },
  messageContainer: {
    marginBottom: 15,
  },
  contentContainer: {
    marginBottom: 5,
    maxWidth: "80%",
    flexDirection: "row",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  botMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    padding: 12,
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
  },
  botMessageText: {
    backgroundColor: "#E5E7EB",
    color: "#1F2937",
  },
  messageTime: {
    fontSize: 10,
    color: "#6B7280",
    // marginTop: 4,
    // textAlign: "right",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: "#F9FAFB",
    color: "#000",
  },
  sendButton: {
    backgroundColor: "#3B82F6",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  childSelectorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  scrollContent: {
    // paddingBottom: 32,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
    backgroundColor: "#FAFBFC",
    borderRadius: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 28,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  caseInfoCard: {
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 0,
  },
  caseHeaderGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  caseTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  caseTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  caseId: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  descriptionContainer: {
    padding: 20,
    paddingTop: 16,
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    fontWeight: "400",
  },
  statusIndicators: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  levelSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  levelCards: {
    flexDirection: "row",
    gap: 16,
  },
  levelCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  levelLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statisticsSection: {
    marginBottom: 32,
  },
  statisticsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCardGradient: {
    flex: 1,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  chartsSection: {
    marginBottom: 32,
  },
  chartContainer: {},
  chartCard: {},
  studentCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  studentInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginRight: 12,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
  },
  buttonContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#018103",
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#018103",
    fontSize: 16,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  // Request Button Styles
  requestButtonContainer: {
    marginTop: 32,
    alignItems: "center",
    width: "100%",
  },
  requestButton: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 16,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  requestButtonGradient: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  requestButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  requestButtonIcon: {
    marginRight: 4,
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  requestButtonSubtext: {
    marginTop: 12,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
    fontStyle: "italic",
  },
});

export default CaseDetails;
