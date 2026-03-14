import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;
  const splashTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const runIntro = async () => {
      await ExpoSplashScreen.hideAsync().catch(() => {
        return undefined;
      });

      if (!isMounted) {
        return;
      }

      Animated.sequence([
        Animated.parallel([
          Animated.timing(splashScale, {
            toValue: 1.08,
            duration: 1400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(splashTranslateY, {
            toValue: -12,
            duration: 1400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 280,
          delay: 120,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.replace('/scan');
      });
    };

    runIntro();

    return () => {
      isMounted = false;
    };
  }, [router, screenOpacity, splashScale, splashTranslateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenOpacity,
        },
      ]}
    >
      <Animated.Image
        source={require('../assets/splash.png')}
        style={[
          styles.splash,
          {
            transform: [
              { scale: splashScale },
              { translateY: splashTranslateY },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splash: {
    width: '100%',
    height: '100%',
  },
});