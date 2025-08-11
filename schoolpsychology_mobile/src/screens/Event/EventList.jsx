import { AppointmentCard, Container, SurveyCard, Loading } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useAuth } from "@/contexts";
import { getActiveAppointments } from "@/services/api/AppointmentService";
import { getPublishedSurveys } from "@/services/api/SurveyService";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { StyleSheet, View, FlatList, Text, RefreshControl } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const EventList = ({ route, navigation }) => {
  const { user, loading: authLoading } = useAuth();
  const { type } = route.params;
  const { t } = useTranslation();

  // Safety check for navigation
  if (!navigation) {
    return null; // or a loading component
  }

  // Show loading state while auth is loading
  if (authLoading || !user) {
    return null;
  }

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchByType = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let data;
      switch (type) {
        case "APPOINTMENT":
          data = await getActiveAppointments(user.id);
          setEvents(data || []);
          break;
        case "SURVEY":
          data = await getPublishedSurveys();

          setEvents(data || []);
          break;
        case "PROGRAM":
          setEvents([]);
          break;
        default:
          setEvents([]);
          break;
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(t("common.errorLoadData"));
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchByType(true);
  };

  const renderItem = ({ item }) => {
    switch (type) {
      case "APPOINTMENT":
        return (
          <AppointmentCard
            appointment={item}
            onPress={() =>
              navigation.navigate("Appointment", {
                screen: "AppointmentDetails",
                params: { appointment: item },
              })
            }
          />
        );

      case "SURVEY":
        return (
          <SurveyCard
            survey={item}
            navigation={navigation}
            onRefresh={fetchByType}
          />
        );
      case "PROGRAM":
        return null;
      default:
        return null;
    }
  };

  const renderEmptyComponent = () => {
    if (loading) return null;

    const getEmptyConfig = () => {
      switch (type) {
        case "APPOINTMENT":
          return {
            icon: "event-busy",
            title: t("eventList.empty.appointment.title"),
            subtitle: t("eventList.empty.appointment.subtitle"),
            color: "#FF6B6B",
          };
        case "SURVEY":
          return {
            icon: "quiz",
            title: t("eventList.empty.survey.title"),
            subtitle: t("eventList.empty.survey.subtitle"),
            color: "#4ECDC4",
          };
        case "PROGRAM":
          return {
            icon: "school",
            title: t("eventList.empty.program.title"),
            subtitle: t("eventList.empty.program.subtitle"),
            color: "#45B7D1",
          };
        default:
          return {
            icon: "inbox",
            title: t("eventList.empty.default.title"),
            subtitle: t("eventList.empty.default.subtitle"),
            color: "#96CEB4",
          };
      }
    };

    const config = getEmptyConfig();

    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: config.color + "20" },
          ]}
        >
          <MaterialIcons name={config.icon} size={48} color={config.color} />
        </View>
        <Text style={styles.emptyTitle}>{config.title}</Text>
        <Text style={styles.emptySubtitle}>{config.subtitle}</Text>
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  };

  const getTitle = () => {
    switch (type) {
      case "APPOINTMENT":
        return t("events.appointment");
      case "SURVEY":
        return t("events.survey");
      case "PROGRAM":
        return t("events.program");
      default:
        return type;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchByType();
    }, [type])
  );

  if (loading && !refreshing) {
    return (
      <Container>
        <HeaderWithoutTab
          title={getTitle()}
          onBackPress={() => navigation?.goBack()}
        />
        <Loading />
      </Container>
    );
  }

  return (
    <Container>
      <HeaderWithoutTab
        title={getTitle()}
        onBackPress={() => navigation?.goBack()}
      />

      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B10",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B6B20",
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginLeft: 8,
    flex: 1,
  },
});

export default EventList;
