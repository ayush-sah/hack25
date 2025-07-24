import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

const QUIZ_QUESTIONS = [
  {
    question: "What is a budget?",
    options: [
      "A plan for managing income and expenses",
      "A type of bank account",
      "A loan from a bank",
      "A credit card fee",
    ],
    answer: 0,
  },
  {
    question: "Which of the following is considered a good financial habit?",
    options: [
      "Spending more than you earn",
      "Saving a portion of your income",
      "Ignoring bills",
      "Only using cash for purchases",
    ],
    answer: 1,
  },
  {
    question: "What does 'interest' mean in personal finance?",
    options: [
      "A type of tax",
      "Money earned or paid for the use of money",
      "A government grant",
      "A shopping discount",
    ],
    answer: 1,
  },
  {
    question: "Which is the safest place to keep your emergency savings?",
    options: [
      "Under your mattress",
      "In a checking account",
      "In a savings account at a bank",
      "In stocks",
    ],
    answer: 2,
  },
  {
    question: "What is a credit score?",
    options: [
      "A number that represents your financial trustworthiness",
      "The amount of money in your account",
      "Your monthly income",
      "A type of loan",
    ],
    answer: 0,
  },
];

const QuizTab: React.FC = () => {
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleQuizOption = (optionIdx: number) => {
    if (quizSelected !== null) return; // Prevent multiple answers
    setQuizSelected(optionIdx);
    if (optionIdx === QUIZ_QUESTIONS[quizIndex].answer) {
      setQuizScore((prev) => prev + 1);
      setQuizFeedback('Correct!');
    } else {
      setQuizFeedback('Incorrect.');
    }
    setTimeout(() => {
      if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
        setQuizIndex((prev) => prev + 1);
        setQuizSelected(null);
        setQuizFeedback(null);
      } else {
        setQuizFinished(true);
      }
    }, 1000);
  };

  const handleQuizRestart = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelected(null);
    setQuizFeedback(null);
    setQuizFinished(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.quizContainer}>
        {!quizFinished ? (
          <>
            <Text style={styles.quizQuestion}>{QUIZ_QUESTIONS[quizIndex].question}</Text>
            {QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.quizOption,
                  quizSelected === idx && (idx === QUIZ_QUESTIONS[quizIndex].answer
                    ? styles.quizOptionCorrect
                    : styles.quizOptionIncorrect),
                ]}
                onPress={() => handleQuizOption(idx)}
                disabled={quizSelected !== null}
              >
                <Text style={styles.quizOptionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            {quizFeedback && <Text style={styles.quizFeedback}>{quizFeedback}</Text>}
            <Text style={styles.quizProgress}>{`Question ${quizIndex + 1} of ${QUIZ_QUESTIONS.length}`}</Text>
          </>
        ) : (
          <View style={styles.quizResultContainer}>
            <Text style={styles.quizResultText}>{`Quiz Finished! Your score: ${quizScore} / ${QUIZ_QUESTIONS.length}`}</Text>
            <TouchableOpacity style={styles.quizRestartButton} onPress={handleQuizRestart}>
              <Text style={styles.quizRestartButtonText}>Restart Quiz</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECF0F1",
    padding: 16,
    justifyContent: 'center',
  },
  quizContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50',
  },
  quizOption: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  quizOptionCorrect: {
    backgroundColor: '#2ecc71',
  },
  quizOptionIncorrect: {
    backgroundColor: '#DE3163',
  },
  quizOptionText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  quizFeedback: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#008080',
    textAlign: 'center',
  },
  quizProgress: {
    marginTop: 16,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  quizResultContainer: {
    alignItems: 'center',
  },
  quizResultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  quizRestartButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  quizRestartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizTab;
