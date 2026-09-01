import { Redirect } from 'expo-router';
import './global.css';

export default function homeScreen() {
  return <Redirect href="/(tabs)/home" />;
}