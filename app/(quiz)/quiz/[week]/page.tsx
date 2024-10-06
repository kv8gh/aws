"use client";

import React, { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import ScoreModal from "@/components/score-card-modal"; // Import the ScoreModal
import { questionsByWeek } from "@/components/data/questions";
import { Question } from "@/types/Question";

const shuffleArray = <T,>(array: T[]): T[] => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [
            shuffledArray[j],
            shuffledArray[i],
        ];
    }
    return shuffledArray;
};

interface QuizProps {
    params: {
        week: string;
    };
    userId: string; // Assuming you pass the user's ID from the parent or context
}

const Quiz: React.FC<QuizProps> = (props: QuizProps) => {
    const [score, setScore] = useState<number>(0);
    const [showScore, setShowScore] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [questions, setQuestions] = useState<Record<string, Question[]>>({});
    const [isModalOpen, setIsModalOpen] = useState(false); // For modal visibility

    const router = useRouter();
    const { week } = props.params;
    const { userId } = props; // User ID passed via props

    useEffect(() => {
        const weekQuestions = questionsByWeek[week];
        if (weekQuestions) {
            const shuffledQuestions = shuffleArray(weekQuestions);
            shuffledQuestions.forEach((q) => {
                q.options = shuffleArray(q.options);
            });
            setQuestions((prevState) => ({
                ...prevState,
                [week]: shuffledQuestions,
            }));
            setSelectedAnswers(
                new Array(shuffledQuestions.length).fill("")
            );
        }
    }, [week]);

    const handleAnswer = (option: string, index: number) => {
        if (!submitted) {
            const newSelectedAnswers = [...selectedAnswers];
            newSelectedAnswers[index] = option;
            setSelectedAnswers(newSelectedAnswers);
        }
    };

    const calculateScore = async () => {
        let newScore = 0;
        questions[week].forEach((question, index) => {
            if (question.answer === selectedAnswers[index]) {
                newScore++;
            }
        });
        setScore(newScore);
        setShowScore(true);
        setSubmitted(true);
        setIsModalOpen(true); // Show the modal

        // Save score in MongoDB
        await saveScore(userId, newScore);
    };

    const saveScore = async (userId: string, score: number) => {
        try {
            const response = await fetch("/api/score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, score }),
            });

            if (!response.ok) {
                throw new Error("Failed to update the score");
            }
        } catch (error) {
            console.error("Error updating the score:", error);
        }
    };

    const returnHome = () => {
        if (typeof window !== "undefined") {
            router.push("/");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="p-2">
            <div
                className="cursor-pointer h-10 float-right mr-3 mt-3 md:mr-[5%]"
                onClick={returnHome}
            >
                <Home />
            </div>

            <div className="text-center text-xl font-light underline mb-10">{`Week ${week.slice(
                4
            )} Assignment`}</div>

            <div className="p-5 flex flex-col space-y-20">
                {questions[week]?.map((question, index) => (
                    <div key={index}>
                        <div className="font-semibold">
                            {question.question}
                        </div>
                        <div className="grid md:grid-cols-4 md:gap-20 gap-5 mt-3">
                            {question.options.map(
                                (option, optionIndex) => {
                                    const isSelected =
                                        selectedAnswers[index] === option;
                                    const isCorrect =
                                        option === question.answer;
                                    const isSubmitted = submitted;
                                    const optionClass = `cursor-pointer text-center rounded-lg border p-4 hover:bg-slate-100 transition ${
                                        isSubmitted
                                            ? isCorrect
                                                ? "bg-green-200"
                                                : isSelected
                                                ? "bg-red-200"
                                                : ""
                                            : isSelected
                                            ? "bg-slate-300"
                                            : ""
                                    }`;
                                    return (
                                        <div
                                            key={optionIndex}
                                            onClick={() =>
                                                handleAnswer(option, index)
                                            }
                                            className={optionClass}
                                        >
                                            {option}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {!submitted ? (
                <div className="text-center mb-10">
                    <button
                        className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded mt-5"
                        onClick={calculateScore}
                    >
                        Submit
                    </button>
                </div>
            ) : (
                <div className="text-center mb-10">
                    <button
                        className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded mt-5"
                        onClick={returnHome}
                    >
                        Done
                    </button>
                </div>
            )}

            {isModalOpen && (
                <ScoreModal
                    score={score}
                    totalQuestions={questions[week]?.length || 0}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default Quiz;
