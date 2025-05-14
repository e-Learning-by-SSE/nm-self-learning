import { EvaluationFn } from "../../question-type-registry";

export const evaluateLanguageTreeAnswer: EvaluationFn<"language-tree"> = (question, answer) => {
    let studentAnswer = answer.value.trim();
    let correctAnswers = question.answer.map((a) => a.trim());

    if (!question.caseSensitive) {
        studentAnswer = studentAnswer.toLowerCase();
        correctAnswers = correctAnswers.map((a) => a.toLowerCase());

    }

    const isCorrect = correctAnswers.some((correctAnswer) => studentAnswer === correctAnswer);

    return {
        isCorrect: isCorrect,
    };
};
