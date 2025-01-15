import { Button, StyleSheet, Text, View } from "react-native";
import { OPEN_SANS_REGULAR } from "../../utils/const";
import { NavigationProp, useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  review: {
    fontSize: 30,
    fontFamily: OPEN_SANS_REGULAR,
  },
});

const DetailScreen = () => {
  const navigation : NavigationProp<RootStackParamList> = useNavigation();

  return (
    <View>
      <Text style={styles.review}> Detail Screen Google</Text>
      <Button
        title="Back to Home"
        onPress={() => navigation.navigate("HomePos")}
      />
    </View>
  );
};

export default DetailScreen;
