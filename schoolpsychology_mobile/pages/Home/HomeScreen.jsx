import React from 'react';
import { Text } from 'react-native';
import Container from '../../components/Container';
import { Button } from 'react-native-web';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  }

  return (
    <Container>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Home Screen</Text>
      <Button onPress={handleLogout} title='logout' />
    </Container>
  );
} 