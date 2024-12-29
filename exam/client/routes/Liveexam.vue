<script setup>
  import { onMounted, ref } from 'vue';
  import { useStore } from '../store';

const store = useStore();
const currentQuestion = ref(0);
const selectedOption = ref(null);
  
  const handlePrevious = () => {
    if (selectedOption.value) {
      const response = store.progress.find(
        (item) => item.question === store.questions[currentQuestion.value].question
      );
      if (response) {
        response.option_selected = selectedOption.value;
      } else {
        progress.value.push({
          question: store.questions[currentQuestion.value].question,
          option_selected: selectedOption.value,
        });
      }
    }
    if (currentQuestion.value > 0) {
      currentQuestion.value--;
      selectedOption.value = null;
    }
  };

const handleNext = () => {
    if (selectedOption.value) {
      const response = store.progress.find(
        (item) => item.question === store.questions[currentQuestion.value].question
      );
      if (response) {
        response.option_selected = selectedOption.value;
      } else {
        progress.value.push({
          question: store.questions[currentQuestion.value].question,
          option_selected: selectedOption.value,
        });
      }
    }
    if (currentQuestion.value < store.questions.length - 1) {
      currentQuestion.value++;
      selectedOption.value = null;
    }
  }

  const clear = () => {
    selectedOption.value = null;
  };

  const saveAndMarkForReview = () => {
    // Logic to save the answer and mark for review
    if (selectedOption.value) {
      progress.value[currentQuestion.value].status = 'Marked for Review';
    }
  };

  const markForReviewAndNext = () => {
    // Logic to mark for review and go to the next question
    if (currentQuestion.value < store.questions.value.length - 1) {
      currentQuestion.value++;
      selectedOption.value = null;
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion.value > 0) {
      currentQuestion.value--;
      selectedOption.value = null;
    }
  };

onMounted(() => {
  store.questions = [
        { text: 'What is the integral of x?', options: ['x^2/2 + C', 'x^2 + C', '2x + C', 'x + C'] },
        { text: 'What is the derivative of x^2?', options: ['2x', 'x', 'x^2', '2'] },
        { text: 'What is the limit of (1/x) as x approaches infinity?', options: ['0', '1', 'Infinity', 'Undefined'] }
    ]
});
</script>


<template>
  <main class="flex-grow-1 overflow-auto">
  <div class="p-2 h-100">
    <div class="d-flex gap-2 h-100">
      <div class="flex-grow-1 h-100">
        <div class="card h-100">
          <div class="card-body d-flex flex-column h-100">
            <div class="flex-grow-1">
              <div class="question">
                <p>Question {{ currentQuestion + 1 }}:</p>
                <p>{{ store.questions[currentQuestion]?.text }}</p>
              </div>
              <div class="options">
                <div
                  v-for="(option, index) in store.questions[currentQuestion]?.options"
                  :key="index"
                  class="option"
                >
                  <input
                    type="radio"
                    :value="option"
                    v-model="selectedOption"
                  />
                  <label :for="option">{{ option }}</label>
                </div>
              </div>
            </div>
            <div class="buttons d-flex justify-content-between gap-2">
              <div class="d-flex gap-2">
                <button class="btn btn-primary" :disabled="currentQuestion === 0" @click="handlePrevious">
                  Previous
                </button>
                <button class="btn btn-primary" :disabled="currentQuestion === store.questions.length - 1" @click="handleNext">
                  Next
                </button>
              </div>
              <div class="d-flex gap-2">
                <button
                  class="btn btn-primary"
                  @click="markForReviewAndNext"
                >
                  Mark for Review & Next
                </button>
                <button class="btn btn-secondary" @click="clear">
                  Clear
                </button>
              </div>
            </div>
          </div> 
        </div>
        </div>
        <div class="h-100">
          <div class="card h-100 side-card">
            <h3 class="text-lg font-semibold mb-4">Question Panel</h3>
            <div class="grid grid-cols-5 gap-2">
              <button v-for="(_, index) in store.questions" 
                :key="index"
                @click="goToQuestion(index)"
                class="btn btn-outlined"
                :class="[
                  'w-10 h-10 rounded-lg text-center',
                  store.progress.find(item => item.question === store.questions[currentQuestion].question)?.option_selected ? 
                    'bg-green-500 text-white' : 
                    'bg-gray-300'
                ]"
              >
                {{ index + 1 }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  </template>

<style scoped>
  .container {
    margin-top: 20px;
  }
  .user-info {
    font-size: 14px;
  }
  .option {
    margin-bottom: 10px;
  }
  .sidebar {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
  }
</style>