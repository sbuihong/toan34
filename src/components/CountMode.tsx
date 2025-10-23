import { useState, useEffect, useRef } from "react";
import { CountQuestion } from "../types/game";
import { GameGenerator } from "../utils/gameGenerator";
import { Button } from "./ui/button";
import { motion } from "motion/react";

const FPT_API_KEY = "Y6cOAzkF6ac0DlD4STe1BqAukfwpieDk";
const FPT_VOICE = "thuminh";

interface CountModeProps {
  question: CountQuestion;
  onAnswer: (answer: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function CountMode({
  question,
  onAnswer,
  questionNumber,
  totalQuestions,
}: CountModeProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [emoji] = useState(() => GameGenerator.getRandomEmoji());
  const [objectPositions, setObjectPositions] = useState<
    Array<{ x: number; y: number; rotation: number }>
  >([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const positions = [];
    for (let i = 0; i < question.objectCount; i++) {
      positions.push({
        x: Math.random() * 80 + 10, // 10% - 90%
        y: Math.random() * 70 + 10, // 10% - 80%
        rotation: Math.random() * 40 - 20, // -20° - 20°
      });
    }
    setObjectPositions(positions);
    setSelectedAnswer(null);

    const timer = setTimeout(() => {
      playInstruction();
    }, 600);
    return () => clearTimeout(timer);
  }, [question]);

  const speakWithFPT = async (text: string) => {
    try {
      const response = await fetch("https://api.fpt.ai/hmi/tts/v5", {
        method: "POST",
        headers: {
          "api-key": FPT_API_KEY,
          speed: "",
          voice: FPT_VOICE,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: text,
      });

      const result = await response.json();
      const audioUrl = result?.async;

      if (audioUrl) {
        // Dừng nếu đang phát
        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
      } else {
        console.error("Không lấy được URL âm thanh từ FPT:", result);
      }
    } catch (error) {
      console.error("FPT AI TTS error:", error);
    }
  };

  const playInstruction = () => {
    speakWithFPT("Bé ơi, ở đây có bao nhiêu đồ vật thế nhỉ?");
  };

  const playFeedback = (isCorrect: boolean) => {
    const feedbackText = isCorrect
      ? "Đúng rồi! Giỏi quá!"
      : "Chưa đúng! Cố gắng lên!";
    speakWithFPT(feedbackText);
  };

  const handleAnswer = (answer: number) => {
    const isCorrect = answer === question.correctAnswer;
    setSelectedAnswer(answer);
    playFeedback(isCorrect);

    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
    }, 1500);
  };

  const containerClass =
    "relative w-full h-96 bg-linear-to-br from-blue-50 to-purple-50 rounded-3xl shadow-lg border-4 border-white overflow-hidden";

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-gray-600">
          Câu hỏi {questionNumber}/{totalQuestions}
        </p>
        <h2 className="text-blue-600 mt-2">Đếm số vật và chọn đáp án đúng</h2>
      </div>

      {/* Khu vực hiển thị vật thể */}
      <div className={containerClass}>
        {objectPositions.map((pos, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <span className="text-6xl drop-shadow-lg">{emoji}</span>
          </motion.div>
        ))}
      </div>

      {/* Các lựa chọn đáp án */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === question.correctAnswer;
          const showFeedback = selectedAnswer !== null;

          return (
            <Button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={`h-20 text-3xl transition-all duration-300 ${
                showFeedback && isSelected && isCorrect
                  ? "bg-green-500 hover:bg-green-500"
                  : showFeedback && isSelected && !isCorrect
                  ? "bg-red-500 hover:bg-red-500"
                  : "bg-white text-blue-600 border-4 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
              }`}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
