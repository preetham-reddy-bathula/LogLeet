import React from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles/styles';

const LoginScreen = ({ navigation }) => {
  const { control, handleSubmit } = useForm();

  const onLogin = async (data) => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigation.replace('Main');
    } catch (error) {
      console.error('Login error', error);
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
          )}
        />
      </View>
      <Button mode="contained" onPress={handleSubmit(onLogin)} style={styles.button}>
        Login
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Signup')} style={styles.link}>
        Don't have an account? Sign up
      </Button>
    </View>
  );
};

export default LoginScreen;
