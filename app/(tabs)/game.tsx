import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Button,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

interface Card {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

const CARD_SETS = [
  ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
  ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓"],
  ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑"],
  ["🇺🇸", "🇬🇧", "🇫🇷", "🇩🇪", "🇮🇹", "🇯🇵", "🇨🇳", "🇧🇷"],
  ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱"],
];

const DIFFICULTY_LEVELS = { Easy: 8, Medium: 12, Hard: 16 };

const MemoryGameTab: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [difficulty, setDifficulty] =
    useState<keyof typeof DIFFICULTY_LEVELS>("Easy");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]);

  const initializeGame = () => {
    const cardCount = DIFFICULTY_LEVELS[difficulty];
    const randomSetIndex = Math.floor(Math.random() * CARD_SETS.length);
    const values = CARD_SETS[randomSetIndex].slice(0, cardCount / 2);
    const initialCards: Card[] = values.concat(values).map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false,
    }));
    shuffleCards(initialCards);
    setCards(initialCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setScore(0);
    setMoves(0);
    setTimer(0);
    setIsGameActive(true);
  };

  const shuffleCards = (cardsArray: Card[]) => {
    for (let i = cardsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardsArray[i], cardsArray[j]] = [cardsArray[j], cardsArray[i]];
    }
  };

  const handleCardPress = async (index: number) => {
    if (
      flippedIndices.length < 2 &&
      !cards[index].flipped &&
      !cards[index].matched
    ) {
      const newCards = [...cards];
      newCards[index].flipped = true;
      setCards(newCards);
      setFlippedIndices([...flippedIndices, index]);
      setMoves((prevMoves) => prevMoves + 1);

      await playSound("flip");

      if (flippedIndices.length === 1) {
        const firstIndex = flippedIndices[0];
        if (newCards[firstIndex].value === newCards[index].value) {
          newCards[firstIndex].matched = true;
          newCards[index].matched = true;
          setMatchedPairs([...matchedPairs, firstIndex, index]);
          setScore((prevScore) => prevScore + 10);
          await playSound("match");
          checkGameCompletion(newCards);
        } else {
          setTimeout(async () => {
            newCards[firstIndex].flipped = false;
            newCards[index].flipped = false;
            setCards(newCards);
            setFlippedIndices([]);
            await playSound("nomatch");
          }, 1000);
        }
      }
    }
  };

  const checkGameCompletion = async (currentCards: Card[]) => {
    setIsGameActive(false);
    playSound("complete");
    const finalScore = calculateFinalScore();
    saveHighScore(finalScore);
    const analysis = analyzePerformance(finalScore, moves, timer);
    const message = `Congratulations! Your score: ${finalScore}\n\n${analysis}`;
    setGameOverMessage(message);
    setIsModalVisible(true);
  };

  const calculateFinalScore = () => {
    const timeBonus = Math.max(0, 1000 - timer * 10);
    const movePenalty = moves * 5;
    return score + timeBonus - movePenalty;
  };

  const saveHighScore = async (finalScore: number) => {
    try {
      const currentHighScore = await AsyncStorage.getItem("highScore");
      if (
        currentHighScore === null ||
        finalScore > parseInt(currentHighScore)
      ) {
        await AsyncStorage.setItem("highScore", finalScore.toString());
      }
    } catch (error) {
      console.error("Error saving high score:", error);
    }
  };

  const playSound = async (
    soundType: "flip" | "match" | "nomatch" | "complete"
  ) => {
    const soundMap = {
      flip: require("@/assets/sounds/flip.mp3"),
      match: require("@/assets/sounds/match.mp3"),
      nomatch: require("@/assets/sounds/nomatch.mp3"),
      complete: require("@/assets/sounds/complete.mp3"),
    };
    const { sound } = await Audio.Sound.createAsync(soundMap[soundType]);
    await sound.playAsync();
  };

  const renderCardItem = ({ item, index }: { item: Card; index: number }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: item.flipped || item.matched ? "#2ecc71" : "#DE3163",
        },
      ]}
      onPress={() => handleCardPress(index)}
      activeOpacity={0.8}
    >
      <Text style={styles.cardText}>
        {item.flipped || item.matched ? item.value : "?"}
      </Text>
    </TouchableOpacity>
  );

  const analyzePerformance = (score: number, moves: number, time: number) => {
    const efficiency = score / (moves * time);

    if (efficiency > 0.5) {
      return "Excellent performance! Your memory skills are very strong.";
    } else if (efficiency > 0.3) {
      return "Good job! Your memory is functioning well, but there's room for improvement.";
    } else if (efficiency > 0.1) {
      return "Fair performance. Regular memory exercises may help improve your skills.";
    } else {
      return "Your performance indicates some memory challenges. Consider consulting with a healthcare professional for a more thorough assessment.";
    }
  };

  const GameOverModal = ({
    isVisible,
    message,
    onClose,
    onRestart,
  }: {
    isVisible: boolean;
    message: string;
    onClose: () => void;
    onRestart: () => void;
  }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Game Over</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onRestart}>
            <Text style={styles.modalButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Score: {score}</Text>
        <Text style={styles.headerText}>Moves: {moves}</Text>
        <Text style={styles.headerText}>Time: {timer}s</Text>
      </View>
      <FlatList
        data={cards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={4}
        contentContainerStyle={styles.cardsContainer}
      />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.modalButton} onPress={initializeGame}>
          <Text style={styles.modalButtonText}>Reset Game</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalButton} onPress={initializeGame}>
          <Text
            onPress={() => {
              const levels = Object.keys(
                DIFFICULTY_LEVELS
              ) as (keyof typeof DIFFICULTY_LEVELS)[];
              const currentIndex = levels.indexOf(difficulty);
              const nextDifficulty = levels[(currentIndex + 1) % levels.length];
              setDifficulty(nextDifficulty);
            }}
            style={styles.modalButtonText}
          >
            {`Difficulty: ${difficulty}`}
          </Text>
        </TouchableOpacity>
      </View>
      <GameOverModal
        isVisible={isModalVisible}
        message={gameOverMessage}
        onClose={() => setIsModalVisible(false)}
        onRestart={() => {
          setIsModalVisible(false);
          initializeGame();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECF0F1",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#BDC3C7",
    marginBottom: 16,
    marginTop: 25,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  cardsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  card: {
    width: 70,
    height: 70,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#008080",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#34495E",
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: "#008080",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MemoryGameTab;
