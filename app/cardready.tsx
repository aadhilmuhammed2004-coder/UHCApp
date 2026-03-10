import { useLocalSearchParams, useRouter } from 'expo-router';
import CardReadyScreen from '../screens/CardReadyScreen';

export default function CardReadyRoute() {
	const router = useRouter();
	const params = useLocalSearchParams();

	const navigation = {
		navigate: (name: string) => router.push(`/${String(name).toLowerCase()}` as never),
		goBack: () => router.back(),
	};

	const route = {
		params: {
			nfc_uid: typeof params.nfc_uid === 'string' ? params.nfc_uid : '',
			name: typeof params.name === 'string' ? params.name : '',
		},
	};

	return <CardReadyScreen route={route} navigation={navigation} />;
}