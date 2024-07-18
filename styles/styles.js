import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  input: {
    height: 45,
    borderColor: '#d3d3d3',
    borderWidth: 1,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    fontSize: 16,
  },
  dateButton: {
    height: 45,
    justifyContent: 'center',
    paddingLeft: 10,
    borderColor: '#d3d3d3',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalSelector: {
    borderColor: '#d3d3d3',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  listItemLabel: {
    fontSize: 14,
    color: '#555',
  },
  listItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  newProblemButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#800000',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    backgroundColor: '#800000',
    margin: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderColor: '#d3d3d3',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d3d3d3',
  },
  caption: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default styles;

