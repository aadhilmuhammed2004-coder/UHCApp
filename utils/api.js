import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export async function getApiUrl() {
  try {
    const stored = await AsyncStorage.getItem('api_base_url');
    return stored || API_BASE_URL;
  } catch {
    return API_BASE_URL;
  }
}
