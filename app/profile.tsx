import { useLocalSearchParams, useRouter } from 'expo-router';
import ProfileScreen from '../screens/ProfileScreen';

export default function ProfileRoute() {
	const router = useRouter();
	const params = useLocalSearchParams();

	const navigation = {
		navigate: (name: string) => router.push(`/${String(name).toLowerCase()}` as never),
		goBack: () => router.back(),
	};

	const patient =
		typeof params.patient === 'string'
			? JSON.parse(params.patient)
			: {
					name: '',
					age: '',
					gender: '',
					blood_group: '',
					phone: '',
					height: '',
					weight: '',
					health_score: 0,
					nfc_uid: '',
					address: '',
				};

	const route = { params: { patient } };

	return <ProfileScreen route={route} navigation={navigation} />;
}