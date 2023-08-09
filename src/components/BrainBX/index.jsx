const brainBX = (text) => {
  console.log("brainBX1", text);
  let texto = text.toLowerCase().trim();
  console.log("brainBX2", texto);

  if (
    texto.includes("oi") || texto.includes("olá ") || texto.includes("ola ") ||
    texto.includes("oi, tudo bem?") || texto.includes("olá, tudo bem?") || texto.includes("ola, tudo bem?") ||
    texto.includes("oi, tudo bem") || texto.includes("olá, tudo bem") || texto.includes("ola, tudo bem") ||
    texto.includes("oi, tudo bem com você?") || texto.includes("olá, tudo bem com você?") || texto.includes("ola, tudo bem com você?")
  ) {
    return "Olá, tudo bem?";
  } else if (
    texto.includes("tudo bem") || texto.includes("como você está") || texto.includes("como vai você") ||
    texto.includes("como você está se sentindo") || texto.includes("tudo bem com você") || texto.includes("tudo bem com você?")
  ) {
    return "Estou bem, obrigado por perguntar.";
  } else if (
    texto.includes("como vai você") || texto.includes("como você está se sentindo")
  ) {
    return "Estou bem, obrigado por perguntar.";
  } else if (
    texto.includes("como você se chama?") || texto.includes("qual é o seu nome?")
  ) {
    return "Meu nome é BX.";
  } else if (
    texto.includes("qual é sua idade?") || texto.includes("quanto anos você tem?")
  ) {
    return "Meu nome é BX e tenho 1 ano.";
  } else if (
    texto.includes("qual é o significado da vida?") || texto.includes("qual é o sentido da vida?")
  ) {
    return "A resposta para essa pergunta é 42.";
  } else if (
    texto.includes("onde você mora") || texto.includes("onde você vive") || texto.includes("onde você está") ||
    texto.includes("onde você se encontra") || texto.includes("onde você está agora") || texto.includes("onde você está neste momento") ||
    texto.includes("onde você está localizado") || texto.includes("onde você está situado") || texto.includes("onde você está localizado")
  ) {
    return "Até logo! Tenha um bom dia!";
  } else if (
    texto.includes("bom dia") || texto.includes("bom dia, tudo bem?") || texto.includes("bom dia, tudo bem") ||
    texto.includes("bom dia, tudo bem com você?") || texto.includes("bom dia, tudo bem com você")
  ) {
    return "Bom dia, tudo bem?";
  } else if (
    texto.includes("adeus") || texto.includes("tchau")
  ) {
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
