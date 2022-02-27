export interface Answer {
    text: string,
    weight: number
}

export interface Question {
    text: string,
    answers: Array<Answer>
}

export interface PersonalityType {
    readonly title: string;
    readonly details: string;
    readonly requiredScore: number;
}

export async function getQuestions() {
    let questions: Question[] = require('./public/data/questions.json');
    return questions;
}

export async function getPersonalityTypes() {
    let personalityTypes: PersonalityType[] = require('./public/data/personalityTypes.json');
    return personalityTypes;
}
