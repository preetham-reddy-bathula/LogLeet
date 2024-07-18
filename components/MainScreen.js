import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Modal, StatusBar, Alert, BackHandler, ScrollView
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button, Appbar, Avatar, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelector from 'react-native-modal-selector';
import { ref, set, push, onValue, remove, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { database } from '../services/firebase';
import { scheduleNotification } from '../services/notificationService';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/styles';
import axios from 'axios';

const MainScreen = () => {
  const { control, handleSubmit, reset, setValue, watch } = useForm();
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFirstAttemptDatePicker, setShowFirstAttemptDatePicker] = useState(false);
  const [showLastVisitedDatePicker, setShowLastVisitedDatePicker] = useState(false);
  const [showNextVisitDatePicker, setShowNextVisitDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [problemSuggestions, setProblemSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const navigation = useNavigation();

  const firstAttemptDate = watch('firstAttemptDate');
  const revisitFrequency = watch('revisitFrequency');
  const user = getAuth().currentUser;
  const userInitial = (user?.email[0] || '').toUpperCase();
  const userUid = user ? user.uid : null;

  useEffect(() => {
    if (userUid) {
      const recordsRef = ref(database, `users/${userUid}/records`);
      onValue(recordsRef, (snapshot) => {
        const data = snapshot.val();
        const recordsList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setRecords(recordsList);
      });
    }
  }, [userUid]);

  useLayoutEffect(() => {
    const backAction = () => {
      if (showForm) {
        setShowForm(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showForm]);

  useEffect(() => {
    if (firstAttemptDate) {
      setValue('lastVisitedDate', new Date(firstAttemptDate));
    }
  }, [firstAttemptDate]);

  useEffect(() => {
    if (firstAttemptDate && revisitFrequency) {
      const nextVisitDate = new Date(firstAttemptDate);
      nextVisitDate.setDate(nextVisitDate.getDate() + revisitFrequency);
      setValue('nextVisitDate', nextVisitDate);
    }
  }, [firstAttemptDate, revisitFrequency]);

  const onFirstAttemptDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowFirstAttemptDatePicker(false);
    setValue('firstAttemptDate', currentDate);
  };

  const onLastVisitedDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowLastVisitedDatePicker(false);
    setValue('lastVisitedDate', currentDate);
  };

  const onNextVisitDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowNextVisitDatePicker(false);
    setValue('nextVisitDate', currentDate);
  };

  const handleAddOrUpdateProblem = (data) => {
    if (!userUid) return;

    const firstAttemptDate = data.firstAttemptDate instanceof Date ? data.firstAttemptDate : new Date(data.firstAttemptDate);
    const lastVisitedDate = data.lastVisitedDate instanceof Date ? data.lastVisitedDate : new Date(data.lastVisitedDate);
    const nextVisitDate = data.nextVisitDate instanceof Date ? data.nextVisitDate : new Date(data.nextVisitDate);

    const recordData = {
      ...data,
      firstAttemptDate: firstAttemptDate.toISOString().split('T')[0],
      lastVisitedDate: lastVisitedDate.toISOString().split('T')[0],
      nextVisitDate: nextVisitDate.toISOString().split('T')[0],
    };

    if (selectedRecord) {
      const recordRef = ref(database, `users/${userUid}/records/${selectedRecord.id}`);
      update(recordRef, recordData);
    } else {
      const newRecordRef = push(ref(database, `users/${userUid}/records`));
      set(newRecordRef, recordData);
    }

    scheduleNotification(
      'Time to revisit a problem!',
      `It's time to revisit the problem: ${data.problemName}`,
      nextVisitDate
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
    if (!userUid) return;

    const recordRef = ref(database, `users/${userUid}/records/${record.id}`);
    remove(recordRef);
    setSelectedRecord(null);
  };

  const handleLongPress = (record) => {
    Alert.alert(
      "Delete Problem",
      "Are you sure you want to delete this problem?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProblem(record)
        }
      ]
    );
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const logout = () => {
    getAuth().signOut();
  };

  const fetchProblemSuggestions = async (query) => {
    if (!query) {
      setProblemSuggestions([]);
      return;
    }

    setIsFetchingSuggestions(true);

    try {
      const response = await axios.post('https://leetcode.com/graphql', {
        query: `
          query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
            problemsetQuestionList: questionList(
              categorySlug: $categorySlug
              limit: $limit
              skip: $skip
              filters: $filters
            ) {
              questions: data {
                title
                titleSlug
              }
            }
          }
        `,
        variables: {
          categorySlug: "",
          skip: 0,
          limit: 100000,
          filters: {}
        }
      });

      const problems = response.data.data.problemsetQuestionList.questions;
      const filteredProblems = problems.filter(problem => problem.title.toLowerCase().includes(query.toLowerCase()));
      setProblemSuggestions(filteredProblems);
    } catch (error) {
      console.error('Error fetching problem suggestions:', error);
    }

    setIsFetchingSuggestions(false);
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
            <>
              <TextInput
                style={styles.input}
                placeholder="Problem Name"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  fetchProblemSuggestions(text);
                }}
                theme={{ colors: { text: 'black', primary: '#800000' } }}
              />
              {isFetchingSuggestions ? (
                <Text>Loading...</Text>
              ) : (
                <ScrollView style={styles.suggestionsContainer}>
                  {problemSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.titleSlug}
                      onPress={() => {
                        onChange(suggestion.title);
                        setProblemSuggestions([]);
                      }}
                    >
                      <Text style={styles.suggestionItem}>{suggestion.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
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
              theme={{ colors: { text: 'black', primary: '#800000' } }}
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
                theme={{ colors: { text: 'black', primary: '#800000' } }}
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
        <Text style={styles.label}>Last Visited Date</Text>
        <Controller
          control={control}
          name="lastVisitedDate"
          defaultValue={new Date()}
          render={({ field: { value } }) => (
            <>
              <TouchableOpacity style={styles.dateButton} disabled>
                <Text>{new Date(value).toDateString()}</Text>
              </TouchableOpacity>
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
              theme={{ colors: { text: 'black', primary: '#800000' } }}
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Next Visit Date</Text>
        <Controller
          control={control}
          name="nextVisitDate"
          defaultValue={new Date()}
          render={({ field: { value } }) => (
            <>
              <TouchableOpacity style={styles.dateButton} disabled>
                <Text>{new Date(value).toDateString()}</Text>
              </TouchableOpacity>
            </>
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
              theme={{ colors: { text: 'black', primary: '#800000' } }}
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
              theme={{ colors: { text: 'black', primary: '#800000' } }}
            />
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
              theme={{ colors: { text: 'black', primary: '#800000' } }}
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
              theme={{ colors: { text: 'black', primary: '#800000' } }}
            />
          )}
        />
      </View>

      <View style={styles.buttonGroup}>
        <Button
          mode="contained"
          onPress={() => {
            setShowForm(false);
            reset();
            setSelectedRecord(null);
          }}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Cancel
        </Button>
        {selectedRecord && (
          <Button
            mode="contained"
            onPress={() => {
              deleteProblem(selectedRecord);
              setShowForm(false);
              reset();
            }}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            Delete
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit(handleAddOrUpdateProblem)}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          {selectedRecord ? "Update Problem" : "Add Problem"}
        </Button>
      </View>
    </View>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => editProblem(item)}
      onLongPress={() => handleLongPress(item)}
      style={styles.listItem}
    >
      <View>
        <Text style={styles.listItemLabel}>Problem Name:</Text>
        <Text style={styles.listItemText}>{item.problemName}</Text>
      </View>
      <View>
        <Text style={styles.listItemLabel}>Next Visit Date:</Text>
        <Text style={styles.listItemText}>{item.nextVisitDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: '#800000' }}>
        <Appbar.Content title="LogLeet" titleStyle={{ color: '#FFFFFF' }} />
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity onPress={openMenu}>
              <Avatar.Text size={36} label={userInitial} />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={logout} title="Logout" />
        </Menu>
      </Appbar.Header>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <SafeAreaView style={styles.container}>
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={renderListItem}
          />
          <TouchableOpacity
            style={styles.newProblemButton}
            onPress={() => {
              reset();
              setShowForm(true);
            }}
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
    </SafeAreaProvider>
  );
};

export default MainScreen;


