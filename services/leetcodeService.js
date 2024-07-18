import axios from 'axios';

const fetchLeetCodeProblems = async () => {
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
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.data.problemsetQuestionList.questions;
  } catch (error) {
    console.error('Error fetching LeetCode problems:', error);
    return [];
  }
};

export { fetchLeetCodeProblems };
