import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Container from '../../components/Container';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

export default function MyChildren({ route }) {
  const navigation = useNavigation();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = route?.params?.data?.student || [];
    const students = data.map((student, idx) => ({
      ...student,
      id: student.studentCode || idx.toString(),
    }));
    setChildren(students);
    setLoading(false);
  }, [route?.params]);

  return (
    <Container>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Children</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#181A3D" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </ScrollView>
      )}
    </Container>
  );
}

function ChildCard({ child }) {
  return (
    <View style={styles.cardLarge}>
      <Icon name="account-child-circle" size={64} color="#181A3D" style={{ alignSelf: 'center', marginBottom: 12 }} />
      <Text style={styles.name}>{child.fullName}</Text>
      <Text style={styles.info}>Email: {child.email}</Text>
      <Text style={styles.info}>Phone: {child.phoneNumber}</Text>
      <Text style={styles.info}>Student Code: {child.studentCode}</Text>
      <Text style={styles.info}>Gender: {child.gender ? 'Male' : 'Female'}</Text>
      <Text style={styles.info}>Date of Birth: {child.dob}</Text>
      <Text style={styles.info}>Enable Survey: {child.isEnableSurvey ? 'Yes' : 'No'}</Text>
      <Text style={styles.info}>Class: {child.classDto?.codeClass}</Text>
      <Text style={styles.info}>Class Year: {child.classDto?.classYear}</Text>
      <Text style={styles.info}>Teacher: {child.classDto?.teacher?.fullName}</Text>
      <Text style={styles.info}>Teacher Email: {child.classDto?.teacher?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#181A3D',
  },
  cardLarge: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#181A3D',
    textAlign: 'center',
    marginBottom: 12,
  },
  info: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
});
