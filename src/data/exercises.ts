export interface Exercise {
  id: string;
  name: string;
  category: string;
  type: string;
  equipment: string;
  difficulty: string;
  sets: string;
  reps: string;
  targets: string[];
  secondary: string[];
  howto: string;
  steps: string[];
  mistakes: string[];
  safety: string[];
  machineSetup?: string[];
}

export const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest', shoulders: 'Shoulders', traps: 'Traps', biceps: 'Biceps',
  triceps: 'Triceps', forearms: 'Forearms', abs: 'Abs', obliques: 'Obliques',
  lats: 'Lats', lowerBack: 'Lower Back', glutes: 'Glutes', quads: 'Quads',
  hamstrings: 'Hamstrings', calves: 'Calves',
};

export const EXERCISES: Exercise[] = [
  {
    id: 'chest-press', name: 'Chest Press Machine', category: 'Push', type: 'machine',
    equipment: 'Machine', difficulty: 'Beginner', sets: '3–4', reps: '8–12',
    targets: ['chest'], secondary: ['shoulders', 'triceps'],
    howto: 'A guided pressing movement that builds the chest with a fixed, stable path — ideal for learning the press safely.',
    steps: [
      'Sit tall with your back flat against the pad.',
      'Grip the handles at mid-chest height.',
      'Press forward until arms are nearly straight — don\'t lock hard.',
      'Lower under control until you feel a stretch across the chest.',
    ],
    mistakes: [
      'Flaring elbows straight out to the sides.',
      'Letting the handles slam back at the bottom.',
      'Shrugging the shoulders up toward the ears.',
    ],
    machineSetup: [
      'Adjust the seat so handles line up with the middle of your chest.',
      'Set the seat-back so your wrists stay behind your elbows at the start.',
      'Plant both feet flat and keep your head on the pad.',
    ],
    safety: ['Keep a slight bend in the elbows at lockout.', 'Exhale as you press, inhale as you return.'],
  },
  {
    id: 'bench-press', name: 'Barbell Bench Press', category: 'Push', type: 'free',
    equipment: 'Barbell', difficulty: 'Intermediate', sets: '4', reps: '5–8',
    targets: ['chest'], secondary: ['shoulders', 'triceps'],
    howto: 'The classic upper-body strength builder. A flat-bench barbell press driving through the chest, shoulders and triceps.',
    steps: [
      'Lie back with eyes under the bar, feet planted.',
      'Grip slightly wider than shoulder-width.',
      'Unrack, lower the bar to mid-chest with elbows ~45°.',
      'Press back up over the shoulders.',
    ],
    mistakes: ['Bouncing the bar off the chest.', 'Flaring elbows to 90°.', 'Lifting hips off the bench.'],
    safety: ['Always use a spotter or safety pins for heavy sets.', 'Keep wrists stacked over elbows.', 'Brace your core throughout.'],
  },
  {
    id: 'lat-pulldown', name: 'Lat Pulldown', category: 'Pull', type: 'machine',
    equipment: 'Cable', difficulty: 'Beginner', sets: '3–4', reps: '10–12',
    targets: ['lats'], secondary: ['biceps', 'shoulders', 'forearms'],
    howto: 'A vertical pull that widens the back. Great for building the pulling strength that leads to pull-ups.',
    steps: [
      'Set the thigh pad snug so you stay seated.',
      'Grip the bar wider than shoulder-width.',
      'Pull the bar to your upper chest, leading with the elbows.',
      'Control the bar back up to a full stretch.',
    ],
    mistakes: ['Leaning way back and using momentum.', 'Pulling the bar behind the neck.', 'Shrugging instead of driving elbows down.'],
    machineSetup: ['Lower the thigh pad until it locks your legs in place.', 'Choose a weight you can pull without swinging.', 'Sit so the cable runs slightly in front of you.'],
    safety: ['Keep your chest up and shoulders down.', 'No jerking — smooth and controlled.'],
  },
  {
    id: 'seated-row', name: 'Seated Cable Row', category: 'Pull', type: 'machine',
    equipment: 'Cable', difficulty: 'Beginner', sets: '3–4', reps: '10–12',
    targets: ['lats', 'traps'], secondary: ['biceps', 'shoulders'],
    howto: 'A horizontal pull that builds mid-back thickness and improves posture.',
    steps: [
      'Sit with a slight knee bend and grab the handle.',
      'Sit tall, chest up, shoulders back.',
      'Pull the handle to your stomach, squeezing the shoulder blades.',
      'Extend the arms forward under control.',
    ],
    mistakes: ['Rounding the lower back.', 'Rowing with the arms only.', 'Rocking back and forth for momentum.'],
    machineSetup: ['Set the chest pad (if present) so you sit upright.', 'Pick a handle — close grip hits more mid-back.', 'Brace feet firmly on the platform.'],
    safety: ['Keep a neutral spine the whole set.', 'Don\'t let the weight yank your torso forward.'],
  },
  {
    id: 'ohp', name: 'Overhead Shoulder Press', category: 'Push', type: 'free',
    equipment: 'Dumbbell', difficulty: 'Intermediate', sets: '3–4', reps: '8–10',
    targets: ['shoulders'], secondary: ['triceps', 'traps'],
    howto: 'A vertical press that builds round, strong shoulders and a stable overhead position.',
    steps: [
      'Sit or stand tall, dumbbells at shoulder height.',
      'Brace your core and glutes.',
      'Press the weights overhead until arms are nearly straight.',
      'Lower under control back to the shoulders.',
    ],
    mistakes: ['Arching the lower back to push the weight.', 'Pressing the weights too far in front.', 'Letting elbows flare uncontrolled.'],
    safety: ['Keep ribs down and core tight.', 'Don\'t lock the elbows aggressively.'],
  },
  {
    id: 'squat', name: 'Barbell Back Squat', category: 'Legs', type: 'free',
    equipment: 'Barbell', difficulty: 'Advanced', sets: '4–5', reps: '5–8',
    targets: ['quads', 'glutes'], secondary: ['hamstrings', 'lowerBack', 'calves'],
    howto: 'The king of leg exercises — total lower-body strength and size with serious core demand.',
    steps: [
      'Set the bar across your upper traps, not your neck.',
      'Unrack and step back, feet shoulder-width.',
      'Sit down and back, knees tracking over toes.',
      'Descend to at least parallel, then drive up through mid-foot.',
    ],
    mistakes: ['Knees caving inward.', 'Heels lifting off the floor.', 'Rounding the lower back at the bottom.'],
    safety: ['Always squat inside a rack with safety pins set.', 'Brace your core before each rep.', 'Keep the bar over mid-foot.'],
  },
  {
    id: 'leg-press', name: 'Leg Press Machine', category: 'Legs', type: 'machine',
    equipment: 'Machine', difficulty: 'Beginner', sets: '3–4', reps: '10–12',
    targets: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'],
    howto: 'A back-supported leg builder that lets you load the legs heavily with low spinal stress.',
    steps: [
      'Sit with your back and head against the pad.',
      'Place feet shoulder-width on the platform.',
      'Release the safeties and lower until knees reach ~90°.',
      'Press through the whole foot without locking the knees.',
    ],
    mistakes: ['Letting the lower back round off the pad.', 'Locking knees hard at the top.', 'Bouncing at the bottom.'],
    machineSetup: ['Adjust the seat so your knees start near 90°.', 'Higher foot placement targets glutes/hamstrings.', 'Keep the safety handles within reach.'],
    safety: ['Never let knees collapse inward.', 'Keep your tailbone on the seat.'],
  },
  {
    id: 'rdl', name: 'Romanian Deadlift', category: 'Legs', type: 'free',
    equipment: 'Barbell', difficulty: 'Intermediate', sets: '3–4', reps: '8–10',
    targets: ['hamstrings', 'glutes'], secondary: ['lowerBack', 'traps'],
    howto: 'A hip-hinge that builds powerful hamstrings and glutes while teaching a safe, strong back position.',
    steps: [
      'Hold the bar at hip height, soft knees.',
      'Push your hips back, sliding the bar down your thighs.',
      'Lower until you feel a hamstring stretch (~mid-shin).',
      'Drive hips forward to stand tall.',
    ],
    mistakes: ['Rounding the back to reach lower.', 'Turning it into a squat.', 'Letting the bar drift away from the legs.'],
    safety: ['Keep the bar close to your body.', 'Stop when your back can\'t stay flat.'],
  },
  {
    id: 'curl', name: 'Dumbbell Bicep Curl', category: 'Pull', type: 'free',
    equipment: 'Dumbbell', difficulty: 'Beginner', sets: '3', reps: '10–12',
    targets: ['biceps'], secondary: ['forearms'],
    howto: 'A direct biceps builder. Simple, but the details make it grow.',
    steps: [
      'Stand tall, dumbbells at your sides, palms forward.',
      'Curl the weights up by bending only at the elbow.',
      'Squeeze at the top.',
      'Lower slowly to full extension.',
    ],
    mistakes: ['Swinging the torso for momentum.', 'Moving the elbows forward.', 'Cutting the range short.'],
    safety: ['Control the lowering phase — that\'s where growth lives.', 'Keep wrists neutral.'],
  },
  {
    id: 'pushdown', name: 'Triceps Pushdown', category: 'Push', type: 'machine',
    equipment: 'Cable', difficulty: 'Beginner', sets: '3', reps: '12–15',
    targets: ['triceps'], secondary: [],
    howto: 'A cable isolation that sculpts the triceps and locks in elbow health for pressing.',
    steps: [
      'Set the cable to the top pulley with a bar or rope.',
      'Tuck your elbows to your sides.',
      'Push down until arms are straight.',
      'Return under control to about 90°.',
    ],
    mistakes: ['Letting elbows drift away from the body.', 'Using the shoulders to push.', 'Leaning over the weight.'],
    machineSetup: ['Attach a rope for more range, a bar for stability.', 'Stand a half-step back from the stack.', 'Pick a weight that keeps elbows pinned.'],
    safety: ['Keep your torso upright.', 'Don\'t hyperextend the elbows.'],
  },
  {
    id: 'plank', name: 'Plank', category: 'Core', type: 'bodyweight',
    equipment: 'Bodyweight', difficulty: 'Beginner', sets: '3', reps: '30–60s',
    targets: ['abs', 'obliques'], secondary: ['lowerBack', 'shoulders'],
    howto: 'An isometric core hold that builds the deep stability behind every other lift.',
    steps: [
      'Set forearms on the floor under your shoulders.',
      'Extend legs back, balancing on your toes.',
      'Squeeze glutes and brace your abs.',
      'Hold a straight line from head to heels.',
    ],
    mistakes: ['Letting the hips sag.', 'Piking the hips up.', 'Holding your breath.'],
    safety: ['Stop if the lower back aches — re-brace.', 'Keep breathing steadily.'],
  },
  {
    id: 'treadmill', name: 'Incline Treadmill Walk', category: 'Cardio', type: 'cardio',
    equipment: 'Treadmill', difficulty: 'Beginner', sets: '1', reps: '20–40 min',
    targets: ['calves', 'quads'], secondary: ['hamstrings', 'glutes'],
    howto: 'Low-impact incline cardio that burns calories and builds the legs without trashing your joints.',
    steps: [
      'Set a brisk pace you can sustain (often 4.5–6 km/h).',
      'Raise incline to 6–12% for a real challenge.',
      'Stand tall — avoid leaning on the handrails.',
      'Keep a steady, controlled stride.',
    ],
    mistakes: ['Holding the rails (kills the benefit).', 'Setting incline so high your form breaks.', 'Looking down at your feet.'],
    safety: ['Clip the safety stop to your clothing.', 'Build incline gradually week to week.'],
  },
];

export const CATEGORIES = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Cardio'];

export const GOALS = [
  { id: 'lose-fat',      label: 'Lose Fat',        sub: 'Lean down, keep muscle' },
  { id: 'build-muscle',  label: 'Build Muscle',     sub: 'Add size & strength' },
  { id: 'get-stronger',  label: 'Get Stronger',     sub: 'Move heavier weight' },
  { id: 'cardio',        label: 'Improve Cardio',   sub: 'Endurance & heart health' },
  { id: 'general',       label: 'General Fitness',  sub: 'Feel good, stay active' },
];

export const ACTIVITY_LEVELS = ['Sedentary', 'Lightly active', 'Active', 'Very active'];
export const EXPERIENCE_LEVELS = ['Brand new', 'Some experience', 'Experienced'];
export const DIET_PREFS = ['No preference', 'High protein', 'Vegetarian', 'Vegan', 'Low carb'];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
