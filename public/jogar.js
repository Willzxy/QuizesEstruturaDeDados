// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// COLOQUE SUAS CHAVES DO FIREBASE AQUI
const firebaseConfig = {

  apiKey: "AIzaSyBH8X1xdGPbtOPCTv07629vOPcW7zLPSbk",

  authDomain: "quiz-projeto-b5274.firebaseapp.com",

  projectId: "quiz-projeto-b5274",

  storageBucket: "quiz-projeto-b5274.firebasestorage.app",

  messagingSenderId: "975123081436",

  appId: "1:975123081436:web:45d38d6b85bb9305f4ec19",

  measurementId: "G-54K23RJ7ZE"

};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Base de dados de perguntas
const questions = [
    { question: "Qual é o maior planeta do nosso Sistema Solar?", options: ["Terra", "Marte", "Júpiter", "Saturno", "Vênus"], correctAnswerIndex: 2 },
    { question: "Quem pintou a obra-prima 'Mona Lisa'?", options: ["Vincent van Gogh", "Pablo Picasso", "Michelangelo", "Leonardo da Vinci", "Claude Monet"], correctAnswerIndex: 3 },
    { question: "Qual é o elemento químico mais abundante na atmosfera terrestre?", options: ["Oxigênio", "Nitrogênio", "Gás Carbônico", "Hidrogênio", "Hélio"], correctAnswerIndex: 1 },
    { question: "Em que ano o ser humano pisou na Lua pela primeira vez?", options: ["1965", "1969", "1971", "1959", "1975"], correctAnswerIndex: 1 },
    { question: "Qual é a capital da Austrália?", options: ["Sydney", "Melbourne", "Brisbane", "Perth", "Camberra"], correctAnswerIndex: 4 },
    { question: "Quem escreveu o clássico da literatura 'Dom Quixote'?", options: ["William Shakespeare", "Miguel de Cervantes", "Machado de Assis", "Dante Alighieri", "Gabriel García Márquez"], correctAnswerIndex: 1 },
    { question: "Qual é o oceano mais profundo e extenso do mundo?", options: ["Oceano Atlântico", "Oceano Índico", "Oceano Ártico", "Oceano Antártico", "Oceano Pacífico"], correctAnswerIndex: 4 },
    { question: "Qual é a moeda oficial utilizada no Japão?", options: ["Yuan", "Won", "Iene", "Rupia", "Baht"], correctAnswerIndex: 2 },
    { question: "Qual é o osso mais longo do corpo humano?", options: ["Tíbia", "Fêmur", "Úmero", "Rádio", "Fíbula"], correctAnswerIndex: 1 },
    { question: "Qual país sediou a primeira Copa do Mundo de Futebol em 1930?", options: ["Brasil", "Itália", "França", "Argentina", "Uruguai"], correctAnswerIndex: 4 }
];

// Variáveis de Estado
let currentQuestionIndex = 0;
let score = 0;
let finalScore = 0;
let selectedOptionIndex = null;

// Elementos do DOM
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');

const quizArea = document.getElementById('quiz-area');
const saveArea = document.getElementById('save-area');
const leaderboardArea = document.getElementById('leaderboard-area');
const saveScoreBtn = document.getElementById('save-score-btn');

// Inicialização
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
}

function loadQuestion() {
    selectedOptionIndex = null;
    nextBtn.disabled = true;
    optionsContainer.innerHTML = '';

    const currentQuestion = questions[currentQuestionIndex];

    questionText.textContent = currentQuestion.question;
    questionCounter.textContent = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
    
    const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => selectOption(index, button));
        optionsContainer.appendChild(button);
    });
}

function selectOption(index, selectedButton) {
    selectedOptionIndex = index;
    nextBtn.disabled = false;

    const allOptions = optionsContainer.querySelectorAll('.option-btn');
    allOptions.forEach(btn => btn.classList.remove('selected'));
    selectedButton.classList.add('selected');
}

function handleNextQuestion() {
    const currentQuestion = questions[currentQuestionIndex];

    if (selectedOptionIndex === currentQuestion.correctAnswerIndex) {
        score++;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showSaveArea();
    }
}

function showSaveArea() {
    quizArea.classList.add('hidden');
    saveArea.classList.remove('hidden');

    progressBar.style.width = '100%';
    questionCounter.textContent = "Concluído";

    const totalQuestions = questions.length;
    finalScore = (score / totalQuestions) * 100;
    const wrongAnswers = totalQuestions - score;

    document.getElementById('score-text').textContent = finalScore;
    document.getElementById('correct-answers').textContent = score;
    document.getElementById('wrong-answers').textContent = wrongAnswers;
}

// ----------------------------------------------------
// Lógica de Salvar no Firebase e Mostrar Ranking
// ----------------------------------------------------

// 1. Clicou em "Salvar e Ver Ranking"
saveScoreBtn.addEventListener('click', async () => {
    const usernameInput = document.getElementById('username-input');
    const name = usernameInput.value.trim();

    if (name === "") {
        alert("Por favor, digite seu nome!");
        return;
    }

    // Desabilita o botão para não salvar duas vezes
    saveScoreBtn.disabled = true;
    saveScoreBtn.textContent = "Salvando...";

    try {
        // Salva na coleção "ranking" do Firestore
        await addDoc(collection(db, "ranking"), {
            nome: name,
            pontuacao: finalScore,
            data: new Date()
        });
        
        // Se salvou com sucesso, chama a tela de Leaderboard
        carregarLeaderboard();
        
    } catch (e) {
        console.error("Erro ao salvar documento: ", e);
        alert("Ocorreu um erro ao salvar sua pontuação.");
        saveScoreBtn.disabled = false;
        saveScoreBtn.textContent = "Salvar e Ver Ranking";
    }
});

// 2. Busca o Top 10 e mostra na tela
async function carregarLeaderboard() {
    // Esconde a tela de salvar e mostra a do leaderboard
    saveArea.classList.add('hidden');
    leaderboardArea.classList.remove('hidden');

    const leaderboardList = document.getElementById('leaderboard-list');

    try {
        // Cria a busca: Coleção "ranking", ordenada por pontuação (decrescente), limite de 10
        const q = query(collection(db, "ranking"), orderBy("pontuacao", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        // Limpa a lista de "Carregando..."
        leaderboardList.innerHTML = '';

        let posicao = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Cria os elementos da lista (<li>)
            const li = document.createElement('li');
            li.style.padding = "10px";
            li.style.borderBottom = "1px solid #eee";
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            
            li.innerHTML = `<span><strong>${posicao}º</strong> ${data.nome}</span> <span><strong>${data.pontuacao} pts</strong></span>`;
            
            leaderboardList.appendChild(li);
            posicao++;
        });

        // Caso o banco esteja vazio (embora você acabe de salvar um dado)
        if (leaderboardList.innerHTML === '') {
            leaderboardList.innerHTML = '<li>Nenhum jogador no ranking ainda.</li>';
        }

    } catch (e) {
        console.error("Erro ao buscar ranking: ", e);
        leaderboardList.innerHTML = '<li style="color: red;">Erro ao carregar o ranking.</li>';
    }
}

// Event Listeners
nextBtn.addEventListener('click', handleNextQuestion);

// Iniciar o jogo assim que o script carregar
startQuiz();