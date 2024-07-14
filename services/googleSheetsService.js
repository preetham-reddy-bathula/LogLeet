// src/services/googleSheetsService.js
import axios from 'axios';

export const fetchData = async (spreadsheetId, apiKey, setRecords) => {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1?key=${apiKey}`
    );
    setRecords(response.data.values.slice(1));
  } catch (error) {
    console.error(error);
  }
};

export const addProblem = async (spreadsheetId, apiKey, data, setRecords, scheduleNotification) => {
  const revisitDate = new Date(data.firstAttemptDate);
  revisitDate.setDate(revisitDate.getDate() + data.revisitFrequency);
  data.revisitDate = revisitDate;

  try {
    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:append?valueInputOption=RAW&key=${apiKey}`,
      {
        values: [[
          data.problemName,
          data.problemLink,
          data.difficultyLevel,
          data.timeTaken,
          data.firstAttemptDate.toISOString().split('T')[0],
          data.notes,
          data.revisitDate.toISOString().split('T')[0],
          data.lastRevisitDate.toISOString().split('T')[0],
          data.revisitFrequency,
          data.timeComplexity,
          data.spaceComplexity,
          data.companyTags,
        ]],
      }
    );
    scheduleNotification(data.revisitDate);
    fetchData(spreadsheetId, apiKey, setRecords);
    alert('Problem added successfully!');
  } catch (error) {
    console.error(error);
    alert('Failed to add problem');
  }
};

export const updateProblem = async (spreadsheetId, apiKey, data, index, setRecords, scheduleNotification) => {
  const revisitDate = new Date(data.firstAttemptDate);
  revisitDate.setDate(revisitDate.getDate() + data.revisitFrequency);
  data.revisitDate = revisitDate;

  try {
    const range = `Sheet1!A${index + 2}:L${index + 2}`;
    await axios.put(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW&key=${apiKey}`,
      {
        values: [[
          data.problemName,
          data.problemLink,
          data.difficultyLevel,
          data.timeTaken,
          data.firstAttemptDate.toISOString().split('T')[0],
          data.notes,
          data.revisitDate.toISOString().split('T')[0],
          data.lastRevisitDate.toISOString().split('T')[0],
          data.revisitFrequency,
          data.timeComplexity,
          data.spaceComplexity,
          data.companyTags,
        ]],
      }
    );
    scheduleNotification(data.revisitDate);
    fetchData(spreadsheetId, apiKey, setRecords);
    alert('Problem updated successfully!');
  } catch (error) {
    console.error(error);
    alert('Failed to update problem');
  }
};

export const deleteProblem = async (spreadsheetId, apiKey, index, setRecords) => {
  try {
    const range = `Sheet1!A${index + 2}:L${index + 2}`;
    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear?key=${apiKey}`
    );
    fetchData(spreadsheetId, apiKey, setRecords);
    alert('Problem deleted successfully!');
  } catch (error) {
    console.error(error);
    alert('Failed to delete problem');
  }
};
