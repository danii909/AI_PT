import React from 'react';

const EXERCISES = [
  '🔍 Auto',
  'Squat',
  'Panca',
  'Stacco',
  'Military',
  'Trazioni',
  'Rematore',
  'Affondi',
  'Dip'
];

export default function WorkoutOptions({ selectedExercise, onSelectExercise }) {
  return (
    <div className="chips-scroll" style={{ margin: '0 0 10px 0', padding: 0 }}>
      {EXERCISES.map((ex) => (
        <button
          key={ex}
          className={`chip ${selectedExercise === ex ? 'active' : ''}`}
          onClick={() => onSelectExercise(ex)}
        >
          {ex}
        </button>
      ))}
    </div>
  );
}
