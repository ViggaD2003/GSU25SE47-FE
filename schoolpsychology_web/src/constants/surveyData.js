import sampleSurveys from './sampleSurveys.json'

const surveyData = sampleSurveys

const surveyCode = {
  mental_health: [
    {
      code: 'GAD-7',
      limitedQuestions: true,
      length: 7,
    },
    { code: 'PHQ-9', limitedQuestions: true, length: 9 },
  ],
  environment: [
    {
      code: 'FAMILY_ENV',
      limitedQuestions: false,
    },
    {
      code: 'SCHOOL_ENV',
      limitedQuestions: false,
    },
  ],
}

export { surveyData, surveyCode }
