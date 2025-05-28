import TheoryClientPage from "./TheoryClientPage"

// Sample theory content data
const theoryContent = {
  "notes-intervals": {
    title: "Notes & Intervals",
    description: "Master the building blocks of music theory",
    difficulty: "Beginner",
    duration: "15 min read",
    hasQuiz: true,
    keyPoints: [
      "The 12 chromatic notes",
      "Half steps and whole steps",
      "Major and minor intervals",
      "Perfect intervals",
      "Interval quality and size",
    ],
    content: `
      <h1>Notes & Intervals</h1>
      
      <p>Understanding notes and intervals is fundamental to all music theory. This knowledge will help you understand scales, chords, and how music works on a deeper level.</p>

      <h2>The Musical Alphabet</h2>

      <p>Music uses only 7 letter names: <strong>A, B, C, D, E, F, G</strong>. These repeat infinitely in both directions.</p>

      <p>Between most of these letters are <strong>sharps (#)</strong> and <strong>flats (♭)</strong>:</p>
      <ul>
        <li>A → A# → B → C → C# → D → D# → E → F → F# → G → G# → A</li>
      </ul>

      <p>This gives us <strong>12 different pitches</strong> before the pattern repeats. This is called the <strong>chromatic scale</strong>.</p>

      <h2>Half Steps and Whole Steps</h2>

      <ul>
        <li><strong>Half step (semitone)</strong>: The smallest interval in Western music</li>
        <li><strong>Whole step (tone)</strong>: Two half steps</li>
      </ul>

      <p>On guitar:</p>
      <ul>
        <li>Each fret = 1 half step</li>
        <li>2 frets = 1 whole step</li>
      </ul>

      <h2>Types of Intervals</h2>

      <p>An <strong>interval</strong> is the distance between two notes. Here are the basic intervals:</p>

      <h3>Perfect Intervals</h3>
      <ul>
        <li><strong>Unison (P1)</strong>: Same note</li>
        <li><strong>Perfect 4th (P4)</strong>: 5 half steps (C to F)</li>
        <li><strong>Perfect 5th (P5)</strong>: 7 half steps (C to G)</li>
        <li><strong>Octave (P8)</strong>: 12 half steps (C to C)</li>
      </ul>

      <h3>Major Intervals</h3>
      <ul>
        <li><strong>Major 2nd (M2)</strong>: 2 half steps (C to D)</li>
        <li><strong>Major 3rd (M3)</strong>: 4 half steps (C to E)</li>
        <li><strong>Major 6th (M6)</strong>: 9 half steps (C to A)</li>
        <li><strong>Major 7th (M7)</strong>: 11 half steps (C to B)</li>
      </ul>

      <h3>Minor Intervals</h3>
      <ul>
        <li><strong>Minor 2nd (m2)</strong>: 1 half step (C to D♭)</li>
        <li><strong>Minor 3rd (m3)</strong>: 3 half steps (C to E♭)</li>
        <li><strong>Minor 6th (m6)</strong>: 8 half steps (C to A♭)</li>
        <li><strong>Minor 7th (m7)</strong>: 10 half steps (C to B♭)</li>
      </ul>

      <h2>Practical Application</h2>

      <p>Understanding intervals helps you:</p>
      <ol>
        <li><strong>Build scales</strong> - knowing the interval pattern</li>
        <li><strong>Construct chords</strong> - stacking specific intervals</li>
        <li><strong>Recognize sounds</strong> - each interval has a unique character</li>
        <li><strong>Improvise better</strong> - knowing what notes will sound good together</li>
      </ol>

      <h2>Guitar Fretboard Intervals</h2>

      <p>Here are some common interval shapes on guitar:</p>

      <p><strong>Perfect 5th (Power Chord)</strong>:</p>
      <ul>
        <li>Root on 6th string, 5th on 5th string (same fret)</li>
        <li>Root on 5th string, 5th on 4th string (same fret)</li>
      </ul>

      <p><strong>Octave</strong>:</p>
      <ul>
        <li>Root on 6th string, octave on 4th string (+2 frets)</li>
        <li>Root on 5th string, octave on 3rd string (+2 frets)</li>
      </ul>

      <h2>Practice Exercises</h2>

      <ol>
        <li><strong>Chromatic Scale</strong>: Play all 12 notes on one string</li>
        <li><strong>Interval Recognition</strong>: Play intervals and sing them back</li>
        <li><strong>Fretboard Mapping</strong>: Find the same note in multiple octaves</li>
        <li><strong>Power Chord Movement</strong>: Practice 5ths across different string sets</li>
      </ol>

      <p>Remember: Theory serves the music, not the other way around. Use this knowledge to enhance your playing and creativity!</p>
    `,
  },
  scales: {
    title: "Scales",
    description: "Master major, minor, and modal scales for metal guitar",
    difficulty: "Intermediate",
    duration: "20 min read",
    hasQuiz: true,
    keyPoints: [
      "Major scale construction",
      "Natural minor scale",
      "Pentatonic scales",
      "Modal scales",
      "Scale applications in metal",
    ],
    content: `
      <h1>Scales</h1>
      
      <p>Scales are the foundation of melody, harmony, and improvisation. For metal guitarists, understanding scales is crucial for writing riffs, solos, and understanding song structure.</p>

      <h2>What is a Scale?</h2>

      <p>A <strong>scale</strong> is a collection of notes arranged in ascending or descending order. Scales provide the raw material for melodies and harmonies.</p>

      <h2>The Major Scale</h2>

      <p>The major scale is the most important scale in Western music. It follows this interval pattern:</p>

      <p><strong>W-W-H-W-W-W-H</strong> (W = whole step, H = half step)</p>

      <h3>C Major Scale</h3>
      <p>C - D - E - F - G - A - B - C</p>

      <p>This scale contains <strong>no sharps or flats</strong> and serves as our reference point.</p>

      <h2>The Natural Minor Scale</h2>

      <p>The natural minor scale has a darker, more melancholic sound perfect for metal. Its pattern:</p>

      <p><strong>W-H-W-W-H-W-W</strong></p>

      <h3>A Minor Scale</h3>
      <p>A - B - C - D - E - F - G - A</p>

      <p>Notice that A minor contains the same notes as C major - they are <strong>relative scales</strong>.</p>

      <h2>Pentatonic Scales</h2>

      <p>Pentatonic scales contain only 5 notes and are extremely popular in rock and metal.</p>

      <h3>Minor Pentatonic</h3>
      <p>The most used scale in metal guitar:</p>
      <p><strong>A - C - D - E - G</strong></p>

      <p>This removes the 2nd and 6th degrees from the natural minor scale, eliminating potential dissonance.</p>

      <h3>Major Pentatonic</h3>
      <p><strong>C - D - E - G - A</strong></p>

      <p>Less common in metal but useful for certain melodic passages.</p>

      <h2>Modal Scales</h2>

      <p>Modes are variations of the major scale starting from different degrees:</p>

      <ol>
        <li><strong>Ionian</strong> (Major): Bright, happy</li>
        <li><strong>Dorian</strong>: Minor with raised 6th</li>
        <li><strong>Phrygian</strong>: Dark, Spanish flavor</li>
        <li><strong>Lydian</strong>: Major with raised 4th</li>
        <li><strong>Mixolydian</strong>: Major with lowered 7th</li>
        <li><strong>Aeolian</strong> (Natural Minor): Dark, sad</li>
        <li><strong>Locrian</strong>: Diminished, unstable</li>
      </ol>

      <h3>Popular Modes in Metal</h3>

      <p><strong>Dorian</strong>: Used in progressive metal</p>
      <ul>
        <li>Natural minor with raised 6th degree</li>
        <li>Example: A Dorian = A-B-C-D-E-F#-G</li>
      </ul>

      <p><strong>Phrygian</strong>: Common in extreme metal</p>
      <ul>
        <li>Natural minor with lowered 2nd degree</li>
        <li>Example: E Phrygian = E-F-G-A-B-C-D</li>
      </ul>

      <h2>Scale Applications</h2>

      <h3>Riff Writing</h3>
      <ul>
        <li>Use minor scales for heavy, dark riffs</li>
        <li>Pentatonic scales for catchy, memorable phrases</li>
        <li>Modal scales for unique flavors</li>
      </ul>

      <h3>Lead Guitar</h3>
      <ul>
        <li>Minor pentatonic: Your go-to for solos</li>
        <li>Natural minor: Add more melodic options</li>
        <li>Harmonic minor: Classical, neoclassical metal sound</li>
      </ul>

      <h3>Song Analysis</h3>
      <p>Understanding scales helps you:</p>
      <ul>
        <li>Analyze your favorite songs</li>
        <li>Understand chord progressions</li>
        <li>Predict which notes will sound good</li>
      </ul>

      <h2>Practice Tips</h2>

      <ol>
        <li><strong>Learn patterns</strong>: Memorize scale shapes across the fretboard</li>
        <li><strong>Play with backing tracks</strong>: Practice scales over chord progressions</li>
        <li><strong>Sequence practice</strong>: Play scales in different patterns (3rds, 4ths, etc.)</li>
        <li><strong>Apply immediately</strong>: Use new scales in your own riffs and solos</li>
      </ol>

      <p>The goal isn't to play scales perfectly - it's to internalize them so you can use them musically!</p>
    `,
  },
  chords: {
    title: "Chords",
    description: "Understand chord construction and progressions",
    difficulty: "Intermediate",
    duration: "18 min read",
    hasQuiz: true,
    keyPoints: ["Triad construction", "7th chords", "Power chords", "Chord progressions", "Voice leading"],
    content: `
      <h1>Chords</h1>
      
      <p>Chords provide the harmonic foundation of music. Understanding how chords are built and how they function will make you a better songwriter and help you understand the music you love.</p>

      <h2>What is a Chord?</h2>

      <p>A <strong>chord</strong> is three or more notes played simultaneously. The most basic chords are <strong>triads</strong> (three notes).</p>

      <h2>Building Triads</h2>

      <p>Triads are built by stacking <strong>thirds</strong> from a root note:</p>

      <h3>Major Triad</h3>
      <ul>
        <li><strong>Root</strong> - <strong>Major 3rd</strong> - <strong>Perfect 5th</strong></li>
        <li>C Major: C - E - G</li>
        <li>Interval pattern: 4 - 3 half steps</li>
      </ul>

      <h3>Minor Triad</h3>
      <ul>
        <li><strong>Root</strong> - <strong>Minor 3rd</strong> - <strong>Perfect 5th</strong></li>
        <li>C Minor: C - E♭ - G</li>
        <li>Interval pattern: 3 - 4 half steps</li>
      </ul>

      <h3>Diminished Triad</h3>
      <ul>
        <li><strong>Root</strong> - <strong>Minor 3rd</strong> - <strong>Diminished 5th</strong></li>
        <li>C Diminished: C - E♭ - G♭</li>
        <li>Interval pattern: 3 - 3 half steps</li>
      </ul>

      <h3>Augmented Triad</h3>
      <ul>
        <li><strong>Root</strong> - <strong>Major 3rd</strong> - <strong>Augmented 5th</strong></li>
        <li>C Augmented: C - E - G#</li>
        <li>Interval pattern: 4 - 4 half steps</li>
      </ul>

      <h2>Power Chords</h2>

      <p>In metal, <strong>power chords</strong> (5th chords) are king:</p>
      <ul>
        <li>Contains only <strong>root</strong> and <strong>perfect 5th</strong></li>
        <li>No 3rd = no major/minor quality</li>
        <li>Example: C5 = C - G</li>
      </ul>

      <p>Power chords are:</p>
      <ul>
        <li>Easy to play</li>
        <li>Sound great with distortion</li>
        <li>Can be moved anywhere on the fretboard</li>
      </ul>

      <h2>7th Chords</h2>

      <p>Adding the 7th creates richer, more complex harmonies:</p>

      <h3>Major 7th (Maj7)</h3>
      <ul>
        <li>Major triad + Major 7th</li>
        <li>CMaj7: C - E - G - B</li>
      </ul>

      <h3>Dominant 7th (7)</h3>
      <ul>
        <li>Major triad + Minor 7th</li>
        <li>C7: C - E - G - B♭</li>
      </ul>

      <h3>Minor 7th (m7)</h3>
      <ul>
        <li>Minor triad + Minor 7th</li>
        <li>Cm7: C - E♭ - G - B♭</li>
      </ul>

      <h3>Minor 7♭5 (Half-Diminished)</h3>
      <ul>
        <li>Diminished triad + Minor 7th</li>
        <li>Cm7♭5: C - E♭ - G♭ - B♭</li>
      </ul>

      <h2>Chord Progressions</h2>

      <p>Chords rarely exist in isolation. <strong>Chord progressions</strong> create movement and tell musical stories.</p>

      <h3>Common Metal Progressions</h3>

      <p><strong>i - ♭VII - ♭VI - ♭VII</strong> (Natural Minor)</p>
      <ul>
        <li>Am - G - F - G</li>
        <li>Dark, powerful sound</li>
      </ul>

      <p><strong>i - ♭VI - ♭III - ♭VII</strong></p>
      <ul>
        <li>Am - F - C - G</li>
        <li>Epic, anthemic feel</li>
      </ul>

      <p><strong>i - iv - ♭VII - ♭III</strong></p>
      <ul>
        <li>Am - Dm - G - C</li>
        <li>Melancholic, emotional</li>
      </ul>

      <h2>Roman Numeral Analysis</h2>

      <p>We use Roman numerals to analyze chord functions:</p>

      <p><strong>Major Key</strong>: I - ii - iii - IV - V - vi - vii°</p>
      <p><strong>Minor Key</strong>: i - ii° - ♭III - iv - v - ♭VI - ♭VII</p>

      <p>This system helps you:</p>
      <ul>
        <li>Transpose songs to different keys</li>
        <li>Understand harmonic relationships</li>
        <li>Write your own progressions</li>
      </ul>

      <h2>Practical Applications</h2>

      <h3>Rhythm Guitar</h3>
      <ul>
        <li>Power chords for heavy sections</li>
        <li>Open chords for clean parts</li>
        <li>Barre chords for consistency</li>
      </ul>

      <h3>Songwriting</h3>
      <ul>
        <li>Start with a progression you like</li>
        <li>Experiment with different voicings</li>
        <li>Try substituting chords (vi for I, etc.)</li>
      </ul>

      <h3>Analysis</h3>
      <ul>
        <li>Figure out progressions in songs you love</li>
        <li>Understand why certain changes work</li>
        <li>Apply these concepts to your own music</li>
      </ul>

      <p>Remember: Chords are tools for expression. Learn the rules, then break them creatively!</p>
    `,
  },
  rhythm: {
    title: "Rhythm",
    description: "Master time signatures and rhythmic patterns",
    difficulty: "Beginner",
    duration: "12 min read",
    hasQuiz: false,
    keyPoints: ["Time signatures", "Note values", "Syncopation", "Polyrhythms", "Metal rhythm patterns"],
    content: `
      <h1>Rhythm</h1>
      
      <p>Rhythm is the heartbeat of music. For metal guitarists, having solid rhythm skills is absolutely essential - it's what makes the difference between sloppy playing and tight, professional-sounding metal.</p>

      <h2>Time Signatures</h2>

      <p>A <strong>time signature</strong> tells us how to count time in music. It has two numbers:</p>

      <ul>
        <li><strong>Top number</strong>: Beats per measure</li>
        <li><strong>Bottom number</strong>: Note value that gets one beat</li>
      </ul>

      <h3>Common Time Signatures</h3>

      <p><strong>4/4 (Common Time)</strong></p>
      <ul>
        <li>4 beats per measure</li>
        <li>Quarter note gets one beat</li>
        <li>Most common in metal</li>
      </ul>

      <p><strong>2/4</strong></p>
      <ul>
        <li>2 beats per measure</li>
        <li>Quarter note gets one beat</li>
        <li>Fast, driving feel</li>
      </ul>

      <p><strong>3/4 (Waltz Time)</strong></p>
      <ul>
        <li>3 beats per measure</li>
        <li>Quarter note gets one beat</li>
        <li>Less common in metal</li>
      </ul>

      <p><strong>6/8</strong></p>
      <ul>
        <li>6 beats per measure</li>
        <li>Eighth note gets one beat</li>
        <li>Feels like two groups of three</li>
      </ul>

      <h2>Note Values</h2>

      <p>Understanding note durations is crucial:</p>

      <ul>
        <li><strong>Whole note</strong>: 4 beats (in 4/4)</li>
        <li><strong>Half note</strong>: 2 beats</li>
        <li><strong>Quarter note</strong>: 1 beat</li>
        <li><strong>Eighth note</strong>: 1/2 beat</li>
        <li><strong>Sixteenth note</strong>: 1/4 beat</li>
      </ul>

      <h3>Rests</h3>
      <p>Silence is just as important as sound:</p>
      <ul>
        <li><strong>Whole rest</strong>: 4 beats of silence</li>
        <li><strong>Half rest</strong>: 2 beats of silence</li>
        <li><strong>Quarter rest</strong>: 1 beat of silence</li>
        <li><strong>Eighth rest</strong>: 1/2 beat of silence</li>
      </ul>

      <h2>Counting and Subdivision</h2>

      <p>In 4/4 time, we count: <strong>1 - 2 - 3 - 4</strong></p>

      <p>For eighth notes: <strong>1 & 2 & 3 & 4 &</strong></p>

      <p>For sixteenth notes: <strong>1 e & a 2 e & a 3 e & a 4 e & a</strong></p>

      <h2>Syncopation</h2>

      <p><strong>Syncopation</strong> emphasizes off-beats, creating rhythmic interest:</p>

      <ul>
        <li>Playing on the "&" of beats</li>
        <li>Accenting weak beats</li>
        <li>Creating rhythmic tension</li>
      </ul>

      <p>Example: Instead of playing on 1-2-3-4, play on 1-&-3-&</p>

      <h2>Common Metal Rhythm Patterns</h2>

      <h3>Straight Eighth Notes</h3>
      <p><strong>1 & 2 & 3 & 4 &</strong></p>
      <ul>
        <li>Basic metal rhythm</li>
        <li>All downstrokes for power</li>
        <li>Think Metallica's "Master of Puppets"</li>
      </ul>

      <h3>Palm-Muted Chugs</h3>
      <p><strong>1 - - & 2 - - & 3 - - & 4 - - &</strong></p>
      <ul>
        <li>Muted on beats, open on "&"</li>
        <li>Creates chunky, percussive sound</li>
      </ul>

      <h3>Galloping Rhythm</h3>
      <p><strong>1 & a 2 & a 3 & a 4 & a</strong></p>
      <ul>
        <li>Triplet feel in duple time</li>
        <li>Think Iron Maiden's "The Trooper"</li>
      </ul>

      <h3>Syncopated Power Chords</h3>
      <p><strong>1 - & - 3 - & -</strong></p>
      <ul>
        <li>Emphasizes off-beats</li>
        <li>Creates forward momentum</li>
      </ul>

      <h2>Practice Tips</h2>

      <h3>Use a Metronome</h3>
      <ul>
        <li>Start slow and build speed</li>
        <li>Practice with different subdivisions</li>
        <li>Don't rush - stay locked in</li>
      </ul>

      <h3>Count Out Loud</h3>
      <ul>
        <li>Helps internalize rhythms</li>
        <li>Develops internal clock</li>
        <li>Essential for complex patterns</li>
      </ul>

      <h3>Record Yourself</h3>
      <ul>
        <li>Check your timing</li>
        <li>Identify problem areas</li>
        <li>Compare to original songs</li>
      </ul>

      <p>Remember: Great metal isn't just about speed or technicality - it's about creating a powerful rhythmic foundation that serves the song!</p>
    `,
  },
  quiz: {
    title: "Quiz Hub",
    description: "Test your music theory knowledge",
    difficulty: "All Levels",
    duration: "Interactive",
    hasQuiz: false,
    keyPoints: [
      "Interval recognition",
      "Scale identification",
      "Chord progressions",
      "Rhythm patterns",
      "Fretboard knowledge",
    ],
    content: `
      <h1>Quiz Hub</h1>
      
      <p>Welcome to the Music Theory Quiz Hub! Test your knowledge and track your progress across all areas of music theory.</p>

      <h2>Available Quizzes</h2>

      <h3>Beginner Level</h3>

      <p><strong>Notes & Intervals Quiz</strong></p>
      <ul>
        <li>Identify intervals by ear</li>
        <li>Name notes on the fretboard</li>
        <li>Recognize interval patterns</li>
        <li><em>20 questions - 10 minutes</em></li>
      </ul>

      <p><strong>Basic Rhythm Quiz</strong></p>
      <ul>
        <li>Count simple rhythms</li>
        <li>Identify time signatures</li>
        <li>Recognize note values</li>
        <li><em>15 questions - 8 minutes</em></li>
      </ul>

      <h3>Intermediate Level</h3>

      <p><strong>Scales Quiz</strong></p>
      <ul>
        <li>Identify scale types</li>
        <li>Complete scale patterns</li>
        <li>Mode recognition</li>
        <li><em>25 questions - 15 minutes</em></li>
      </ul>

      <p><strong>Chord Construction Quiz</strong></p>
      <ul>
        <li>Build triads and 7th chords</li>
        <li>Identify chord qualities</li>
        <li>Analyze progressions</li>
        <li><em>20 questions - 12 minutes</em></li>
      </ul>

      <h3>Advanced Level</h3>

      <p><strong>Harmonic Analysis Quiz</strong></p>
      <ul>
        <li>Roman numeral analysis</li>
        <li>Secondary dominants</li>
        <li>Modal interchange</li>
        <li><em>30 questions - 20 minutes</em></li>
      </ul>

      <p><strong>Rhythm Mastery Quiz</strong></p>
      <ul>
        <li>Complex time signatures</li>
        <li>Polyrhythmic patterns</li>
        <li>Syncopation identification</li>
        <li><em>25 questions - 18 minutes</em></li>
      </ul>

      <h2>Quiz Features</h2>

      <h3>Adaptive Difficulty</h3>
      <ul>
        <li>Questions adjust to your skill level</li>
        <li>Focus on areas that need improvement</li>
        <li>Personalized learning path</li>
      </ul>

      <h3>Detailed Explanations</h3>
      <ul>
        <li>Learn from your mistakes</li>
        <li>Understand the theory behind answers</li>
        <li>Links to relevant lessons</li>
      </ul>

      <h3>Progress Tracking</h3>
      <ul>
        <li>See your improvement over time</li>
        <li>Identify strengths and weaknesses</li>
        <li>Set learning goals</li>
      </ul>

      <h2>Study Tips</h2>

      <h3>Before Taking Quizzes</h3>
      <ol>
        <li><strong>Review the lessons</strong> - Make sure you understand the concepts</li>
        <li><strong>Practice actively</strong> - Don't just read, apply the knowledge</li>
        <li><strong>Use your instrument</strong> - Play examples as you study</li>
      </ol>

      <h3>During Quizzes</h3>
      <ol>
        <li><strong>Read carefully</strong> - Make sure you understand what's being asked</li>
        <li><strong>Take your time</strong> - Accuracy is more important than speed</li>
        <li><strong>Use process of elimination</strong> - Rule out obviously wrong answers</li>
      </ol>

      <h3>After Quizzes</h3>
      <ol>
        <li><strong>Review mistakes</strong> - Understand why you got questions wrong</li>
        <li><strong>Retake if needed</strong> - Repetition helps solidify knowledge</li>
        <li><strong>Apply to playing</strong> - Use what you've learned in your practice</li>
      </ol>

      <h2>Your Progress</h2>

      <p>Track your quiz performance across all topics:</p>

      <ul>
        <li><strong>Overall Score</strong>: 0% (Take your first quiz!)</li>
        <li><strong>Strongest Area</strong>: Not yet determined</li>
        <li><strong>Focus Area</strong>: Start with Notes & Intervals</li>
        <li><strong>Streak</strong>: 0 days</li>
      </ul>

      <h2>Get Started</h2>

      <p>Ready to test your knowledge? Choose a quiz that matches your current level and start building your music theory foundation!</p>

      <p>Remember: The goal isn't to get everything right immediately - it's to learn and improve over time. Every mistake is a learning opportunity!</p>
    `,
  },
}

export async function generateStaticParams() {
  return [{ slug: "notes-intervals" }, { slug: "scales" }, { slug: "chords" }, { slug: "rhythm" }, { slug: "quiz" }]
}

interface TheoryPageProps {
  params: {
    slug: string
  }
}

export default function TheorySlugPage({ params }: TheoryPageProps) {
  const content = theoryContent[params.slug as keyof typeof theoryContent]

  if (!content) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Theory Topic Not Found</h1>
          <p className="text-gray-400 mb-8">The requested theory topic could not be found.</p>
        </div>
      </div>
    )
  }

  return <TheoryClientPage params={params} content={content} />
}
