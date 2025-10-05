import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Flashcard = { question: string; answer: string };
type MCQuestion = { question: string; options: string[]; correct: string };
type MatchPair = { left: string; right: string };

export default function USAGames() {
  const [activeGame, setActiveGame] = useState<'flashcard' | 'mcq' | 'match'>('flashcard');

  // Original game data
  const flashcardsOriginal: Flashcard[] = [
    { question: 'Capital of the USA?', answer: 'Washington, D.C.' },
    { question: 'National bird?', answer: 'Bald Eagle' },
    { question: 'National anthem?', answer: 'The Star-Spangled Banner' },
    { question: 'First president of the USA?', answer: 'George Washington' },
    { question: 'Largest state by area?', answer: 'Alaska' },
    { question: 'Which state is known as the Sunshine State?', answer: 'Florida' },
    { question: 'Famous U.S. holiday on July 4th?', answer: 'Independence Day' },
    { question: 'Tallest mountain in the USA?', answer: 'Denali (Mount McKinley)' },
    { question: 'U.S. currency?', answer: 'Dollar (USD)' },
    { question: 'Which city is called "The Big Apple"?', answer: 'New York City' },
  ];

  const mcQuestionsOriginal: MCQuestion[] = [
    { question: 'What is the capital of the USA?', options: ['Washington, D.C.', 'New York', 'Los Angeles'], correct: 'Washington, D.C.' },
    { question: 'Who was the first U.S. president?', options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson'], correct: 'George Washington' },
    { question: 'National bird of the USA?', options: ['Bald Eagle', 'Robin', 'Hawk'], correct: 'Bald Eagle' },
    { question: 'Which U.S. state is the largest?', options: ['Texas', 'Alaska', 'California'], correct: 'Alaska' },
    { question: 'Which holiday celebrates independence?', options: ['July 4th', 'Thanksgiving', 'Memorial Day'], correct: 'July 4th' },
    { question: 'Which U.S. state is known for Hollywood?', options: ['Florida', 'California', 'Nevada'], correct: 'California' },
    { question: 'What is the U.S. currency?', options: ['Dollar', 'Pound', 'Peso'], correct: 'Dollar' },
    { question: 'Which U.S. city is called "Windy City"?', options: ['Chicago', 'Miami', 'Boston'], correct: 'Chicago' },
    { question: 'Where is the Statue of Liberty located?', options: ['New York', 'Washington, D.C.', 'Philadelphia'], correct: 'New York' },
    { question: 'What is the U.S. national sport (often considered)?', options: ['Baseball', 'Basketball', 'Soccer'], correct: 'Baseball' },
  ];

  const matchPairsOriginal: MatchPair[] = [
    { left: 'Bald Eagle', right: 'National Bird' },
    { left: 'Washington, D.C.', right: 'Capital' },
    { left: 'Baseball', right: 'National Pastime' },
    { left: 'July 4th', right: 'Independence Day' },
    { left: 'New York City', right: 'The Big Apple' },
    { left: 'Alaska', right: 'Largest State' },
    { left: 'Statue of Liberty', right: 'Famous Landmark' },
    { left: 'Hollywood', right: 'Movie Industry' },
    { left: 'George Washington', right: 'First President' },
    { left: 'Dollar', right: 'Currency' },
  ];

  // State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashIndex, setFlashIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const [mcQuestions, setMcQuestions] = useState<MCQuestion[]>([]);
  const [mcIndex, setMcIndex] = useState<number>(0);
  const [mcScore, setMcScore] = useState<number>(0);
  const [mcFinished, setMcFinished] = useState<boolean>(false);

  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([]);
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Utility: shuffle
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Initialize games on tab change
  useEffect(() => {
    setFlashcards(shuffleArray(flashcardsOriginal));
    setFlashIndex(0);
    setShowAnswer(false);

    const shuffledMCQs = shuffleArray(mcQuestionsOriginal).map(q => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    setMcQuestions(shuffledMCQs);
    setMcIndex(0);
    setMcScore(0);
    setMcFinished(false);

    const shuffledPairs = shuffleArray(matchPairsOriginal);
    setMatchPairs(shuffledPairs);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setLeftItems(shuffleArray(shuffledPairs.map(p => p.left)));
    setRightItems(shuffleArray(shuffledPairs.map(p => p.right)));
  }, [activeGame]);

  // Handlers
  const nextFlash = () => {
    setShowAnswer(false);
    setFlashIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handleMCAnswer = (option: string) => {
    if (option === mcQuestions[mcIndex].correct) {
      setMcScore(mcScore + 1);
      Alert.alert('Correct ✅', 'Great job!');
    } else {
      Alert.alert('Wrong ❌', `Correct answer: ${mcQuestions[mcIndex].correct}`);
    }

    if (mcIndex + 1 >= mcQuestions.length) {
      setMcFinished(true);
    } else {
      setMcIndex(mcIndex + 1);
    }
  };

  const handleMatch = (item: string) => {
    if (!selectedLeft) {
      setSelectedLeft(item);
    } else {
      const correctPair = matchPairs.find(p => p.left === selectedLeft)?.right;
      if (item === correctPair) {
        setMatchedPairs([...matchedPairs, selectedLeft, item]);
        Alert.alert('Matched ✅', 'Great job!');
      } else {
        Alert.alert('Try again ❌', 'That’s not the correct match.');
      }
      setSelectedLeft(null);
    }
  };

  const restartGame = () => {
    setActiveGame('flashcard'); // reset to default
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🇺🇸 USA Games</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, activeGame === 'flashcard' && styles.activeTab]} onPress={() => setActiveGame('flashcard')}>
          <Text style={styles.tabText}>Flashcards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeGame === 'mcq' && styles.activeTab]} onPress={() => setActiveGame('mcq')}>
          <Text style={styles.tabText}>Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeGame === 'match' && styles.activeTab]} onPress={() => setActiveGame('match')}>
          <Text style={styles.tabText}>Matching</Text>
        </TouchableOpacity>
      </View>

      {/* Flashcards */}
      {activeGame === 'flashcard' && (
        <View style={styles.gameContainer}>
          <Text style={styles.counter}>Card {flashIndex + 1} of {flashcards.length}</Text>
          <Text style={styles.question}>{flashcards[flashIndex]?.question}</Text>
          {showAnswer && <Text style={styles.answer}>{flashcards[flashIndex]?.answer}</Text>}
          <TouchableOpacity style={styles.button} onPress={() => setShowAnswer(!showAnswer)}>
            <Text style={styles.buttonText}>{showAnswer ? 'Hide Answer' : 'Show Answer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={nextFlash}>
            <Text style={styles.buttonText}>Next Card</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MCQ */}
      {activeGame === 'mcq' && !mcFinished && (
        <View style={styles.gameContainer}>
          <Text style={styles.counter}>Question {mcIndex + 1} of {mcQuestions.length}</Text>
          <Text style={styles.question}>{mcQuestions[mcIndex]?.question}</Text>
          {mcQuestions[mcIndex]?.options.map(opt => (
            <TouchableOpacity key={opt} style={styles.optionButton} onPress={() => handleMCAnswer(opt)}>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.score}>Score: {mcScore}/{mcQuestions.length}</Text>
        </View>
      )}

      {activeGame === 'mcq' && mcFinished && (
        <View style={styles.gameContainer}>
          <Text style={styles.resultTitle}>🎉 Quiz Finished!</Text>
          <Text style={styles.resultScore}>Your final score: {mcScore} / {mcQuestions.length}</Text>
          <Text style={styles.resultMessage}>
            {mcScore >= mcQuestions.length * 0.8 ? 'Excellent! 🇺🇸' : mcScore >= mcQuestions.length * 0.6 ? 'Good job! 🦅' : 'Keep practicing! 👍'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Matching */}
      {activeGame === 'match' && (
        <View style={styles.gameContainer}>
          <Text style={styles.question}>Match the USA symbols!</Text>
          <Text style={styles.instructions}>Select an item from the left column, then match it with the correct item from the right column.</Text>

          <View style={styles.matchContainer}>
            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>USA Items</Text>
              {leftItems.map(left => (
                <TouchableOpacity
                  key={left}
                  disabled={matchedPairs.includes(left)}
                  style={[styles.matchButton, selectedLeft === left && styles.selectedMatch, matchedPairs.includes(left) && styles.matched]}
                  onPress={() => handleMatch(left)}
                >
                  <Text style={styles.matchText}>{left}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>Descriptions</Text>
              {rightItems.map(right => (
                <TouchableOpacity
                  key={right}
                  disabled={matchedPairs.includes(right)}
                  style={[styles.matchButton, matchedPairs.includes(right) && styles.matched]}
                  onPress={() => handleMatch(right)}
                >
                  <Text style={styles.matchText}>{right}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {matchedPairs.length === matchPairs.length * 2 && (
            <View style={styles.completionContainer}>
              <Text style={styles.completionText}>🎉 All pairs matched!</Text>
              <Text style={styles.completionSubtext}>You're a USA expert! 🇺🇸</Text>
              <TouchableOpacity style={styles.button} onPress={restartGame}>
                <Text style={styles.buttonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#e8f5e9' }, // green background
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#2e7d32', marginBottom: 15 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, backgroundColor: '#a5d6a7' },
  activeTab: { backgroundColor: '#2e7d32' },
  tabText: { color: 'white', fontWeight: 'bold' },
  gameContainer: { marginBottom: 20 },
  counter: { fontSize: 14, color: '#388e3c', textAlign: 'center', marginBottom: 10 },
  question: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20', marginBottom: 20, textAlign: 'center' },
  answer: { fontSize: 18, color: '#2e7d32', marginBottom: 20, textAlign: 'center', fontWeight: '600' },
  instructions: { fontSize: 14, color: '#388e3c', textAlign: 'center', marginBottom: 15, fontStyle: 'italic' },
  button: { backgroundColor: '#2e7d32', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  optionButton: { backgroundColor: '#66bb6a', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  optionText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  score: { fontSize: 16, fontWeight: 'bold', color: '#1b5e20', textAlign: 'center', marginTop: 10 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 10 },
  resultScore: { fontSize: 18, color: '#1b5e20', textAlign: 'center', marginBottom: 5 },
  resultMessage: { fontSize: 16, color: '#388e3c', textAlign: 'center', marginBottom: 20 },
  matchContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  matchColumn: { flex: 1, alignItems: 'center' },
  columnTitle: { fontSize: 16, fontWeight: 'bold', color: '#1b5e20', marginBottom: 10 },
  matchButton: { backgroundColor: '#a5d6a7', padding: 12, borderRadius: 8, marginBottom: 8, width: '90%' },
  matchText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  selectedMatch: { borderWidth: 3, borderColor: '#2e7d32' },
  matched: { backgroundColor: '#2e7d32' },
  completionContainer: { marginTop: 20, alignItems: 'center' },
  completionText: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginBottom: 5 },
  completionSubtext: { fontSize: 16, color: '#1b5e20', marginBottom: 15 },
});