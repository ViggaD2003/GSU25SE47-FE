// Mock data for mental_evaluation table based on DBML schema
export const MENTAL_EVALUATION_SOURCES = {
  PROGRAM: "PROGRAM",
  SURVEY: "SURVEY",
};

export const SOURCE_TYPES = {
  ENTRY: "ENTRY",
  EXIT: "EXIT",
  NONE: "NONE",
};

// Generate mock mental evaluation data
const generateMockEvaluations = () => {
  const evaluations = [];
  const students = [1, 2, 3, 4, 5]; // Student IDs
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-12-31");

  let id = 1;

  students.forEach((studentId) => {
    // Generate 50-80 evaluations per student over the year
    const numEvaluations = Math.floor(Math.random() * 31) + 50;

    for (let i = 0; i < numEvaluations; i++) {
      const randomDate = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime())
      );
      const evaluationType = Math.random();

      let evaluation = {
        id: id++,
        first_evaluated_at: randomDate.toISOString().split("T")[0],
        last_evaluated_at: randomDate.toISOString().split("T")[0],
        student_id: studentId,
        weighted_score: Math.floor(Math.random() * 100) + 1, // 1-100
        appointment_id: null,
        survey_record_id: null,
        source: null,
        source_type: null,
      };

      if (evaluationType < 0.3) {
        // Appointment evaluation (30%)
        evaluation.appointment_id = Math.floor(Math.random() * 1000) + 1;
        evaluation.source = null;
        evaluation.source_type = null;
      } else if (evaluationType < 0.6) {
        // Survey evaluation (30%)
        evaluation.survey_record_id = Math.floor(Math.random() * 1000) + 1;
        evaluation.source = MENTAL_EVALUATION_SOURCES.SURVEY;
        evaluation.source_type = SOURCE_TYPES.NONE;
      } else {
        // Program evaluation (40%) - split between ENTRY and EXIT
        evaluation.source = MENTAL_EVALUATION_SOURCES.PROGRAM;
        evaluation.source_type =
          Math.random() < 0.5 ? SOURCE_TYPES.ENTRY : SOURCE_TYPES.EXIT;
      }

      evaluations.push(evaluation);
    }
  });

  return evaluations.sort(
    (a, b) => new Date(a.first_evaluated_at) - new Date(b.first_evaluated_at)
  );
};

export const MOCK_MENTAL_EVALUATIONS = generateMockEvaluations();

// Student names for parent dashboard
export const STUDENT_NAMES = {
  1: "Nguyễn Văn An",
  2: "Trần Thị Bình",
  3: "Lê Hoàng Cường",
  4: "Phạm Thị Dung",
  5: "Võ Minh Khang",
};

// Helper functions for data processing
export const getEvaluationsByStudent = (studentId) => {
  return MOCK_MENTAL_EVALUATIONS.filter(
    (evaluation) => evaluation.student_id === studentId
  );
};

export const getEvaluationsBySource = (source, sourceType = null) => {
  return MOCK_MENTAL_EVALUATIONS.filter((evaluation) => {
    if (source === "APPOINTMENT") {
      return evaluation.appointment_id !== null;
    }
    if (sourceType) {
      return (
        evaluation.source === source && evaluation.source_type === sourceType
      );
    }
    return evaluation.source === source;
  });
};

export const getEvaluationsByDateRange = (
  startDate,
  endDate,
  studentId = null
) => {
  return MOCK_MENTAL_EVALUATIONS.filter((evaluation) => {
    const evalDate = new Date(evaluation.first_evaluated_at);
    const inRange =
      evalDate >= new Date(startDate) && evalDate <= new Date(endDate);
    if (studentId) {
      return inRange && evaluation.student_id === studentId;
    }
    return inRange;
  });
};

export const getAverageScoreBySource = (studentId = null) => {
  let evaluations = MOCK_MENTAL_EVALUATIONS;
  if (studentId) {
    evaluations = getEvaluationsByStudent(studentId);
  }

  const sources = {
    SURVEY: [],
    PROGRAM_ENTRY: [],
    PROGRAM_EXIT: [],
    APPOINTMENT: [],
  };

  evaluations.forEach((evaluation) => {
    if (evaluation.appointment_id) {
      sources.APPOINTMENT.push(evaluation.weighted_score);
    } else if (evaluation.source === MENTAL_EVALUATION_SOURCES.SURVEY) {
      sources.SURVEY.push(evaluation.weighted_score);
    } else if (evaluation.source === MENTAL_EVALUATION_SOURCES.PROGRAM) {
      if (evaluation.source_type === SOURCE_TYPES.ENTRY) {
        sources.PROGRAM_ENTRY.push(evaluation.weighted_score);
      } else {
        sources.PROGRAM_EXIT.push(evaluation.weighted_score);
      }
    }
  });

  return Object.keys(sources).reduce((acc, key) => {
    const scores = sources[key];
    acc[key] =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
    return acc;
  }, {});
};

export const getMonthlyTrends = (studentId = null) => {
  let evaluations = MOCK_MENTAL_EVALUATIONS;
  if (studentId) {
    evaluations = getEvaluationsByStudent(studentId);
  }

  const monthlyData = {};

  evaluations.forEach((evaluation) => {
    const date = new Date(evaluation.first_evaluated_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        scores: [],
        count: 0,
        survey: [],
        program_entry: [],
        program_exit: [],
        appointment: [],
      };
    }

    monthlyData[monthKey].scores.push(evaluation.weighted_score);
    monthlyData[monthKey].count++;

    if (evaluation.appointment_id) {
      monthlyData[monthKey].appointment.push(evaluation.weighted_score);
    } else if (evaluation.source === MENTAL_EVALUATION_SOURCES.SURVEY) {
      monthlyData[monthKey].survey.push(evaluation.weighted_score);
    } else if (evaluation.source === MENTAL_EVALUATION_SOURCES.PROGRAM) {
      if (evaluation.source_type === SOURCE_TYPES.ENTRY) {
        monthlyData[monthKey].program_entry.push(evaluation.weighted_score);
      } else {
        monthlyData[monthKey].program_exit.push(evaluation.weighted_score);
      }
    }
  });

  // Calculate averages
  return Object.values(monthlyData)
    .map((month) => ({
      ...month,
      average_score:
        month.scores.reduce((sum, score) => sum + score, 0) /
        month.scores.length,
      survey_avg:
        month.survey.length > 0
          ? month.survey.reduce((sum, score) => sum + score, 0) /
            month.survey.length
          : 0,
      program_entry_avg:
        month.program_entry.length > 0
          ? month.program_entry.reduce((sum, score) => sum + score, 0) /
            month.program_entry.length
          : 0,
      program_exit_avg:
        month.program_exit.length > 0
          ? month.program_exit.reduce((sum, score) => sum + score, 0) /
            month.program_exit.length
          : 0,
      appointment_avg:
        month.appointment.length > 0
          ? month.appointment.reduce((sum, score) => sum + score, 0) /
            month.appointment.length
          : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};
