// Base de dados de perguntas
const questions = [
    {
        question: "Qual é o maior planeta do nosso Sistema Solar?",
        options: ["Terra", "Marte", "Júpiter", "Saturno", "Vênus"],
        correctAnswerIndex: 2
    },
    {
        question: "Quem pintou a obra-prima 'Mona Lisa'?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Michelangelo", "Leonardo da Vinci", "Claude Monet"],
        correctAnswerIndex: 3
    },
    {
        question: "Qual é o elemento químico mais abundante na atmosfera terrestre?",
        options: ["Oxigênio", "Nitrogênio", "Gás Carbônico", "Hidrogênio", "Hélio"],
        correctAnswerIndex: 1
    },
    {
        question: "Em que ano o ser humano pisou na Lua pela primeira vez?",
        options: ["1965", "1969", "1971", "1959", "1975"],
        correctAnswerIndex: 1
    },
    {
        question: "Qual é a capital da Austrália?",
        options: ["Sydney", "Melbourne", "Brisbane", "Perth", "Camberra"],
        correctAnswerIndex: 4
    },
    {
        question: "Quem escreveu o clássico da literatura 'Dom Quixote'?",
        options: ["William Shakespeare", "Miguel de Cervantes", "Machado de Assis", "Dante Alighieri", "Gabriel García Márquez"],
        correctAnswerIndex: 1
    },
    {
        question: "Qual é o oceano mais profundo e extenso do mundo?",
        options: ["Oceano Atlântico", "Oceano Índico", "Oceano Ártico", "Oceano Antártico", "Oceano Pacífico"],
        correctAnswerIndex: 4
    },
    {
        question: "Qual é a moeda oficial utilizada no Japão?",
        options: ["Yuan", "Won", "Iene", "Rupia", "Baht"],
        correctAnswerIndex: 2
    },
    {
        question: "Qual é o osso mais longo do corpo humano?",
        options: ["Tíbia", "Fêmur", "Úmero", "Rádio", "Fíbula"],
        correctAnswerIndex: 1
    },
    {
        question: "Qual país sediou a primeira Copa do Mundo de Futebol em 1930?",
        options: ["Brasil", "Itália", "França", "Argentina", "Uruguai"],
        correctAnswerIndex: 4
    }
];

// Variáveis de Estado
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;

// Elementos do DOM
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const quizArea = document.getElementById('quiz-area');
const resultArea = document.getElementById('result-area');

// Inicialização
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
}

function loadQuestion() {
    // Resetar estado
    selectedOptionIndex = null;
    nextBtn.disabled = true;
    optionsContainer.innerHTML = '';

    const currentQuestion = questions[currentQuestionIndex];

    // Atualizar UI
    questionText.textContent = currentQuestion.question;
    questionCounter.textContent = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
    
    // Atualizar Barra de Progresso
    const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Criar botões de opções
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
    nextBtn.disabled = false; // Habilita o botão de avançar

    // Remover classe 'selected' de todos os botões
    const allOptions = optionsContainer.querySelectorAll('.option-btn');
    allOptions.forEach(btn => btn.classList.remove('selected'));

    // Adicionar classe 'selected' ao botão clicado
    selectedButton.classList.add('selected');
}

function handleNextQuestion() {
    const currentQuestion = questions[currentQuestionIndex];

    // Verificar resposta
    if (selectedOptionIndex === currentQuestion.correctAnswerIndex) {
        score++;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    // Esconder quiz e mostrar resultados
    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');

    // Atualizar barra de progresso para 100%
    progressBar.style.width = '100%';
    questionCounter.textContent = "Concluído";

    // Calcular e exibir dados
    const totalQuestions = questions.length;
    const finalScore = (score / totalQuestions) * 100;
    const wrongAnswers = totalQuestions - score;

    document.getElementById('score-text').textContent = finalScore;
    document.getElementById('correct-answers').textContent = score;
    document.getElementById('wrong-answers').textContent = wrongAnswers;
}

// Event Listeners
nextBtn.addEventListener('click', handleNextQuestion);

// Iniciar o jogo assim que o script carregar
startQuiz();