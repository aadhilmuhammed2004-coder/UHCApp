import { useRouter } from 'expo-router';
import SetupScreen from '../screens/SetupScreen';

export default function SetupRoute() {
	const router = useRouter();

	const navigation = {
		navigate: (name: string, params?: Record<string, string>) =>
			router.push({ pathname: `/${String(name).toLowerCase()}`, params } as never),
		goBack: () => router.back(),
	};

	return <SetupScreen navigation={navigation} />;
}