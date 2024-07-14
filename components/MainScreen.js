import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, Text, FlatList, TouchableOpacity, Linking
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { calculateRevisitDate } from '../utils/dateUtils';
import { fetchData, addProblem, updateProblem, deleteProblem } from '../services/googleSheetsService';
import styles from '../styles/styles';

const MainScreen = () => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [problemName, setProblemName] = useState('');
  const [problemLink, setProblemLink] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [timeTaken, setTimeTaken] = useState(0);
  const [firstAttemptDate, setFirstAttemptDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [revisitFrequency, setRevisitFrequency] = useState(14);
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [companyTags, setCompanyTags] = useState('');
  const [records, setRecords] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showFirstAttemptDatePicker, setShowFirstAttemptDatePicker] = useState(false);
  const [showRevisitDatePicker, setShowRevisitDatePicker] = useState(false);
  const [revisitDate, setRevisitDate] = useState(new Date());
  const [lastRevisitDate, setLastRevisitDate] = useState(new Date());
  const [showLastRevisitDatePicker, setShowLastRevisitDatePicker] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchData(spreadsheetId, apiKey, setRecords);
    }
  }, [isConnected]);

  const onFirstAttemptDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || firstAttemptDate;
    setShowFirstAttemptDatePicker(false);
    setFirstAttemptDate(currentDate);
  };

  const onRevisitDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || revisitDate;
    setShowRevisitDatePicker(false);
    setRevisitDate(currentDate);
  };

  const onLastRevisitDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || lastRevisitDate;
    setShowLastRevisitDatePicker(false);
    setLastRevisitDate(currentDate);
  };

  const handleAddOrUpdateProblem = () => {
    const data = {
      problemName,
      problemLink,
      difficultyLevel,
      timeTaken,
      firstAttemptDate,
      notes,
      revisitDate,
      lastRevisitDate,
      revisitFrequency,
      timeComplexity,
      spaceComplexity,
      companyTags,
    };

    if (editingIndex === -1) {
      addProblem(spreadsheetId, apiKey, data, setRecords, scheduleNotification);
    } else {
      updateProblem(spreadsheetId, apiKey, data, editingIndex, setRecords, scheduleNotification);
      setEditingIndex(-1);
    }

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

  const scheduleNotification = async (date) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to revisit a problem!",
        body: 'Check your LogLeet app for details.',
      },
      trigger: {
        date: new Date(date),
      },
    });
  };

  return (
    <View style={styles.container}>
      {!isConnected ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter Spreadsheet ID"
            value={spreadsheetId}
            onChangeText={setSpreadsheetId}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter API Key"
            value={apiKey}
            onChangeText={setApiKey}
          />
          <Button title="Connect" onPress={() => setIsConnected(true)} />
        </View>
      ) : (
        <View style={{ flex: 1, width: '100%' }}>
          <TextInput
            style={styles.input}
            placeholder="Problem Name"
            value={problemName}
            onChangeText={setProblemName}
          />
          <TextInput
            style={styles.input}
            placeholder="Problem Link"
            value={problemLink}
            onChangeText={setProblemLink}
          />
          <Picker
            selectedValue={difficultyLevel}
            style={styles.input}
            onValueChange={(itemValue) => setDifficultyLevel(itemValue)}
          >
            <Picker.Item label="Select Difficulty Level" value="" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
          <Text>Time Taken (minutes)</Text>
          <Picker
            selectedValue={timeTaken}
            style={styles.input}
            onValueChange={(itemValue) => setTimeTaken(itemValue)}
          >
            {[...Array(121).keys()].map((val) => (
              <Picker.Item key={val} label={`${val}`} value={val} />
            ))}
            <Picker.Item label="Greater than 120" value=">120" />
          </Picker>
          <Text>First Attempt Date</Text>
          <Button onPress={() => setShowFirstAttemptDatePicker(true)} title={firstAttemptDate.toDateString()} />
          {showFirstAttemptDatePicker && (
            <DateTimePicker
              value={firstAttemptDate}
              mode="date"
              display="default"
              onChange={onFirstAttemptDateChange}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
          />
          <Text>Revisit Date</Text>
          <Button onPress={() => setShowRevisitDatePicker(true)} title={revisitDate.toDateString()} />
          {showRevisitDatePicker && (
            <DateTimePicker
              value={revisitDate}
              mode="date"
              display="default"
              onChange={onRevisitDateChange}
            />
          )}
          <Text>Last Revisit Date</Text>
          <Button onPress={() => setShowLastRevisitDatePicker(true)} title={lastRevisitDate.toDateString()} />
          {showLastRevisitDatePicker && (
            <DateTimePicker
              value={lastRevisitDate}
              mode="date"
              display="default"
              onChange={onLastRevisitDateChange}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Revisit Frequency (days)"
            keyboardType="numeric"
            value={revisitFrequency.toString()}
            onChangeText={(text) => setRevisitFrequency(Number(text))}
          />
          <TextInput
            style={styles.input}
            placeholder="Time Complexity"
            value={timeComplexity}
            onChangeText={setTimeComplexity}
          />
          <TextInput
            style={styles.input}
            placeholder="Space Complexity"
            value={spaceComplexity}
            onChangeText={setSpaceComplexity}
          />
          <TextInput
            style={styles.input}
            placeholder="Company Tags"
            value={companyTags}
            onChangeText={setCompanyTags}
          />
          <Button
            title={editingIndex === -1 ? "Add Problem" : "Update Problem"}
            onPress={handleAddOrUpdateProblem}
          />
          <FlatList
            data={records}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.record}>
                <TouchableOpacity onPress={() => editProblem(index)}>
                  <Text style={styles.recordText}>{item[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL(item[1])}>
                  <Text style={[styles.recordText, styles.link]}>{item[1]}</Text>
                </TouchableOpacity>
                <Text style={styles.recordText}>{item[2]}</Text>
                <Text style={styles.recordText}>{item[3]}</Text>
                <Text style={styles.recordText}>{item[4]}</Text>
                <Text style={styles.recordText}>{item[5]}</Text>
                <Text style={styles.recordText}>{item[6]}</Text>
                <Text style={styles.recordText}>{item[7]}</Text>
                <Text style={styles.recordText}>{item[8]}</Text>
                <Text style={styles.recordText}>{item[9]}</Text>
                <Text style={styles.recordText}>{item[10]}</Text>
                <Text style={styles.recordText}>{item[11]}</Text>
                <Button title="Delete" onPress={() => deleteProblem(spreadsheetId, apiKey, index, setRecords)} />
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default MainScreen;

