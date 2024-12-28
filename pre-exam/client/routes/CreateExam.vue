<script setup>
import { ref, computed } from 'vue';
import { useRouter } from "vue-router";
import { showInfoMsg } from "../../../common/utils/common-utils";
import { useStore } from "../store";

const store = useStore();
const router = useRouter();

const examName = ref('');
const description = ref('');
const instructions = ref('');
const startDate = ref('');
const duration = ref(null);
const passingPercentage = ref(null);
const numberOfQuestions = ref(null);
const csvError = ref('');
const questionBank = ref(null);
const isCreateExamInProgress = ref(false);

const minDate = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
});

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type !== 'text/csv') {
    csvError.value = 'Please upload a valid CSV file.';
  } else {
    csvError.value = '';
  }

  if (file && file.type === 'text/csv') {
    questionBank.value = file;
  }
}

function handleCreateExam(event) {
  event.preventDefault();
  isCreateExamInProgress.value = true;
  if (csvError.value) {
    alert('Please fix the errors before submitting.');
    isCreateExamInProgress.value = false;
    return;
  }

  const longStartDate = new Date(startDate.value).getTime();

  const examData = {
    name: examName.value,
    description: description.value,
    instructions: instructions.value,
    startTime: String(longStartDate),
    duration: duration.value,
    passPercentage: passingPercentage.value,
    numberOfQuestions: numberOfQuestions.value,
  };

  const body = new FormData();

  Object.keys(examData).forEach((key) => {
    body.append(key, examData[key]);
  });

  if (questionBank.value) {
    body.append("questionBank", questionBank.value, "questionBank.csv");
  }

  fetch('/api/createexam', {
    method: 'POST',
    body,
  })
    .then(response => response.json())
    .then(response => {
      showInfoMsg(response.data.message, response.result);
      store.currentTab = "exams";
      router.push('/exams');
    })
    .catch((error) => {
      showInfoMsg(response.data.message, response.result);
    })
    .finally(() => {
      isCreateExamInProgress.value = false;
    });
}
</script>
  
<template>
  <main class="py-5 flex-grow-1 overflow-auto">
    <div class="container form-container">
      <form class="border p-4 rounded" @submit="handleCreateExam">
        <div class="mb-3">
          <label for="examName" class="form-label">Exam Name:</label>
          <input type="text" v-model="examName" id="examName" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="description" class="form-label">Description:</label>
          <textarea v-model="description" id="description" class="form-control" required></textarea>
        </div>

        <div class="mb-3">
          <label for="instructions" class="form-label">Instructions:</label>
          <textarea v-model="instructions" id="instructions" class="form-control"></textarea>
        </div>

        <div class="mb-3">
          <label for="startDate" class="form-label">Start Date and Time:</label>
          <input type="datetime-local" v-model="startDate" id="startDate" class="form-control" required :min="minDate" />
        </div>

        <div class="mb-3">
          <label for="duration" class="form-label">Duration (minutes):</label>
          <input type="number" v-model="duration" id="duration" class="form-control" required />
          <div v-if="duration <= 0" class="text-danger">Duration must be greater than 0.</div>
        </div>

        <div class="mb-3">
          <label for="passingPercentage" class="form-label">Passing Percentage:</label>
          <input type="number" v-model="passingPercentage" id="passingPercentage" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="numberOfQuestions" class="form-label">Number of Questions:</label>
          <input type="number" v-model="numberOfQuestions" id="numberOfQuestions" class="form-control" required />
          <div v-if="numberOfQuestions <= 0" class="text-danger">Number of Questions must be greater than 0.</div>
        </div>

        <div class="mb-3">
          <label for="questionsFile" class="form-label">Questions for Question Paper (CSV):</label>
          <input type="file" @change="handleFileUpload" id="questionsFile" class="form-control" accept=".csv" required />
          <div v-if="csvError" class="text-danger">{{ csvError }}</div>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="isCreateExamInProgress"  
        >
          <span
            v-if="isCreateExamInProgress"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          <i v-else class="bi bi-check-circle"></i> 
          Create Exam
        </button>
      </form>
    </div>
  </main>
</template>
