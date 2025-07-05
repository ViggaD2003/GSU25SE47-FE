import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Agenda, Calendar } from "react-native-calendars";

const CalendarScreen = () => {
  const [items, setItems] = useState({});

  return (
    // <Agenda
    //   items={items}
    //   selected={new Date().toISOString().split("T")[0]}
    //   renderItem={(item, firstItemInDay) => (
    //     <View style={styles.item}>
    //       <Text>{item.name}</Text>
    //     </View>
    //   )}
    //   renderEmptyDate={() => (
    //     <View style={styles.empty}>
    //       <Text>Không có sự kiện</Text>
    //     </View>
    //   )}
    //   rowHasChanged={(r1, r2) => r1.name !== r2.name}
    // />

    <Calendar />
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 16,
    marginRight: 10,
    marginTop: 17,
    elevation: 2,
  },
  empty: {
    flex: 1,
    paddingTop: 30,
    paddingLeft: 20,
  },
});

export default CalendarScreen;
