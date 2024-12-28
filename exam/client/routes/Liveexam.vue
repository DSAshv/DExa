<template>
  <div class="d-flex flex-column min-vh-100 bg-light">
    <!-- Alert -->
    <div v-if="showAlert" 
         class="position-fixed top-0 start-50 translate-middle-x alert alert-danger text-center shadow-lg z-3">
      {{ alertMessage }}
    </div>

    <!-- Stats Modal -->
    <div v-if="showStats" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3">
      <div class="bg-white p-4 rounded shadow-lg">
        <h2 class="h4 fw-bold mb-3">Exam Statistics</h2>
        <div class="mb-3">
          <p>Total Questions: <span class="fw-semibold">{{ calculateStats().total }}</span></p>
          <p>Answered: <span class="fw-semibold">{{ calculateStats().answered }}</span></p>
          <p>Marked for Review: <span class="fw-semibold">{{ calculateStats().marked }}</span></p>
          <p>Not Visited: <span class="fw-semibold">{{ calculateStats().notVisited }}</span></p>
          <p>Unanswered: <span class="fw-semibold">{{ calculateStats().unanswered }}</span></p>
        </div>
        <button 
          @click="showStats = false"
          class="btn btn-primary w-100">Finish</button>
      </div>
    </div>

    <!-- Header Section -->
    <div class="bg-white shadow-sm py-3 px-4">
      <div class="row">
        <div class="col">
          <p><strong>Student Name:</strong> {{ examMetadata.studentName }}</p>
          <p><strong>Subject:</strong> {{ examMetadata.subjectName }}</p>
        </div>
        <div class="col text-end">
          <p><strong>Exam Name:</strong> {{ examMetadata.examName }}</p>
          <p><strong>Time Remaining:</strong> {{ formatTime(remainingTime) }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="d-flex flex-fill px-4 py-3">
      <!-- Question Section -->
      <div class="flex-fill bg-white rounded shadow-sm p-4 d-flex flex-column">
        <div v-if="currentQuestion" class="mb-4">
          <h2 class="h5 fw-bold">Question {{ currentQuestionIndex + 1 }}</h2>
          <p>{{ currentQuestion.question }}</p>

          <!-- Options -->
          <div>
            <div v-for="option in ['A', 'B', 'C', 'D']" :key="option" class="form-check mb-2">
              <input 
                type="radio" 
                :id="'option' + option" 
                :name="'question' + currentQuestionIndex"
                :value="option" 
                v-model="selectedAnswers[currentQuestionIndex]"
                class="form-check-input">
              <label :for="'option' + option" class="form-check-label">
                {{ currentQuestion['option' + option] }}
              </label>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-auto">
          <div class="d-flex justify-content-between">
            <button @click="previousQuestion" 
                    :disabled="currentQuestionIndex === 0"
                    class="btn btn-secondary">Back</button>

            <div class="d-flex gap-2">
              <button @click="saveAnswer('answered')" 
                      class="btn btn-success">Save & Next</button>
              <button @click="clearAnswer" 
                      class="btn btn-danger">Clear</button>
              <button @click="saveAnswer('marked')" 
                      class="btn btn-warning">Mark for Review</button>
              <button @click="saveAnswer('marked-answered')" 
                      class="btn btn-info">Save & Mark for Review</button>
            </div>

            <button @click="nextQuestion" 
                    :disabled="currentQuestionIndex === questions.length - 1"
                    class="btn btn-secondary">Next</button>
          </div>

          <!-- Finish Button -->
          <div class="text-center mt-4" v-if="currentQuestionIndex === questions.length - 1">
            <button @click="finishExam" class="btn btn-purple text-white px-4">Finish Exam</button>
          </div>
        </div>
      </div>

      <!-- Question Panel -->
      <div class="ms-4 w-25 bg-white rounded shadow-sm p-4">
        <h3 class="h6 fw-bold mb-3">Question Panel</h3>
        <div class="d-flex flex-wrap gap-2">
          <button v-for="(_, index) in questions" 
                  :key="index"
                  @click="goToQuestion(index)"
                  :class="[
                    'btn btn-sm',
                    questionStatus[index] ? statusColors[questionStatus[index]] : 'btn-outline-secondary'
                  ]">
            {{ index + 1 }}
          </button>
        </div>

        <!-- Legend -->
        <div class="mt-4">
          <h4 class="h6">Legend:</h4>
          <div v-for="(color, status) in statusColors" :key="status" class="d-flex align-items-center gap-2">
            <span :class="['badge', color]"></span>
            <span class="text-capitalize">{{ status.replace('-', ' ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // Your existing Vue.js script code remains unchanged
};
</script>

<style scoped>
/******** Bootstrap Status Colors ********/
.answered {
  background-color: #28a745;
  color: white;
}
.marked {
  background-color: #ffc107;
  color: white;
}
.marked-answered {
  background-color: #17a2b8;
  color: white;
}
.not-visited {
  background-color: #6c757d;
  color: white;
}
.unanswered {
  background-color: #dc3545;
  color: white;
}
</style>
