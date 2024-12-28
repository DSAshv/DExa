<script setup>
import { ref, onMounted } from 'vue';
import { EXAM_STATUS_TEXT } from '../../../common/constants/common-constants';
import { useStore } from '../store';
import ConfigHolder from '../../../common/utils/config-holder';
import { API_RESPONSE } from '../../../common/constants/common-constants';
import {showInfoMsg} from '../../../common/utils/common-utils';

const store = useStore();

const isFetchingExams = ref(false);
const currentExam = ref(null);
const examSearch = ref('');

function handleViewExam (examId) {
    currentExam.value = store.exams.find(exam => exam._id === examId);
}

onMounted(async () => {
    isFetchingExams.value = true;
    const body = new FormData();
    body.append("mode", "get");
    fetch(`${ConfigHolder.origin}/api/exams`, {
        method: "POST",
        body
    })
        .then((response) => response.json())
        .then((response) => {
            showInfoMsg(response.data.message, response.result);
            if (response.result === API_RESPONSE.SUCCESS) {
                store.exams = response.data.exams;
            }
        }).catch((error) => {
            console.error('Failed to fetch exams:', error);
        }).finally(() => {
            isFetchingExams.value = false;
        });
});
</script>

<template>
    <main v-if="isFetchingExams" class="d-flex justify-content-center align-items-center flex-grow-1">
        <div class="d-flex justify-content-center align-items-center flex-grow-1">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Fetching exams...</span>
            </div>
            <span class="ms-2">Fetching exams...</span>
        </div>
    </main>
    <main v-else class="p-2 d-flex flex-column flex-grow-1 overflow-auto">
        <section class="d-flex justify-content-between align-items-center">
            <div class="input-group search-input">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="basic-addon1">
                        <i class="bi bi-search"></i>
                    </span>
                </div>
                <input type="text" v-model="examSearch" class="form-control" placeholder="Search Exams" aria-label="Search Exams" aria-describedby="Search Exams" />
            </div>
        </section>
        <hr />
        <section class="d-flex gap-2 flex-column flex-grow-1 overflow-auto">
            <div
                class="justify-self-center d-flex flex-column align-items-center m-auto" 
                v-if="store.exams.length === 0"
            >
                <span class="icon-1"><i class="bi text-primary bi-journal-text"></i></span>
                <p>No Exams are available at the moment! Come back later!</p>
            </div>
            <div 
                v-else 
                v-for="exam in store.exams.filter((exam) => exam.name?.toLowerCase().includes(examSearch.toLowerCase()))" 
                :key="exam._id"
                @click="handleViewExam(exam._id)"
                data-bs-toggle="modal" data-bs-target="#examViewModal"
                class="card p-4 d-flex flex-row align-items-start gap-4 cursor-pointer"
            >
                <div class="icon-2">
                    <i 
                        class="bi bi-journal-text"
                        :class="{
                            'text-success': exam.hasRegistered,
                            'text-primary': !exam.hasRegistered
                        }"
                    ></i>
                </div>
                <div>
                    <h4 class="text-truncate">{{ exam.name }}</h4>
                    <p class="text-truncate m-0"><span class="fw-medium">Description - </span>{{ exam.description }}</p>
                    <p class="text-truncate m-0"><span class="fw-medium">Status - </span>{{ EXAM_STATUS_TEXT[exam.status] }}</p>
                    <p class="text-truncate m-0"><span><span class="fw-medium">Start Time - </span>{{ new Date(Number(exam.startTime)) }}</span></p>
                    <p class="text-truncate m-0"><span><span class="fw-medium">Created At - </span>{{ new Date(Number(exam.createdAt)) }}</span></p>
                </div>
            </div>
        </section>
    </main>
    <div class="modal fade" id="examViewModal" tabindex="-1" aria-labelledby="examViewModal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title fs-5 text-primary">Exam View</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div><i class="bi icon-2 text-primary bi-journal-text"></i></div>
                    <h4 class="fw-bold">{{ currentExam?.name }}</h4>
                    <p class="m-0"><span class="fw-semibold">Status - </span>{{ EXAM_STATUS_TEXT[currentExam?.status] }}</p>
                    <p class="m-0"><span class="fw-semibold">Description - </span>{{ currentExam?.description }}</p>
                    <p class="m-0"><span class="fw-semibold">Instructions - </span>{{ currentExam?.instructions }}</p>
                    <p class="m-0"><span class="fw-semibold">Duration - </span>{{ currentExam?.duration }} minutes</p>
                    <p class="m-0"><span class="fw-semibold">Pass Percentage - </span>{{ currentExam?.passPercentage }}%</p>
                    <p class="m-0"><span class="fw-semibold">Number of Questions - </span>{{ currentExam?.numberOfQuestions }}</p>
                    <p class="m-0"><span class="fw-semibold">Start Time - </span>{{ new Date(Number(currentExam?.startTime)) }}</p>
                    <p class="m-0"><span class="fw-semibold">Created At - </span>{{ new Date(Number(currentExam?.createdAt)) }}</p>
                </div>
                <div class="modal-footer">
                    <button v-if="ConfigHolder.isStudent && (currentExam?.status !== 'examLive' && currentExam?.status !== 'examEnd')" type="button" class="btn btn-primary" :disabled="currentExam?.hasRegistered">{{ currentExam?.hasRegistered ? "Registered" : "Register"}}</button>
                    <button v-if="ConfigHolder.isOrgAdmin && currentExam?.status === 'applicationOpen'" type="button" class="btn btn-primary">Schedule Exam</button>
                </div>
            </div>
        </div>
    </div>
</template>
