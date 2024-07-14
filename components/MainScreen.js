import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, Text, FlatList, TouchableOpacity, Linking, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelector from 'react-native-modal-selector';
import { ref, set, push, onValue, remove, update } from 'firebase/database';
import { database } from '../services/firebase';
import styles from '../styles/styles';
import { registerForPushNotificationsAsync, scheduleNotification } from '../services/notificationService';

const MainScreen = () => {
  const { control, handleSubmit, reset, setValue } = useForm();
  const [records, setRecords] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showFirstAttemptDatePicker, setShowFirstAttemptDatePicker] = useState(false);
  const [showRevisitDatePicker, setShowRevisitDatePicker] = useState(false);
  const [showLastRevisitDatePicker, setShowLastRevisitDatePicker] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const recordsRef = ref(database, 'records/');
    onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      const recordsList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setRecords(recordsList);
    });
  }, []);

  const onFirstAttemptDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowFirstAttemptDatePicker(false);
    setValue('firstAttemptDate', currentDate);
  };

  const onRevisitDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowRevisitDatePicker(false);
    setValue('revisitDate', currentDate);
  };

  const onLastRevisitDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowLastRevisitDatePicker(false);
    setValue('lastRevisitDate', currentDate);
  };

  const handleAddOrUpdateProblem = (data) => {
    const firstAttemptDate = data.firstAttemptDate instanceof Date ? data.firstAttemptDate : new Date(data.firstAttemptDate);
    const lastRevisitDate = data.lastRevisitDate instanceof Date ? data.lastRevisitDate : new Date(data.lastRevisitDate);

    const calculatedRevisitDate = new Date(firstAttemptDate);
    calculatedRevisitDate.setDate(calculatedRevisitDate.getDate() + data.revisitFrequency);

    const recordData = {
      ...data,
      firstAttemptDate: firstAttemptDate.toISOString().split('T')[0],
      lastRevisitDate: lastRevisitDate.toISOString().split('T')[0],
      revisitDate: calculatedRevisitDate.toISOString().split('T')[0],
    };

    if (editingIndex === -1) {
      const newRecordRef = push(ref(database, 'records'));
      set(newRecordRef, recordData);
    } else {
      const recordRef = ref(database, `records/${records[editingIndex].id}`);
      update(recordRef, recordData);
      setEditingIndex(-1);
    }

    scheduleNotification(
      'Time to revisit a problem!',
      `It's time to revisit the problem: ${data.problemName}`,
      calculatedRevisitDate
    );

    reset();
  };

  const editProblem = (index) => {
    const problem = records[index];
    Object.keys(problem).forEach((key) => setValue(key, problem[key]));
    setEditingIndex(index);
  };

  const deleteProblem = (index) => {
    const recordRef = ref(database, `records/${records[index].id}`);
    remove(recordRef);
    setEditingIndex(-1);
    reset();
  };

  const timeTakenOptions = [...Array(121).keys()].map((val) => ({ key: val, label: `${val}` }));
  timeTakenOptions.push({ key: '>120', label: 'Greater than 120' });

  const difficultyLevelOptions = [
    { key: 'easy', label: 'Easy' },
    { key: 'medium', label: 'Medium' },
    { key: 'hard', label: 'Hard' },
  ];

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Problem Name</Text>
        <Controller
          control={control}
          name="problemName"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Problem Name"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Problem Link</Text>
        <Controller
          control={control}
          name="problemLink"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Problem Link"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Difficulty Level</Text>
        <Controller
          control={control}
          name="difficultyLevel"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <ModalSelector
              data={difficultyLevelOptions}
              initValue="Select Difficulty Level"
              onChange={(option) => onChange(option.key)}
              style={styles.modalSelector}
            >
              <TextInput
                style={styles.input}
                editable={false}
                placeholder="Select Difficulty Level"
                value={difficultyLevelOptions.find(option => option.key === value)?.label}
              />
            </ModalSelector>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Time Taken (minutes)</Text>
        <Controller
          control={control}
          name="timeTaken"
          defaultValue={0}
          render={({ field: { onChange, value } }) => (
            <ModalSelector
              data={timeTakenOptions}
              initValue="Select Time Taken"
              onChange={(option) => onChange(option.key)}
              style={styles.modalSelector}
            >
              <TextInput
                style={styles.input}
                editable={false}
                placeholder="Select Time Taken"
                value={value === '>120' ? 'Greater than 120' : `${value}`}
              />
            </ModalSelector>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>First Attempt Date</Text>
        <Controller
          control={control}
          name="firstAttemptDate"
          defaultValue={new Date()}
          render={({ field: { value } }) => (
            <>
              <TouchableOpacity onPress={() => setShowFirstAttemptDatePicker(true)} style={styles.dateButton}>
                <Text>{new Date(value).toDateString()}</Text>
              </TouchableOpacity>
              {showFirstAttemptDatePicker && (
                <DateTimePicker
                  value={new Date(value)}
                  mode="date"
                  display="default"
                  onChange={onFirstAttemptDateChange}
                />
              )}
            </>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Notes"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Revisit Date</Text>
        <Controller
          control={control}
          name="revisitDate"
          defaultValue={new Date()}
          render={({ field: { value } }) => (
            <>
              <TouchableOpacity onPress={() => setShowRevisitDatePicker(true)} style={styles.dateButton}>
                <Text>{new Date(value).toDateString()}</Text>
              </TouchableOpacity>
              {showRevisitDatePicker && (
                <DateTimePicker
                  value={new Date(value)}
                  mode="date"
                  display="default"
                  onChange={onRevisitDateChange}
                />
              )}
            </>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Revisit Date</Text>
        <Controller
          control={control}
          name="lastRevisitDate"
          defaultValue={new Date()}
          render={({ field: { value } }) => (
            <>
              <TouchableOpacity onPress={() => setShowLastRevisitDatePicker(true)} style={styles.dateButton}>
                <Text>{new Date(value).toDateString()}</Text>
              </TouchableOpacity>
              {showLastRevisitDatePicker && (
                <DateTimePicker
                  value={new Date(value)}
                  mode="date"
                  display="default"
                  onChange={onLastRevisitDateChange}
                />
              )}
            </>
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Revisit Frequency (days)</Text>
        <Controller
          control={control}
          name="revisitFrequency"
          defaultValue={14}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Revisit Frequency (days)"
              keyboardType="numeric"
              value={value.toString()}
              onChangeText={(text) => onChange(Number(text))}
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Time Complexity</Text>
        <Controller
          control={control}
          name="timeComplexity"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Time Complexity"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Space Complexity</Text>
        <Controller
          control={control}
          name="spaceComplexity"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Space Complexity"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Company Tags</Text>
        <Controller
          control={control}
          name="companyTags"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Company Tags"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Button
          title={editingIndex === -1 ? "Add Problem" : "Update Problem"}
          onPress={handleSubmit(handleAddOrUpdateProblem)}
        />
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.record}>
      <Text style={styles.label}>Problem Name: </Text>
      <TouchableOpacity onPress={() => editProblem(index)}>
        <Text style={styles.recordText}>{item.problemName}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Problem Link: </Text>
      <TouchableOpacity onPress={() => Linking.openURL(item.problemLink)}>
        <Text style={[styles.recordText, styles.link]}>{item.problemLink}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Difficulty Level: </Text>
      <Text style={styles.recordText}>{item.difficultyLevel}</Text>

      <Text style={styles.label}>Time Taken: </Text>
      <Text style={styles.recordText}>{item.timeTaken}</Text>

      <Text style={styles.label}>First Attempt Date: </Text>
      <Text style={styles.recordText}>{item.firstAttemptDate}</Text>

      <Text style={styles.label}>Notes: </Text>
      <Text style={styles.recordText}>{item.notes}</Text>

      <Text style={styles.label}>Revisit Date: </Text>
      <Text style={styles.recordText}>{item.revisitDate}</Text>

      <Text style={styles.label}>Last Revisit Date: </Text>
      <Text style={styles.recordText}>{item.lastRevisitDate}</Text>

      <Text style={styles.label}>Revisit Frequency: </Text>
      <Text style={styles.recordText}>{item.revisitFrequency}</Text>

      <Text style={styles.label}>Time Complexity: </Text>
      <Text style={styles.recordText}>{item.timeComplexity}</Text>

      <Text style={styles.label}>Space Complexity: </Text>
      <Text style={styles.recordText}>{item.spaceComplexity}</Text>

      <Text style={styles.label}>Company Tags: </Text>
      <Text style={styles.recordText}>{item.companyTags}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={() => editProblem(index)} />
        <Button title="Delete" onPress={() => deleteProblem(index)} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <SafeAreaView style={styles.container}>
        <FlatList
          ListHeaderComponent={renderForm}
          data={records}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default MainScreen;

