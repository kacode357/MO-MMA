import ClipdropRemoveBackground from '@/components/ClipdropRemoveBackground';
import GeminiChatBot from '@/components/GeminiChatBot';
import GeminiImage from '@/components/GeminiImage';
import GeminiImageToImage from '@/components/GeminiImageToImage';
import SignLanguageComponent from '@/components/SignLanguageComponent';
import TheHiveImage from '@/components/TheHiveImage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';

export default function AllModelScreen() {
  const { first_supported_feature, ai_model, package_id } = useLocalSearchParams();
  console.log('Params:', { first_supported_feature, ai_model, package_id });

  // Normalize params to strings with fallback
  const packageIdString = Array.isArray(package_id) ? package_id[0] : package_id ?? '';
  const featureString = Array.isArray(first_supported_feature) ? first_supported_feature[0] : first_supported_feature ?? '';
  const aiModelString = Array.isArray(ai_model) ? ai_model[0] : ai_model ?? '';

  if (ai_model === 'gemini' && first_supported_feature === 'text') {
    return <GeminiChatBot package_id={packageIdString} first_supported_feature={featureString} ai_model={aiModelString} />;
  }
  if (ai_model === 'thehive' && first_supported_feature === 'image') {
    return <TheHiveImage package_id={packageIdString} first_supported_feature={featureString} ai_model={aiModelString} />;
  }
  if (ai_model === 'gemini' && first_supported_feature === 'image') {
    return <GeminiImage package_id={packageIdString} first_supported_feature={featureString} ai_model={aiModelString} />;
  }
  if (ai_model === 'gemini' && first_supported_feature === 'image_to_image') {
    return <GeminiImageToImage package_id={packageIdString} first_supported_feature={featureString} ai_model={aiModelString} />;
  }
  if (ai_model === 'clipdrop' && first_supported_feature === 'remove_background') {
    return <ClipdropRemoveBackground package_id={packageIdString} first_supported_feature={featureString} ai_model={aiModelString} />;
  }
  if (ai_model === 'signlanguage' && first_supported_feature === 'signlanguage') {
    return <SignLanguageComponent />;
  }

  return (
    <ThemedView>
      <ThemedText>No matching component found for the provided params.</ThemedText>
    </ThemedView>
  );
}