import { useRouter } from 'expo-router';
import ScanScreen from '../screens/ScanScreen';

export default function ScanRoute() {
	const router = useRouter();

	const navigation = {
		navigate: (name: string) => router.push(`/${String(name).toLowerCase()}` as never),
		goBack: () => router.back(),
	};

	return <ScanScreen navigation={navigation} />;
}