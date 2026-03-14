import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Native splash may already be controlled elsewhere.
});

export default function Layout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#07090f" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#07090f' }
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="cardready" />
        <Stack.Screen name="pinlogin" />
      </Stack>
    </>
  );
}
