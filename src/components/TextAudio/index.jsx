  const falar = (text) => { 
    let som = localStorage.getItem('Audio');

    if(text === 'Github'){
      text = 'Git Hub'
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const word = new SpeechSynthesisUtterance(text);
    word.rate = 0.8;
   
    if (som === 'on') {
      synth.speak(word);  
    }else if(som === 'off'){
      synth.cancel();
    }else{
      synth.cancel();
    }   
  }

  export default falar;