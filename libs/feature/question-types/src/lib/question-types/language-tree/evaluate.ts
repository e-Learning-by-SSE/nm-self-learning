import { EvaluationFn } from "../../question-type-registry";

export const evaluateLanguageTreeAnswer: EvaluationFn<"language-tree"> = (question, answer) => {
    //Replace all whitespace characters with an empty string and trim the input
    let studentAnswer = answer.value.replace(/\s+/g, "").trim();
    let correctAnswers = question.answer.map((a) => a.replace(/\s+/g, "").trim());

    if (!question.caseSensitive) {
        studentAnswer = studentAnswer.toLowerCase();
        correctAnswers = correctAnswers.map((a) => a.toLowerCase());

    }

    const isCorrect = correctAnswers.some((correctAnswer) => studentAnswer === correctAnswer);

    return {
        isCorrect: isCorrect,
    };
};
