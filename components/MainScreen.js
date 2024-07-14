// src/components/MainScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, Text, FlatList, TouchableOpacity, Linking, SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ref, set, push, onValue, remove, update } from 'firebase/database';
import { database } from '../services/firebase';
import styles from '../styles/styles';
import { registerForPushNotificationsAsync, scheduleNotification } from '../services/notificationService';

const MainScreen = () => {
  const [problemName, setProblemName] = useState('');
  const [problemLink, setProblemLink] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [timeTaken, setTimeTaken] = useState(0);
  const [firstAttemptDate, setFirstAttemptDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [revisitFrequency, setRevisitFrequency] = useState(14);
  const [revisitDate, setRevisitDate] = useState(new Date());
  const [lastRevisitDate, setLastRevisitDate] = useState(new Date());
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [companyTags, setCompanyTags] = useState('');
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
    const currentDate = selectedDate || firstAttemptDate;
    setShowFirstAttemptDatePicker(false);
    setFirstAttemptDate(currentDate);
  };

  const onRevisitDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowRevisitDatePicker(false);
    setRevisitDate(currentDate);
  };

  const onLastRevisitDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowLastRevisitDatePicker(false);
    setLastRevisitDate(currentDate);
  };

  const handleAddOrUpdateProblem = () => {
    const calculatedRevisitDate = new Date(firstAttemptDate);
    calculatedRevisitDate.setDate(calculatedRevisitDate.getDate() + revisitFrequency);

    const data = {
      problemName,
      problemLink,
      difficultyLevel,
      timeTaken,
      firstAttemptDate: firstAttemptDate.toISOString().split('T')[0],
      notes,
      revisitDate: calculatedRevisitDate.toISOString().split('T')[0],
      lastRevisitDate: lastRevisitDate.toISOString().split('T')[0],
      revisitFrequency,
      timeComplexity,
      spaceComplexity,
      companyTags,
    };

    if (editingIndex === -1) {
      const newRecordRef = push(ref(database, 'records'));
      set(newRecordRef, data);
    } else {
      const recordRef = ref(database, `records/${records[editingIndex].id}`);
      update(recordRef, data);
      setEditingIndex(-1);
    }

    scheduleNotification(
      'Time to revisit a problem!',
      `It's time to revisit the problem: ${problemName}`,
      calculatedRevisitDate
    );

    setProblemName('');
    setProblemLink('');
    setDifficultyLevel('');
    setTimeTaken(0);
    setFirstAttemptDate(new Date());
    setNotes('');
    setRevisitDate(new Date());
    setLastRevisitDate(new Date());
    setRevisitFrequency(14);
    setTimeComplexity('');
    setSpaceComplexity('');
    setCompanyTags('');
  };

  const editProblem = (index) => {
    const problem = records[index];
    setProblemName(problem.problemName);
    setProblemLink(problem.problemLink);
    setDifficultyLevel(problem.difficultyLevel);
    setTimeTaken(problem.timeTaken);
    setFirstAttemptDate(new Date(problem.firstAttemptDate));
    setNotes(problem.notes);
    setRevisitDate(new Date(problem.revisitDate));
    setLastRevisitDate(new Date(problem.lastRevisitDate));
    setRevisitFrequency(problem.revisitFrequency);
    setTimeComplexity(problem.timeComplexity);
    setSpaceComplexity(problem.spaceComplexity);
    setCompanyTags(problem.companyTags);
    setEditingIndex(index);
  };

  const deleteProblem = (index) => {
    const recordRef = ref(database, `records/${records[index].id}`);
    remove(recordRef);
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Problem Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Problem Name"
          value={problemName}
          onChangeText={setProblemName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Problem Link</Text>
        <TextInput
          style={styles.input}
          placeholder="Problem Link"
          value={problemLink}
          onChangeText={setProblemLink}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Difficulty Level</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={difficultyLevel}
            style={styles.picker}
            onValueChange={(itemValue) => setDifficultyLevel(itemValue)}
          >
            <Picker.Item label="Select Difficulty Level" value="" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Time Taken (minutes)</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={timeTaken}
            style={styles.picker}
            onValueChange={(itemValue) => setTimeTaken(itemValue)}
          >
            {[...Array(121).keys()].map((val) => (
              <Picker.Item key={val} label={`${val}`} value={val} />
            ))}
            <Picker.Item label="Greater than 120" value=">120" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>First Attempt Date</Text>
        <TouchableOpacity onPress={() => setShowFirstAttemptDatePicker(true)} style={styles.dateButton}>
          <Text>{firstAttemptDate.toDateString()}</Text>
        </TouchableOpacity>
        {showFirstAttemptDatePicker && (
          <DateTimePicker
            value={firstAttemptDate}
            mode="date"
            display="default"
            onChange={onFirstAttemptDateChange}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.input}
          placeholder="Notes"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Revisit Date</Text>
        <TouchableOpacity onPress={() => setShowRevisitDatePicker(true)} style={styles.dateButton}>
          <Text>{revisitDate.toDateString()}</Text>
        </TouchableOpacity>
        {showRevisitDatePicker && (
          <DateTimePicker
            value={revisitDate}
            mode="date"
            display="default"
            onChange={onRevisitDateChange}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Revisit Date</Text>
        <TouchableOpacity onPress={() => setShowLastRevisitDatePicker(true)} style={styles.dateButton}>
          <Text>{lastRevisitDate.toDateString()}</Text>
        </TouchableOpacity>
        {showLastRevisitDatePicker && (
          <DateTimePicker
            value={lastRevisitDate}
            mode="date"
            display="default"
            onChange={onLastRevisitDateChange}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Revisit Frequency (days)</Text>
        <TextInput
          style={styles.input}
          placeholder="Revisit Frequency (days)"
          keyboardType="numeric"
          value={revisitFrequency.toString()}
          onChangeText={(text) => setRevisitFrequency(Number(text))}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Time Complexity</Text>
        <TextInput
          style={styles.input}
          placeholder="Time Complexity"
          value={timeComplexity}
          onChangeText={setTimeComplexity}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Space Complexity</Text>
        <TextInput
          style={styles.input}
          placeholder="Space Complexity"
          value={spaceComplexity}
          onChangeText={setSpaceComplexity}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Company Tags</Text>
        <TextInput
          style={styles.input}
          placeholder="Company Tags"
          value={companyTags}
          onChangeText={setCompanyTags}
        />
      </View>

      <View style={styles.formGroup}>
        <Button
          title={editingIndex === -1 ? "Add Problem" : "Update Problem"}
          onPress={handleAddOrUpdateProblem}
        />
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.record}>
      <TouchableOpacity onPress={() => editProblem(index)}>
        <Text style={styles.recordText}>{item.problemName}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(item.problemLink)}>
        <Text style={[styles.recordText, styles.link]}>{item.problemLink}</Text>
      </TouchableOpacity>
      <Text style={styles.recordText}>{item.difficultyLevel}</Text>
      <Text style={styles.recordText}>{item.timeTaken}</Text>
      <Text style={styles.recordText}>{item.firstAttemptDate}</Text>
      <Text style={styles.recordText}>{item.notes}</Text>
      <Text style={styles.recordText}>{item.revisitDate}</Text>
      <Text style={styles.recordText}>{item.lastRevisitDate}</Text>
      <Text style={styles.recordText}>{item.revisitFrequency}</Text>
      <Text style={styles.recordText}>{item.timeComplexity}</Text>
      <Text style={styles.recordText}>{item.spaceComplexity}</Text>
      <Text style={styles.recordText}>{item.companyTags}</Text>
      <Button title="Delete" onPress={() => deleteProblem(index)} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderForm}
        data={records}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

export default MainScreen;

