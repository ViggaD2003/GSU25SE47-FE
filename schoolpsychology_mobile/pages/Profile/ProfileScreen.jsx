import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Container from '../../components/Container';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({});
  const { logout, user } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const response = await api.post("/api/v1/auth/logout");
      await logout();
    } catch (error) {
      await logout();
      if (error.response?.data?.message) {
        console.error("API error:", error.response.data.message);
        setError(error.response.data.message);
      } else {
        console.error("Unexpected error:", error.message);
        setError("Something went wrong while fetching profile.");
      }
      
    }

  }

useFocusEffect(
  React.useCallback(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/v1/account");
        setProfile(response.data);
      } catch (error) {
        const msg = error.response?.data?.message || error.message;
        console.error("Profile fetch error:", msg);
      }
    };

    fetchProfile();
  }, [])
);
const navigateToEditProfile = () => {
  navigation.navigate("EditProfile", { data: profile });
}
const navigateToMyChildren = () => {
  navigation.navigate("MyChildren", { data: profile.relationships });
}
  return (
    <Container>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Card Profile */}
      <View style={styles.card}>
        <View style={styles.avatarWrapper}>
          <Icon name="account" size={90} color="#222" style={styles.avatarIcon} />
        </View>
        <Text style={styles.name}>{profile.fullName}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        {/* Menu List */}
        <View style={styles.menuList}>
          <MenuItem icon="account-edit" label="Edit Profile" onPress={navigateToEditProfile}/>
          {user.role === "PARENTS" ? <MenuItem icon="baby-face-outline" label="My Children" onPress={navigateToMyChildren}/> : <></>}
          <MenuItem icon="cog-outline" label="Settings" />
          <MenuItem icon="help-circle-outline" label="Need Help?" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
          <Icon name="power" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <Icon name={icon} size={22} color="#181A3D" style={{ width: 28 }} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron-right" size={22} color="#181A3D" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarWrapper: {
    backgroundColor: '#F3F3F3',
    borderRadius: 100,
    padding: 18,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '500',
    marginTop: 8,
    color: '#181A3D',
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
  },
  menuList: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingHorizontal: 2,
  },
  menuLabel: {
    fontSize: 17,
    color: '#181A3D',
    marginLeft: 10,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    alignSelf: 'flex-start',
  },
  logoutText: {
    color: '#F44336',
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 