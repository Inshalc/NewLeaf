import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Flashcard = { question: string; answer: string };
type MCQuestion = { question: string; options: string[]; correct: string };
type MatchPair = { left: string; right: string };

export default function UKGames() {
  const [activeGame, setActiveGame] = useState<'flashcard' | 'mcq' | 'match'>('flashcard');

  const flashcardsOriginal: Flashcard[] = [
    { question: 'Capital of the UK?', answer: 'London' },
    { question: 'Currency of the UK?', answer: 'Pound Sterling (£)' },
    { question: 'National animal of England?', answer: 'Lion' },
    { question: 'Famous playwright from the UK?', answer: 'William Shakespeare' },
    { question: 'What is Big Ben?', answer: 'A clock tower in London' },
    { question: 'What is the national sport of England?', answer: 'Cricket' },
    { question: 'UK flag is called?', answer: 'Union Jack' },
    { question: 'Famous tea culture is associated with?', answer: 'Afternoon Tea' },
    { question: 'Which river flows through London?', answer: 'River Thames' },
    { question: 'Name the UK Prime Minister\'s residence?', answer: '10 Downing Street' },
  ];

  const mcQuestionsOriginal: MCQuestion[] = [
    { question: 'What is the capital of the UK?', options: ['London', 'Manchester', 'Edinburgh'], correct: 'London' },
    { question: 'Currency of the UK?', options: ['Euro', 'Pound Sterling', 'Dollar'], correct: 'Pound Sterling' },
    { question: 'Who wrote "Romeo and Juliet"?', options: ['Shakespeare', 'Dickens', 'Milton'], correct: 'Shakespeare' },
    { question: 'What is Big Ben?', options: ['A tower', 'A bell', 'A palace'], correct: 'A clock tower in London' },
    { question: 'What is the UK flag called?', options: ['Union Jack', 'Stars & Stripes', 'Maple Leaf'], correct: 'Union Jack' },
    { question: 'National sport of England?', options: ['Cricket', 'Football', 'Rugby'], correct: 'Cricket' },
    { question: 'Which river runs through London?', options: ['Seine', 'Thames', 'Clyde'], correct: 'Thames' },
    { question: 'UK residence of the Prime Minister?', options: ['10 Downing Street', 'Buckingham Palace', 'Westminster'], correct: '10 Downing Street' },
    { question: 'Famous British tea custom?', options: ['Afternoon Tea', 'Coffee Time', 'High Coffee'], correct: 'Afternoon Tea' },
    { question: 'Which Scottish festival is famous worldwide?', options: ['Burns Night', 'Diwali', 'Oktoberfest'], correct: 'Burns Night' },
  ];

  const matchPairsOriginal: MatchPair[] = [
    { left: 'Union Jack', right: 'UK Flag' },
    { left: 'London', right: 'Capital' },
    { left: 'Shakespeare', right: 'Playwright' },
    { left: 'Cricket', right: 'National Sport' },
    { left: 'Big Ben', right: 'Clock Tower' },
    { left: 'River Thames', right: 'London River' },
    { left: '10 Downing Street', right: 'PM Residence' },
    { left: 'Lion', right: 'England Symbol' },
    { left: 'Buckingham Palace', right: 'Royal Residence' },
    { left: 'Afternoon Tea', right: 'Cultural Tradition' },
  ];

  // State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashIndex, setFlashIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [mcQuestions, setMcQuestions] = useState<MCQuestion[]>([]);
  const [mcIndex, setMcIndex] = useState(0);
  const [mcScore, setMcScore] = useState(0);
  const [mcFinished, setMcFinished] = useState(false);

  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);

  // Shuffle helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Initialize game data
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
    // Force re-initialize current game
    setActiveGame(prev => (prev === 'flashcard' ? 'mcq' : 'flashcard'));
    setTimeout(() => setActiveGame('flashcard'), 50);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🇬🇧 UK Games</Text>

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
            {mcScore >= mcQuestions.length * 0.8 ? 'Excellent! 🇬🇧' :
             mcScore >= mcQuestions.length * 0.6 ? 'Good job! 🦁' : 'Keep practicing! 👍'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Matching */}
      {activeGame === 'match' && (
        <View style={styles.gameContainer}>
          <Text style={styles.question}>Match the UK symbols!</Text>
          <Text style={styles.instructions}>Select an item from the left column, then match it with the correct item from the right column.</Text>
          
          <View style={styles.matchContainer}>
            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>UK Items</Text>
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
              <Text style={styles.completionSubtext}>You're a UK expert! 🇬🇧</Text>
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