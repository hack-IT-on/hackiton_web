"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

const QUIZ_COOLDOWN_KEY = "quiz_last_attempt";
const QUIZ_TIME_LIMIT = 150; // 2:30 minutes in seconds

const QuizPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_TIME_LIMIT);
  const [canTakeQuiz, setCanTakeQuiz] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);

  const TOTAL_QUESTIONS = 10;
  const POINTS_PER_QUESTION = 10;
  const PASSING_SCORE = 60;

  // Check if user can take quiz
  useEffect(() => {
    const lastAttempt = localStorage.getItem(QUIZ_COOLDOWN_KEY);
    if (!lastAttempt) {
      setCanTakeQuiz(true);
      return;
    }

    const lastAttemptDate = new Date(parseInt(lastAttempt));
    const now = new Date();
    const canTake = !isSameDay(lastAttemptDate, now);
    setCanTakeQuiz(canTake);
  }, []);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        if (isOpen) {
          handleQuizClose();
        }
      } else {
        setIsTabActive(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isOpen]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isOpen && !quizComplete && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setQuizComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, quizComplete]);

  // Prevent right click
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    if (isOpen) {
      document.addEventListener("contextmenu", preventDefault);
      return () => document.removeEventListener("contextmenu", preventDefault);
    }
  }, [isOpen]);

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleQuizClose = () => {
    setIsOpen(false);
    setQuizComplete(true);
    setTimeRemaining(0);
  };

  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const resetQuiz = () => {
    setScore(0);
    setQuestionCount(0);
    setQuestion(null);
    setSelectedAnswer(null);
    setFeedback(null);
    setQuizComplete(false);
    setTimeRemaining(QUIZ_TIME_LIMIT);
    fetchQuestion();
  };

  const startQuiz = () => {
    if (!canTakeQuiz) return;
    setIsOpen(true);
    resetQuiz();
    localStorage.setItem(QUIZ_COOLDOWN_KEY, Date.now().toString());
    setCanTakeQuiz(false);
  };

  const fetchQuestion = async () => {
    if (questionCount >= TOTAL_QUESTIONS) {
      setQuizComplete(true);
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      setSelectedAnswer(null);

      const response = await fetch(
        "https://opentdb.com/api.php?amount=1&category=18&type=multiple"
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const questionData = data.results[0];
        const answers = shuffleArray([
          ...questionData.incorrect_answers,
          questionData.correct_answer,
        ]);

        setQuestion({
          ...questionData,
          question: decodeHTML(questionData.question),
          answers: answers.map((answer) => decodeHTML(answer)),
          correct_answer: decodeHTML(questionData.correct_answer),
        });
        setQuestionCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setFeedback({
        type: "error",
        message: "Failed to fetch question. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    if (answer === question.correct_answer) {
      setScore((prev) => prev + POINTS_PER_QUESTION);
      setFeedback({
        type: "success",
        message: "Correct! Well done! +10 quiz points",
      });
    } else {
      setFeedback({
        type: "error",
        message: `Incorrect. The correct answer was: ${question.correct_answer}`,
      });
    }
  };

  useEffect(() => {
    if (isOpen && !question && !quizComplete) {
      fetchQuestion();
    }
  }, [isOpen]);

  const QuizContent = () => {
    async function addPoints() {
      await fetch("/api/points", {
        method: "POST",
        body: JSON.stringify({
          activityName: "quiz",
          activityDescription: "Passed the quiz",
        }),
      });
    }

    if (quizComplete) {
      const passed = score >= PASSING_SCORE;
      if (passed) {
        addPoints();
      }
      return (
        <div className="space-y-4 text-center">
          {passed && (
            <div className="flex justify-center mb-6">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
          )}
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <p className="text-xl">
            Your final score: {score}/{TOTAL_QUESTIONS * POINTS_PER_QUESTION}
          </p>
          {passed ? (
            <Alert className="bg-green-50">
              <AlertDescription>
                Congratulations! You passed the quiz with a score of {score}{" "}
                quiz points!
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                {timeRemaining === 0
                  ? "Time's up! Try again tomorrow."
                  : `Keep practicing! You needed ${PASSING_SCORE} quiz points to pass.`}
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={() => setIsOpen(false)} className="w-full">
            Close Quiz
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              Question {questionCount}/{TOTAL_QUESTIONS}
            </span>
            <span>Score: {score} quiz points</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Time Remaining: {formatTime(timeRemaining)}</span>
          </div>
          <Progress value={(questionCount / TOTAL_QUESTIONS) * 100} />
        </div>

        {loading ? (
          <div className="text-center py-4">Loading question...</div>
        ) : question ? (
          <>
            <p className="text-lg font-medium">{question.question}</p>

            <div className="grid grid-cols-1 gap-3">
              {question.answers.map((answer, index) => (
                <Button
                  key={index}
                  variant={
                    selectedAnswer === answer
                      ? answer === question.correct_answer
                        ? "default"
                        : "destructive"
                      : "outline"
                  }
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswerSelect(answer)}
                  className="w-full"
                >
                  {answer}
                </Button>
              ))}
            </div>

            {feedback && (
              <Alert
                variant={
                  feedback.type === "success" ? "default" : "destructive"
                }
              >
                <AlertDescription>{feedback.message}</AlertDescription>
              </Alert>
            )}

            {selectedAnswer && (
              <Button onClick={fetchQuestion} className="w-full">
                {questionCount === TOTAL_QUESTIONS
                  ? "See Results"
                  : "Next Question"}
              </Button>
            )}
          </>
        ) : null}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canTakeQuiz}>
          {canTakeQuiz ? "Start Quiz" : "Quiz Available Tomorrow"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Computer Science Quiz</DialogTitle>
          <DialogDescription>
            Test your knowledge with {TOTAL_QUESTIONS} questions in{" "}
            {formatTime(QUIZ_TIME_LIMIT)}. Score {PASSING_SCORE}+ quiz points to
            pass!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <QuizContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizPopup;
