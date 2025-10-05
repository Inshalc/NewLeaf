import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Flashcard = { question: string; answer: string };
type MCQuestion = { question: string; options: string[]; correct: string };
type MatchPair = { left: string; right: string };

export default function CanadaGames() {
  const [activeGame, setActiveGame] = useState<'flashcard' | 'mcq' | 'match'>('flashcard');

  const flashcardsOriginal: Flashcard[] = [
    { question: 'Capital of Canada?', answer: 'Ottawa' },
    { question: 'Canada\'s national animal?', answer: 'Beaver' },
    { question: 'Official languages?', answer: 'English & French' },
    { question: 'Largest province by area?', answer: 'Quebec' },
    { question: 'Canada\'s national sport (summer)?', answer: 'Lacrosse' },
    { question: 'Canada\'s national sport (winter)?', answer: 'Ice Hockey' },
    { question: 'Famous Canadian singer of "Hallelujah"?', answer: 'Leonard Cohen' },
    { question: 'Longest river in Canada?', answer: 'Mackenzie River' },
    { question: 'Famous Canadian dish with fries, cheese curds, and gravy?', answer: 'Poutine' },
    { question: 'Canada Day is celebrated on?', answer: 'July 1' },
  ];

  const mcQuestionsOriginal: MCQuestion[] = [
    { question: 'Which province is the largest?', options: ['Ontario', 'Quebec', 'British Columbia'], correct: 'Quebec' },
    { question: 'Canada Day is on?', options: ['July 1', 'June 24', 'August 1'], correct: 'July 1' },
    { question: 'Famous Canadian hockey team?', options: ['Toronto Maple Leafs', 'LA Lakers', 'NY Yankees'], correct: 'Toronto Maple Leafs' },
    { question: 'Canada\'s official motto?', options: ['A Mari Usque Ad Mare', 'In God We Trust', 'E Pluribus Unum'], correct: 'A Mari Usque Ad Mare' },
    { question: 'Canadian currency?', options: ['Dollar', 'Pound', 'Euro'], correct: 'Dollar' },
    { question: 'Which city is known as "Hollywood North"?', options: ['Toronto', 'Vancouver', 'Montreal'], correct: 'Vancouver' },
    { question: 'Canada\'s largest city?', options: ['Toronto', 'Montreal', 'Vancouver'], correct: 'Toronto' },
    { question: 'Famous Canadian wildlife park?', options: ['Banff', 'Yellowstone', 'Yosemite'], correct: 'Banff' },
    { question: 'Famous Canadian singer Justin?', options: ['Bieber', 'Timberlake', 'Trudeau'], correct: 'Bieber' },
    { question: 'Popular Canadian snack?', options: ['Ketchup Chips', 'Pretzels', 'Popcorn'], correct: 'Ketchup Chips' },
  ];

  const matchPairsOriginal: MatchPair[] = [
    { left: 'Maple Leaf', right: 'National Symbol' },
    { left: 'Hockey', right: 'National Sport' },
    { left: 'Beaver', right: 'National Animal' },
    { left: 'Poutine', right: 'Canadian Food' },
    { left: 'Toronto', right: 'Largest City' },
    { left: 'Ottawa', right: 'Capital City' },
    { left: 'Quebec', right: 'Largest Province' },
    { left: 'Vancouver', right: 'Hollywood North' },
    { left: 'Niagara Falls', right: 'Famous Landmark' },
    { left: 'Loon', right: 'National Bird' },
  ];

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

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    setFlashcards(shuffleArray(flashcardsOriginal));
    setFlashIndex(0);
    setShowAnswer(false);

    const shuffledMCQs = shuffleArray(mcQuestionsOriginal).map((q) => ({
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
    setLeftItems(shuffleArray(shuffledPairs.map((p) => p.left)));
    setRightItems(shuffleArray(shuffledPairs.map((p) => p.right)));
  }, [activeGame]);

  const nextFlash = () => {
    setShowAnswer(false);
    setFlashIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handleMCAnswer = (option: string) => {
    if (option === mcQuestions[mcIndex].correct) {
      setMcScore(mcScore + 1);
      Alert.alert('Correct! ✅', 'Great job!');
    } else {
      Alert.alert('Wrong ❌', `The correct answer is: ${mcQuestions[mcIndex].correct}`);
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
      const correctPair = matchPairs.find((p) => p.left === selectedLeft)?.right;
      if (item === correctPair) {
        setMatchedPairs([...matchedPairs, selectedLeft, item]);
        Alert.alert('Matched! ✅', 'Great job!');
      } else {
        Alert.alert('Try again ❌', 'That\'s not the correct match.');
      }
      setSelectedLeft(null);
    }
  };

  const restartGame = () => {
    setActiveGame(activeGame); // This will trigger the useEffect to reset
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🇨🇦 Canada Games</Text>

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

      {/* FLASHCARDS */}
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
          {mcQuestions[mcIndex]?.options.map((opt) => (
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
            {mcScore >= mcQuestions.length * 0.8 ? 'Excellent! 🇨🇦' : 
             mcScore >= mcQuestions.length * 0.6 ? 'Good job! 🍁' : 
             'Keep practicing! 👍'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MATCHING */}
      {activeGame === 'match' && (
        <View style={styles.gameContainer}>
          <Text style={styles.question}>Match the Canadian symbols!</Text>
          <Text style={styles.instructions}>Select an item from the left column, then match it with the correct item from the right column.</Text>
          
          <View style={styles.matchContainer}>
            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>Canadian Items</Text>
              {leftItems.map((left) => (
                <TouchableOpacity
                  key={left}
                  disabled={matchedPairs.includes(left)}
                  style={[
                    styles.matchButton,
                    selectedLeft === left && styles.selectedMatch,
                    matchedPairs.includes(left) && styles.matched,
                  ]}
                  onPress={() => handleMatch(left)}
                >
                  <Text style={styles.matchText}>{left}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>Descriptions</Text>
              {rightItems.map((right) => (
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
              <Text style={styles.completionSubtext}>You're a Canada expert! 🇨🇦</Text>
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
  container: { flex: 1, padding: 15, backgroundColor: '#e8f5e9' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#2e7d32', marginBottom: 15 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, backgroundColor: '#a5d6a7' },
  activeTab: { backgroundColor: '#2e7d32' },
  tabText: { color: 'white', fontWeight: 'bold' },
  gameContainer: { marginBottom: 20 },
  counter: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 },
  question: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20', marginBottom: 20, textAlign: 'center' },
  answer: { fontSize: 18, color: '#388e3c', marginBottom: 20, textAlign: 'center', fontWeight: '600' },
  instructions: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 15, fontStyle: 'italic' },
  button: { backgroundColor: '#4caf50', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  optionButton: { backgroundColor: '#81c784', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  optionText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  score: { fontSize: 16, fontWeight: 'bold', color: '#1b5e20', textAlign: 'center', marginTop: 10 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 10 },
  resultScore: { fontSize: 18, color: '#1b5e20', textAlign: 'center', marginBottom: 5 },
  resultMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
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