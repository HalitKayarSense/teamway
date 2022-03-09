import { useEffect, useState } from 'react'
import { getPersonalityTypes, getQuestions, PersonalityType, Question } from '../data'
import styles from '../styles/main.module.css'
import { setCookies, getCookie, removeCookies } from 'cookies-next';

//used for questions navigation
enum navDir {
  left = -1,
  right = 1
}

export default function QuestionsBox() {

  const [questions, setQuestions] = useState([] as Question[])
  const [answeredList, setAnsweredList] = useState([] as number[])
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isFinish, setIsFinish] = useState(false)

  //called once at start to get questions and any stored answers from json file and initialize the test
  const initialize = async () => {
    
    let _questions = await getQuestions();
    let _answered = [] as number[];
    let _startingQuestion = 0;
    console.log(_questions)

    let storedAnsweredList = getCookie('answeredList');

    //get stored answers and continue from last stopped point
    if (typeof storedAnsweredList != 'undefined') {
      _answered = Object.values(JSON.parse(storedAnsweredList as string));

      let count = 0;
      for (let i = 0; i < _answered.length; i++) {

        count += _answered[i] != -1 ? 1 : 0;
      }
      _startingQuestion = count;
    } else {
      for (let i = 0; i < _questions.length; i++) {
        _answered[i] = -1;
      }
    }

    setQuestions(_questions);
    setAnsweredList(_answered);
    setCurrentQuestionIndex(_startingQuestion);
    setProgress(_startingQuestion);
    setIsLoading(false);
  }

  //requires either 1 for right direction or -1 for left direction ( use enum navDir)
  const navQuestion = (dir: number) => {
    let newIndex = currentQuestionIndex + dir

    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentQuestionIndex(newIndex);
    }
    if (newIndex >= progress) setProgress(newIndex);
  }

  const finish = () => {
    removeCookies('answeredList');
    setIsFinish(true);
  }

  const setAnswer = (answerIndex: number) => {
    let tmp = { ...answeredList };
    let isFirstTime = tmp[currentQuestionIndex] == -1;
    tmp[currentQuestionIndex] = answerIndex;
    setAnsweredList(tmp)
    setCookies('answeredList', JSON.stringify(tmp));

    //in case the answer was selected first time, move to next question automatically
    if (isFirstTime) navQuestion(navDir.right)

  }

  useEffect(() => {
    initialize();
  }, []);

  //if is data is not loaded yet, return loading message
  if (isLoading)
    return (<div className={styles['loading-message']}>Loading...</div>)
  else
    return (
      <>
        {isFinish ? <FinishBox questions={questions} answeredList={answeredList} /> :
          <div>
            <Progress numberOfQuestions={questions.length} currentQuestionIndex={currentQuestionIndex} progress={progress} />

            <div className={styles['question-div']}>{questions[currentQuestionIndex].text}</div>
            {/*map over the answers from the question object*/}
            {console.log(currentQuestionIndex)}
            {questions[currentQuestionIndex].answers.map((answer, i) => {
              return (
                <div className={styles['answer-div-selection']} key={i} onClick={() => setAnswer(i)}>
                  <div className={styles['radius-selection-outer']} >
                    <div className={styles['radius-selection'] + " " + (answeredList[currentQuestionIndex] == i ? styles['radius-selection-selected'] : '')}></div>
                  </div>
                  <div className={styles['answer-box']}>{answer.text}</div>
                </div>
              )
            })}

            <hr className={styles['separator']} />

            {/*display prev button when the user pass after the first question*/}
            {currentQuestionIndex > 0 ?
              <button className={styles['nav-button'] + " " + styles['prev-button']} onClick={() => navQuestion(navDir.left)}>
                Previous
              </button> : ''}

            {/*display next button after the question was answer and the user wen't back to modify his answer, show finish if reached to last question*/}
            {currentQuestionIndex < questions.length && answeredList[currentQuestionIndex] != -1 ?
              <button className={styles['nav-button'] + " " + styles['next-button']} onClick={() => currentQuestionIndex == questions.length - 1 ? finish() : navQuestion(navDir.right)}>
                {currentQuestionIndex == questions.length - 1 ? "Finish" : "Next"}
              </button> : ''}
          </div>}
      </>
    )
}

const Progress: React.FC<{ numberOfQuestions: number, currentQuestionIndex: number, progress: number }> = ({ numberOfQuestions, currentQuestionIndex, progress }) => {

  const [percentage, setPercentage] = useState(0)

  //called everytime the progess is updated
  useEffect(() => {
    setPercentage(100.0 / numberOfQuestions * (progress))
  }, [numberOfQuestions, currentQuestionIndex, progress]);

  return (
    <>
      <div className={styles['progress-box']}>
        <div className={styles['progress-bar']}>
          <div className={styles['inner-progress-bar']} style={{ width: `${percentage}%` }}>

          </div>
        </div>
        <div className={styles['question-state']}>QUESTION {currentQuestionIndex + 1} OF {numberOfQuestions}</div>
        <div className={styles['question-percentage']}>{Math.round(percentage)}%</div>

      </div>
    </>
  )
}

const FinishBox: React.FC<{ questions: Question[], answeredList: number[] }> = ({ questions, answeredList }) => {

  const [verdict, setVerdict] = useState(0)
  const [personalityTypes, setPersonalityTypes] = useState([] as PersonalityType[])

  //calculate the score and compare to the data colleced from the json file, then set the verdict
  const setResults = async () => {
    let personalityTypes = await getPersonalityTypes();
    let score = 0;

    for (let i = 0; i < Object.entries(answeredList).length; i++) {
      score += questions[i].answers[answeredList[i]].weight;
    }
    let verdict = 0;
    for (let i = 1; i < personalityTypes.length; i++) {
      if (score >= personalityTypes[i].requiredScore) {
        verdict = i;
      }
    }
    setPersonalityTypes(personalityTypes);
    setVerdict(verdict);
  }
  useEffect(() => {
    setResults();
  }, [answeredList]);

  return (
    <>
      {personalityTypes.length > 0 ?
        <>
          <div className={styles['result-title']}>{personalityTypes[verdict].title}</div>
          <div className={styles['result-details']}>{personalityTypes[verdict].details}</div>
        </>
        : <div className={styles['result-title']}>Loading...</div>}
    </>
  )
}



