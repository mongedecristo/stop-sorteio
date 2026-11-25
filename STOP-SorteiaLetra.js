let partidas = 0;
let repetidas = ' KWY';
let contextoAudio = null;
let partidaIniciada = false;
let partidaEncerrada = false;
let relogioIniciado = false;
let fimPartida = 0;
let intervaloPartida = null;
let ultimoTicTac = null;
document.getElementById('tentativas').textContent = partidas;

function preparaAudio() {
  const AudioContexto = window.AudioContext || window.webkitAudioContext;
  if (!AudioContexto) {
    return;
  }

  if (!contextoAudio) {
    contextoAudio = new AudioContexto();
  }
  if (contextoAudio.state === 'suspended') {
    contextoAudio.resume();
  }
}

function tocaNota(frequencia, duracao, onda, volume, atraso = 0) {
  if (!contextoAudio) {
    return;
  }

  const oscilador = contextoAudio.createOscillator();
  const volumeNota = contextoAudio.createGain();
  const inicio = contextoAudio.currentTime + atraso;

  oscilador.type = onda;
  oscilador.frequency.setValueAtTime(frequencia, inicio);
  volumeNota.gain.setValueAtTime(0.0001, inicio);
  volumeNota.gain.exponentialRampToValueAtTime(volume, inicio + 0.015);
  volumeNota.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  oscilador.connect(volumeNota);
  volumeNota.connect(contextoAudio.destination);
  oscilador.start(inicio);
  oscilador.stop(inicio + duracao + 0.02);
}

function tocaSomInicio() {
  tocaNota(523.25, 0.16, 'triangle', 0.13);
  tocaNota(659.25, 0.16, 'triangle', 0.13, 0.15);
  tocaNota(783.99, 0.3, 'triangle', 0.16, 0.3);
}

function tocaSomContagem(numero) {
  const frequencia = 460 + (5 - numero) * 55;
  const duracao = numero === 0 ? 0.2 : 0.11;
  const onda = numero === 0 ? 'triangle' : 'sine';
  tocaNota(frequencia, duracao, onda, 0.12);
}

function tocaSomTicTac(segundosRestantes) {
  const frequencia = segundosRestantes % 2 === 0 ? 660 : 880;
  tocaNota(frequencia, 0.08, 'square', 0.14);
}

function tocaSomFim() {
  tocaNota(740, 0.14, 'square', 0.16);
  tocaNota(494, 0.18, 'square', 0.2, 0.16);
  tocaNota(165, 0.9, 'sawtooth', 0.24, 0.36);
  tocaNota(82, 0.9, 'square', 0.14, 0.36);
}

function encerraPartida() {
  if (partidaEncerrada) {
    return;
  }

  partidaEncerrada = true;
  window.clearInterval(intervaloPartida);
  document.getElementById('tempo-partida').textContent = '00:00';
  document.getElementById('mensagem-partida').textContent = 'TEMPO ESGOTADO — FIM DE PARTIDA!';
  document.getElementById('sortear').disabled = true;
  tocaSomFim();
}

function iniciaRelogioPartida() {
  const tempoPartida = document.getElementById('tempo-partida');
  fimPartida = Date.now() + 60000;
  ultimoTicTac = null;

  function atualizaRelogio() {
    const segundosRestantes = Math.max(0, Math.ceil((fimPartida - Date.now()) / 1000));
    const minutos = String(Math.floor(segundosRestantes / 60)).padStart(2, '0');
    const segundos = String(segundosRestantes % 60).padStart(2, '0');
    tempoPartida.textContent = `${minutos}:${segundos}`;

    if (segundosRestantes > 0 && segundosRestantes <= 5 && segundosRestantes !== ultimoTicTac) {
      ultimoTicTac = segundosRestantes;
      tocaSomTicTac(segundosRestantes);
    }

    if (segundosRestantes === 0) {
      encerraPartida();
    }
  }

  atualizaRelogio();
  intervaloPartida = window.setInterval(atualizaRelogio, 1000);
}

function atualizaExclusoes() {
  const exclusoesElement = document.getElementById('exclusoes');
  exclusoesElement.textContent = '';
  for (const letraExcluida of repetidas.trim()) {
    const item = document.createElement('li');
    item.textContent = letraExcluida;
    exclusoesElement.appendChild(item);
  }

  const alfabetoElement = document.getElementById('alfabeto');
  alfabetoElement.textContent = '';
  for (const letra of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const item = document.createElement('span');
    item.textContent = letra;
    if (repetidas.indexOf(letra) > 0) {
      item.className = 'indisponivel';
    }
    alfabetoElement.appendChild(item);
  }
}

