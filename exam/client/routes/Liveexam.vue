<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface Question {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

const examMetadata = {
  studentName: "John Doe",
  examName: "General Knowledge Test",
  subjectName: "General Studies",
  duration: 30
};

const questions = ref<Question[]>([]);
const currentQuestionIndex = ref(0);
const selectedAnswers = ref<{ [key: number]: string }>({});
const remainingTime = ref(examMetadata.duration * 60);
const questionStatus = ref<{ [key: number]: string }>({});
const showAlert = ref(false);
const alertMessage = ref('');
const showStats = ref(false);

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const startTimer = () => {
  const timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      clearInterval(timer);
      finishExam();
    }
  }, 1000);
};

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

const displayAlert = (message: string) => {
  alertMessage.value = message;
  showAlert.value = true;
  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
};

const goToQuestion = (index: number) => {
  currentQuestionIndex.value = index;
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    if (!selectedAnswers.value[currentQuestionIndex.value]) {
      questionStatus.value[currentQuestionIndex.value] = 'unanswered';
    }
    currentQuestionIndex.value++;
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const validateAnswer = () => {
  if (!selectedAnswers.value[currentQuestionIndex.value]) {
    displayAlert('Please select an option before proceeding');
    return false;
  }
  return true;
};

const saveAnswer = (status: string) => {
  if (!validateAnswer()) return;
  questionStatus.value[currentQuestionIndex.value] = status;
  nextQuestion();
};

const clearAnswer = () => {
  delete selectedAnswers.value[currentQuestionIndex.value];
  delete questionStatus.value[currentQuestionIndex.value];
};

const calculateStats = () => {
  const total = questions.value.length;
  const answered = Object.values(questionStatus.value).filter(status => 
    status === 'answered' || status === 'marked-answered'
  ).length;
  const marked = Object.values(questionStatus.value).filter(status => 
    status === 'marked' || status === 'marked-answered'
  ).length;
  const unanswered = Object.values(questionStatus.value).filter(status => 
    status === 'unanswered'
  ).length;
  const notVisited = total - Object.keys(questionStatus.value).length;

  return { total, answered, marked, notVisited, unanswered };
};

const finishExam = () => {
  showStats.value = true;
  const result = questions.value.map((_, index) => ({
    questionNumber: index + 1,
    selectedOption: selectedAnswers.value[index] || '',
    status: questionStatus.value[index] || 'not-visited'
  }));
  
  console.log('Exam Results:', JSON.stringify(result, null, 2));
};

onMounted(() => {
  const csvData = `question,optionA,optionB,optionC,optionD,correctOption
What is the capital of France?,Paris,London,Berlin,Madrid,A
Which planet is known as the Red Planet?,Earth,Mars,Jupiter,Saturn,B
What is the largest ocean on Earth?,Atlantic,Indian,Arctic,Pacific,D
Who wrote Romeo and Juliet?,Charles Dickens,Mark Twain,William Shakespeare,Jane Austen,C
What is the chemical symbol for water?,H2O,O2,CO2,N2,A`;

  questions.value = csvData.split('\n').slice(1).map(line => {
    const [question, optionA, optionB, optionC, optionD, correctOption] = line.split(',');
    return { question, optionA, optionB, optionC, optionD, correctOption };
  });

  startTimer();
});

const statusColors = {
  'answered': 'bg-success',
  'marked': 'bg-warning',
  'marked-answered': 'bg-info',
  'not-visited': 'bg-secondary',
  'unanswered': 'bg-danger'
};
</script>

<template>
  <div class="container-fluid min-vh-100 d-flex flex-column bg-light">
    <!-- Alert -->
    <div v-if="showAlert" class="fixed-top text-center p-3 alert alert-danger fade show">
      {{ alertMessage }}
    </div>

    <!-- Stats Modal -->
    <div v-if="showStats" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Exam Statistics</h5>
          </div>
          <div class="modal-body">
            <div class="mb-3"><strong>Total Questions:</strong> {{ calculateStats().total }}</div>
            <div class="mb-3"><strong>Answered:</strong> {{ calculateStats().answered }}</div>
            <div class="mb-3"><strong>Marked for Review:</strong> {{ calculateStats().marked }}</div>
            <div class="mb-3"><strong>Not Visited:</strong> {{ calculateStats().notVisited }}</div>
            <div class="mb-3"><strong>Unanswered:</strong> {{ calculateStats().unanswered }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="showStats = false">Close</button>
          </div>
        </div>
      </div>
    </div>
