import { POST as completeExercise } from "../../completed-exercises/route";

// Backward-compatible alias. New client code uses /api/completed-exercises.
export async function POST(request: Request) {
  return completeExercise(request);
}
