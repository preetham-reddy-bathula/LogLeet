// src/components/MainScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, Text, FlatList, TouchableOpacity, Linking, TouchableWithoutFeedback, SafeAreaView
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
    const data = {
      problemName,
      problemLink,
      difficultyLevel,
      timeTaken,
      firstAttemptDate,
      notes,
      revisitDate: calculateRevisitDate(firstAttemptDate, revisitFrequency),
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
  
    const editProblem = (index) => {
      const problem = records[index];
      setProblemName(problem[0]);
      setProblemLink(problem[1]);
      setDifficultyLevel(problem[2]);
      setTimeTaken(problem[3]);
      setFirstAttemptDate(new Date(problem[4]));
      setNotes(problem[5]);
      setRevisitDate(new Date(problem[6]));
      setLastRevisitDate(new Date(problem[7]));
      setRevisitFrequency(problem[8]);
      setTimeComplexity(problem[9]);
      setSpaceComplexity(problem[10]);
      setCompanyTags(problem[11]);
      setEditingIndex(index);
    };
  
    const renderItem = ({ item, index }) => (
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
    );
  
    return (
      <SafeAreaView style={styles.container}>
        {!isConnected ? (
          <View style={styles.connectionForm}>
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
          <FlatList
            ListHeaderComponent={renderForm}
            data={records}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        )}
      </SafeAreaView>
    );
  };
  
  export default MainScreen;
  