function escolheLetra() {
  if (!partidaIniciada || partidaEncerrada) {
    return;
  }

  let caractere = '';
  let protegeDoInfinito = 1000;
  const numeroContagem = document.getElementById('numero-contagem');
  const letraElement = document.getElementById('letra');
  const desenhoElement = document.getElementById('desenho');
  const historicoElement = document.getElementById('historico');
  const botaoSortear = document.getElementById('sortear');

  botaoSortear.disabled = true;
  atualizaExclusoes();

  const formas = {
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
    J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    M: ['1000001', '1100011', '1010101', '1001001', '1000001', '1000001', '1000001'],
    N: ['100001', '110001', '101001', '101001', '100101', '100101', '100011', '100001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111']
  };

  function exibeLetraGrande(letra) {
    const desenho = formas[letra];
    if (!desenho) {
      desenhoElement.textContent = letra;
      return;
    }

    const linhas = [];
    for (const linha of desenho) {
      const ampliada = [...linha].map(pixel => pixel === '1' ? '████' : '    ').join('');
      linhas.push(ampliada, ampliada);
    }
    desenhoElement.textContent = linhas.join('\n');
  }
  
  function umSegundo(t) {
    setTimeout(() => {
      if (partidaEncerrada) {
        return;
      }

      const numero = 5 - t;
      numeroContagem.textContent = numero;
      tocaSomContagem(numero);
      if (t == 5) {
        letraElement.textContent = `A letra escolhida é: ${caractere}`;
        exibeLetraGrande(caractere);
        if (!relogioIniciado) {
          relogioIniciado = true;
          iniciaRelogioPartida();
        }
        const item = document.createElement('li');
        item.textContent = caractere;
        historicoElement.appendChild(item);
        partidas = historicoElement.children.length;
        document.getElementById('tentativas').textContent = partidas;
        if (repetidas.indexOf(caractere) === -1) {
          repetidas += caractere;
        }
        atualizaExclusoes();
        botaoSortear.disabled = false;
      }
    },1000*t); 
  }
  
  do {
    let letra = 26*Math.random();
    letra = Math.round(letra);
    caractere = String.fromCharCode(letra + 65);
    protegeDoInfinito--;
  } while ((repetidas.indexOf(caractere) > 0)||(protegeDoInfinito > 0)||(caractere > 'Z'));

  for(var i=5; i>=0; i--) {
    umSegundo(i);
  }
}
document.getElementById('sortear').addEventListener('click', escolheLetra);

const letrasIniciais = document.getElementById('letras-iniciais');
const filtraLetras = texto => texto.replace(/[^a-zA-Z]/g, '').toUpperCase();

letrasIniciais.addEventListener('input', () => {
  const valorAnterior = letrasIniciais.value;
  const inicio = letrasIniciais.selectionStart;
  const fim = letrasIniciais.selectionEnd;
  const valorFiltrado = filtraLetras(valorAnterior);

  if (valorFiltrado !== valorAnterior) {
    const novoInicio = filtraLetras(valorAnterior.slice(0, inicio)).length;
    const novoFim = filtraLetras(valorAnterior.slice(0, fim)).length;
    letrasIniciais.value = valorFiltrado;
    letrasIniciais.setSelectionRange(novoInicio, novoFim);
  }
});

document.getElementById('iniciar').addEventListener('click', () => {
  const letrasSelecionadas = Array.from(new Set(filtraLetras(letrasIniciais.value)));
  letrasIniciais.value = letrasSelecionadas.join('');

  if (letrasSelecionadas.length === 26) {
    document.getElementById('erro-configuracao').textContent =
      'Deixe pelo menos uma letra disponível para o sorteio.';
    return;
  }

  if (partidaIniciada) {
    return;
  }

  document.getElementById('erro-configuracao').textContent = '';
  repetidas = ` ${letrasSelecionadas.join('')}`;
  document.getElementById('configuracao').hidden = true;
  document.getElementById('area-jogo').hidden = false;
  partidaIniciada = true;
  preparaAudio();
  tocaSomInicio();
  escolheLetra();
});


