import React, { useState, useEffect } from 'react';
import * as qna from '@tensorflow-models/qna';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';



function QnA() {
  const [model, setModel] = useState(null);
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [answers, setAnswers] = useState([]);
  

  useEffect(() => {
    async function loadModel() {
      const loadedModel = await qna.load();
      console.log('Model loaded.', loadedModel);
      setModel(loadedModel);
    }
    loadModel();
  }, []);

  async function handleSearch() {
    const foundAnswers = await model.findAnswers(question, context);
    console.log('Model loaded.', question, context);
    console.log('Model loaded.', foundAnswers);
    setAnswers(foundAnswers);
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div>
      <label>
        Question:
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyPress={handleKeyPress}
        />
      </label>
      <br />
      <label>
        Context:
        <textarea
          value={context}
          onChange={(event) => setContext(event.target.value)}
        />
      </label>
      <br />
      <button onClick={handleSearch}>Search</button>
      <div>
        {answers.map((answer) => (
          <div key={answer.text}>
            {answer.text} (score = {answer.score})
          </div>
        ))}
      </div>
    </div>
  );
}

export default QnA;
