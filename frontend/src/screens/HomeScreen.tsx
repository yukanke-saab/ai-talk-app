import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Home'>;

/**
 * ホーム画面コンポーネント
 * @returns {JSX.Element} ホーム画面要素
 */
export default function HomeScreen(): JSX.Element {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // 仮のAIキャラクターデータ
  const aiCharacters = [
    { id: '1', name: 'AI アシスタント' },
    { id: '2', name: 'AI フレンド' },
    { id: '3', name: 'AI コーチ' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AIキャラクター</Text>
      <Text style={styles.subtitle}>通話したいAIを選択してください</Text>
      
      {aiCharacters.map((ai) => (
        <View key={ai.id} style={styles.aiItem}>
          <Text style={styles.aiName}>{ai.name}</Text>
          <Button
            title="通話"
            onPress={() => navigation.navigate('Call', { aiId: ai.id })}
          />
        </View>
      ))}
      
      <View style={styles.buttonContainer}>
        <Button
          title="プロフィール"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
  },
  aiItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  aiName: {
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 32,
  },
});
