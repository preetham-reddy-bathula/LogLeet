import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Modal, StyleSheet
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelector from 'react-native-modal-selector';
import { ref, set, push, onValue, remove, update } from 'firebase/database';
import { database } from '../services/firebase';
import { registerForPushNotificationsAsync, scheduleNotification } from '../services/notificationService';

const MainScreen = () => {
  const { control, handleSubmit, reset, setValue } = useForm();
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

    if (selectedRecord) {
      const recordRef = ref(database, `records/${selectedRecord.id}`);
      update(recordRef, recordData);
    } else {
      const newRecordRef = push(ref(database, 'records'));
      set(newRecordRef, recordData);
    }

    scheduleNotification(
      'Time to revisit a problem!',
      `It's time to revisit the problem: ${data.problemName}`,
      calculatedRevisitDate
    );

    reset();
    setSelectedRecord(null);
    setShowForm(false);
  };

  const editProblem = (record) => {
    setSelectedRecord(record);
    Object.keys(record).forEach((key) => setValue(key, record[key]));
    setShowForm(true);
  };

  const deleteProblem = (record) => {
    const recordRef = ref(database, `records/${record.id}`);
    remove(recordRef);
    setSelectedRecord(null);
  };

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
              data={[
                { key: 'easy', label: 'Easy' },
                { key: 'medium', label: 'Medium' },
                { key: 'hard', label: 'Hard' },
              ]}
              initValue="Select Difficulty Level"
              onChange={(option) => onChange(option.key)}
              style={styles.modalSelector}
            >
              <TextInput
                style={styles.input}
                editable={false}
                placeholder="Select Difficulty Level"
                value={value}
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
              data={[...Array(121).keys()].map((val) => ({ key: val, label: `${val}` })).concat({ key: '>120', label: 'Greater than 120' })}
              initValue="Select Time Taken"
              onChange={(option) => onChange(option.key)}
              style={styles.modalSelector}
            >
              <TextInput
                style={styles.input}
                editable={false}
                placeholder="Select Time Taken"
                value={value}
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

    <View style={styles.buttonGroup}>
      <Button
        mode="contained"
        onPress={handleSubmit(handleAddOrUpdateProblem)}
        style={styles.button}
      >
        {selectedRecord ? "Update Problem" : "Add Problem"}
      </Button>
      <Button
        mode="contained"
        onPress={() => {
          setShowForm(false);
          reset();
          setSelectedRecord(null);
        }}
        style={styles.button}
      >
        Cancel
      </Button>
    </View>
  </View>
);

const renderListItem = ({ item }) => (
  <TouchableOpacity onPress={() => editProblem(item)} style={styles.listItem}>
    <Text style={styles.listItemText}>{item.problemName}</Text>
    <Text style={styles.listItemText}>{item.revisitDate}</Text>
  </TouchableOpacity>
);

return (
  <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
    <SafeAreaView style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
      />
      <TouchableOpacity
        style={styles.newProblemButton}
        onPress={() => setShowForm(true)}
      >
        <Text style={styles.newProblemButtonText}>New Problem</Text>
      </TouchableOpacity>
      <Modal
        visible={showForm}
        animationType="slide"
      >
        <SafeAreaView style={styles.container}>
          <FlatList
            ListHeaderComponent={renderForm}
            data={[]}
            keyExtractor={(item, index) => index.toString()}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  </KeyboardAvoidingView>
);
};

export default MainScreen;

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#f5f5f5',
},
formContainer: {
  padding: 20,
},
formGroup: {
  marginBottom: 15,
},
label: {
  marginBottom: 5,
  fontWeight: 'bold',
},
input: {
  height: 40,
  borderColor: 'gray',
  borderWidth: 1,
  paddingLeft: 10,
  backgroundColor: '#fff',
  borderRadius: 5,
},
dateButton: {
  height: 40,
  justifyContent: 'center',
  paddingLeft: 10,
  borderColor: 'gray',
  borderWidth: 1,
  backgroundColor: '#fff',
  borderRadius: 5,
},
modalSelector: {
  borderColor: 'gray',
  borderWidth: 1,
  borderRadius: 5,
  backgroundColor: '#fff',
},
listItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
},
listItemText: {
  fontSize: 16,
},
newProblemButton: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: '#007bff',
  borderRadius: 30,
  padding: 15,
},
newProblemButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
buttonGroup: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
button: {
  margin: 10,
},
});
