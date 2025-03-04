import { EvaluationFn } from "../../question-type-registry";

export const evaluateLanguageTreeAnswer: EvaluationFn<"language-tree"> = (question, answer) => {
    let studentAnswer = answer.value.trim();
    let correctAnswer = question.answer.trim();

    if (!question.caseSensitive) {
        studentAnswer = studentAnswer.toLowerCase();
        correctAnswer = correctAnswer.toLowerCase();
    }

    let isCorrect = studentAnswer === correctAnswer;

    return {
        isCorrect: isCorrect,
    };
};
