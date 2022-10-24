import placas from "../../assets/img/placas.png";
import bio from "../../assets/img/bio.png";
export const projects = [
  
  {
    title: "Guia Alimentar BR",
    link: "https://www.youtube.com/embed/8VxPXpS-qHg?compact=1",
    demo: "https://play.google.com/store/apps/details?id=com.guiaalimentar.guiaalimentarbr",
    description: `Aplicativo do Guia Alimentar Brasileiro, desenvolvido pra o TCC da aluna de Nutrição Rafaela Soares Souza Kobi,
     o aplicativo foi desenvolvido em React Native pelo FrameWork Expo e foi Publicado na PlayStore do Google para dispositivos Android.
     \n Aplicativo do Guia Alimentar Brasileiro, trabalho que pude participar exposto no XXVII Congresso Brasileiro de Nutrição, o maior congresso na América Latina de Alimentação e Nutrição, na feira nutri saber.,
     `,
    tags: ["#REACT NATIVE", "#EXPO", "#ANDROID", "#NUTRIÇÃO"],
    code: "https://github.com/brunokobi/guiaalimentarBR",
  },
  {
    title: "Presence Now",
    link: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6772979792737296384?compact=1",
    demo: "https://presencenowreconhecimento.netlify.app/",
    description: `Presence Now é um software de aferição de assiduidade estudantil por reconhecimento facial em real-time , o FrontEnd foi desenvolvido em react utilizando typescript , o BackEnd utiliza as mesmas linguagens, e foi implementado em formado de Rest API, o módulo de reconhecimento facial utiliza apenas Javascript, HTML e CSS , mas faz uso da faceapi.js que utiliza a API do tensorflow.js e implementa uma série de redes neurais convulsionais (CNNs).
    O sistema basicamente vai fazer o registro da presença do aluno através do reconhecimento facial em tempo real.`,
    tags: ["#REACT", "#NODE", "#FACEAPI.JS", "#RECONHECIMENTO FACIAL"],
    code: "https://github.com/brunokobi/tccreconhecimento",
  },

  {
    title: "Quiz da Etica - Aplicativo",
    link: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6737201843161616384?compact=1",
    demo: "https://www.youtube.com/watch?v=euJuoEGtpnU&ab_channel=BrunoKobi",
    description: `Projeto Integrador desenvolvido no ultimo periodo da graduação e conjunto
     com Lucas Barbosa da Silva , utilizando java pelo Android Studio`,
    tags: ["#JAVA", "#ANDROID", "#ÉTICA"],
    code: "https://github.com/brunokobi/QuizdaEtica",
  },

  {
    title: "JOGO DAS PLACAS ",
    link: "",
    img: placas,
    demo: "https://jogodasplacas.netlify.app/",
    description: `Um jogo educacional relacionado à educação no trânsito no que se refere as placas de trânsito, foi desenvolvido como trabalho da matéria de multimídia,
     sendo feita toda da edição de imagens e áudios, linguagens utilizadas Javascript,HTML e CSS`,
    tags: ["#HTML5", "#CSS3", "#JAVASCRIPT"],
    code: "https://github.com/brunokobi/JogoMemoriaPlacas",
  },

  {
    title: "Quiz Web Biomedicina Unisales",
    link: "",
    img: bio,
    demo: "https://biomedicina.netlify.app/",
    description: `Site de Quiz Online desenvolvido para os alunos do Curso de Biomedicina da Unisales `,
    tags: ["#REACT"],
    code: "https://github.com/brunokobi/biomedicina",
  },

 
];
