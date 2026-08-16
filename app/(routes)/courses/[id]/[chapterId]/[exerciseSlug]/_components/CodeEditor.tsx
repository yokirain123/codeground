"use client";

import CppCodeEditor from "./CppCodeEditor";
import CSharpCodeEditor from "./CSharpCodeEditor";
import PythonCodeEditor from "./PythonCodeEditor";
import type { ExerciseData } from "./types";
import WebCodeEditor from "./WebCodeEditor";

interface CodeEditorProps {
  exerciseTitle: string;
  exercise: ExerciseData;
  onCompletionChange?: (isCompleted: boolean) => void;
}

export default function CodeEditor(props: CodeEditorProps) {
  const isCppExercise = Object.keys(props.exercise.starterCode).some(
    (filename) => /\.(?:cpp|cc|cxx)$/.test(filename.toLowerCase()),
  );

  if (isCppExercise) {
    return <CppCodeEditor key={props.exercise.id} {...props} />;
  }

  const isCSharpExercise = Object.keys(props.exercise.starterCode).some(
    (filename) => filename.toLowerCase().endsWith(".cs"),
  );

  if (isCSharpExercise) {
    return <CSharpCodeEditor key={props.exercise.id} {...props} />;
  }

  const isPythonExercise = Object.keys(props.exercise.starterCode).some(
    (filename) => filename.toLowerCase().endsWith(".py"),
  );

  if (isPythonExercise) {
    return <PythonCodeEditor key={props.exercise.id} {...props} />;
  }

  return <WebCodeEditor key={props.exercise.id} {...props} />;
}
