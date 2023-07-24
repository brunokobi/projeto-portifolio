const brainBX = (text) => {
  console.log("brainBX1", text);
  let texto = text.toLowerCase().trim();
  console.log("brainBX2", texto);

  if (texto === "oi" || texto === "olá"||
  texto=== "ola" || texto === "oi, tudo bem?" || texto === "olá, tudo bem?" || texto === "ola, tudo bem?" ||
  texto === "oi, tudo bem" || texto === "olá, tudo bem" || texto === "ola, tudo bem" || texto === "oi, tudo bem com você?" ||
  texto === "olá, tudo bem com você?" || texto === "ola, tudo bem com você?" || texto === "oi, tudo bem com você") {
  
    return "Olá, tudo bem?";
  } else if (texto === "tudo bem" || texto === "como você está"
  || texto === "como vai você" || texto === "como você está se sentindo"||
  texto === "tudo bem com você" || texto === "tudo bem com você?" || texto === "tudo bem com você?") {  
    return "Estou bem, obrigado por perguntar.";
  } else if (texto === "como vai você" || texto === "como você está se sentindo") {
    return "Estou bem, obrigado por perguntar.";
  } else if (texto === "como você se chama?" || texto === "qual é o seu nome?") {
    return "Meu nome é BX.";
  } else if (texto === "qual é sua idade?" || texto === "quanto anos você tem?") {
    return "Meu nome é BX e tenho 1 ano.";
  } else if (texto === "qual é o significado da vida?" || texto === "qual é o sentido da vida?") {
    return "A resposta para essa pergunta é 42.";
  } else if (texto === "onde você mora" || texto === "onde você vive"|| texto === "onde você está"||
  texto === "onde você se encontra"|| texto === "onde você está agora"|| texto === "onde você está neste momento"
  || texto === "onde você está localizado"|| texto === "onde você está situado"|| texto === "onde você está localizado") { 
    return "Até logo! Tenha um bom dia!";
  } else if (texto === "bom dia" || texto === "bom dia, tudo bem?" || texto === "bom dia, tudo bem" || texto === "bom dia, tudo bem com você?" || texto === "bom dia, tudo bem com você") {
    return "Bom dia, tudo bem?";
  } else if (texto === "adeus" || texto === "tchau") {
    return "Até logo! Tenha um bom dia!";
  } else if (texto.includes("piada") || texto.includes("conto uma piada")) {
    return "Por que o peixe vive na água? Porque na terra ele morreria!";
  } else if (texto.includes("obrigado") || texto.includes("obrigada") || texto.includes("agradecido")) {
    return "De nada! Estou aqui para ajudar.";
  } else if (texto.includes("tempo") || texto.includes("clima") || texto.includes("previsão")) {
    return "Desculpe, mas não consigo fornecer informações sobre o clima no momento.";
  } else if (texto.includes("ajuda") || texto.includes("socorro") || texto.includes("não sei o que fazer")) {
    return "Não se preocupe, estou aqui para ajudar. Por favor, me diga como posso ser útil.";
  } else if (texto.includes("gosta de música") || texto.includes("qual é a sua música favorita")) {
    return "Eu não tenho preferência musical, mas posso lhe ajudar a encontrar uma música que você goste!";
  } else if (texto.includes("gosta de música") || texto.includes("qual é a sua música favorita")) {
    return "Eu não tenho preferência musical, mas posso ajudá-lo a encontrar uma música que você goste!";
  } else if (texto.includes("comida") || texto.includes("o que você come")) {
    return "Como sou um chatbot, não como comida, mas posso lhe dar receitas deliciosas!";
  } else if (texto.includes("hora") || texto.includes("que horas são") || texto.includes("hora certa")) {
    const dataAtual = new Date();
    const hora = dataAtual.getHours();
    const minutos = dataAtual.getMinutes();
    return `Agora são ${hora} horas e ${minutos} minutos.`;
  } else if (texto.includes("filme") || texto.includes("cinema") || texto.includes("recomendação de filme")) {
    return "Recomendo o filme 'Matrix'. É uma ótima opção!";
  } else if (texto.includes("esporte") || texto.includes("qual é o seu esporte favorito")) {
    return "Não pratico esportes, mas posso fornecer informações sobre esportes que você goste!";
  } else if (texto.includes("comprar") || texto.includes("loja") || texto.includes("onde comprar")) {
    return "Desculpe, como sou apenas um chatbot, não posso fazer compras, mas posso ajudá-lo a encontrar lojas online!";
  } else {
    return "Desculpe, não entendi o que você disse. Pode reformular a pergunta?";
  }
};

export default brainBX;
