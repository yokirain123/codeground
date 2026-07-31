export interface ExerciseData {
  id: number;
  courseId: number;
  chapterId: number;
  exerciseId: string;
  exerciseName: string;
  content: string;
  task: string;
  hint: string;
  starterCode: Record<string, string>;
  validationRegex: string;
  expectedOutput: string;
  hintXp: number;
}

export interface ExerciseResponse {
  id: number;
  courseId: number;
  chapterId: number;
  name: string;
  desc: string;
  exerciseData: ExerciseData;
}