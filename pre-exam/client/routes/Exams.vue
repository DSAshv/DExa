<script setup>
import { ref, onMounted } from 'vue';
import { EXAM_STATUS, EXAM_STATUS_TEXT } from '../../../common/constants/common-constants';
import { useStore } from '../store';
import ConfigHolder from '../../../common/utils/config-holder';
import { API_RESPONSE } from '../../../common/constants/common-constants';
import { showInfoMsg } from '../../../common/utils/common-utils';

const store = useStore();

const isApiInProgress = ref(false);
const isFetchingExams = ref(false);
const currentExam = ref(null);
const examSearch = ref('');

function handleViewExam (examId) {
    currentExam.value = store.exams.find(exam => exam._id === examId);
}

function handleExam(examId, mode) {
    isApiInProgress.value = true;
    const body = new FormData();
    body.append("mode", mode);
    body.append("examId", examId);
    fetch(`${ConfigHolder.origin}/api/exams`, {
        method: "POST",
        body
    })
        .then((response) => response.json())
        .then((response) => {
            showInfoMsg(response.data.message, response.result);
            if (response.result === API_RESPONSE.SUCCESS) {
                const exam = store.exams.find(_exam => _exam._id === examId);
                if (mode === 'schedule') {
                    exam.status = EXAM_STATUS.EXAM_SCHEDULED;
                    currentExam.value.status = EXAM_STATUS.EXAM_SCHEDULED;
                } else if (mode === 'register') {
                    exam.hasRegistered = true;
                    currentExam.value.hasRegistered = true;
                }
            }
        }).catch((error) => {
            console.error('Failed to fetch exams:', error);
        }).finally(() => {
            isApiInProgress.value = false;
        });
}

function handleDownloadHallTicket(examId) {
    const body = new FormData();
    body.append("mode", "downloadHallTicket");
    body.append("examId", examId);
    fetch(`${ConfigHolder.origin}/api/exams`, {
        method: "POST",
        body
    })
        .then((response) => response.blob())
        .then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'hall-ticket.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }).catch((error) => {
            console.error('Failed to fetch exams:', error);
        });
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
            if (response.result === API_RESPONSE.SUCCESS) {
                store.exams = response.data.exams;
            } else {
                showInfoMsg(response.data.message, response.result);
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
                class="card p-4 d-flex flex-row align-items-start gap-4 cursor-pointer overflow-auto"
            >
                <div class="icon-2">
                    <i 
                        class="bi bi-journal-text"
                        :class="{
                            'text-success': exam.hasRegistered || exam.status === EXAM_STATUS.EXAM_SCHEDULED,
                            'text-primary': !exam.hasRegistered
                        }"
                    ></i>
                </div>
                <div class="flex-grow-1">
                    <h4 class="text-truncate">{{ `${exam.name}${exam.hasRegistered ? ' | Registered' : ''}` }}</h4>
                    <p class="text-truncate m-0"><span class="fw-medium">Description - </span>{{ exam.description }}</p>
                    <p class="text-truncate m-0"><span class="fw-medium">Status - </span>{{ EXAM_STATUS_TEXT[exam.status] }}</p>
                    <p class="text-truncate m-0"><span><span class="fw-medium">Start Time - </span>{{ new Date(Number(exam.startTime)) }}</span></p>
                    <p class="text-truncate m-0"><span><span class="fw-medium">Created At - </span>{{ new Date(Number(exam.createdAt)) }}</span></p>
                </div>
                <div class="d-flex align-items-center h-100">
                    <button
                        v-if="ConfigHolder.isStudent && exam.status === EXAM_STATUS.EXAM_SCHEDULED" 
                        type="button" class="btn btn-primary"
                        @click="handleDownloadHallTicket(exam._id)"
                    >
                        <i class="bi bi-arrow-down-circle-fill"></i>
                        Download Hall Ticket
                    </button>
                </div>
            </div>
        </section>
    </main>
    <div class="modal fade" id="examViewModal" tabindex="-1" aria-labelledby="examViewModal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title fs-5 text-primary">Exam View</h2>
                    <button type="button" class="btn-close" id="exam-view-modal-close-btn" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div><i class="bi icon-2 text-primary bi-journal-text"></i></div>
                    <h4 class="fw-bold">{{ currentExam?.name }}</h4>
                    <p class="m-0"><span>Status - </span>{{ EXAM_STATUS_TEXT[currentExam?.status] }}</p>
                    <p class="m-0"><span>Description - </span>{{ currentExam?.description }}</p>
                    <p class="m-0"><span>Instructions - </span>{{ currentExam?.instructions }}</p>
                    <p class="m-0"><span>Duration - </span>{{ currentExam?.duration }} minutes</p>
                    <p class="m-0"><span>Pass Percentage - </span>{{ currentExam?.passPercentage }}%</p>
                    <p class="m-0"><span>Number of Questions - </span>{{ currentExam?.numberOfQuestions }}</p>
                    <p class="m-0"><span>Start Time - </span>{{ new Date(Number(currentExam?.startTime)) }}</p>
                    <p class="m-0"><span>Created At - </span>{{ new Date(Number(currentExam?.createdAt)) }}</p>
                    <template v-if="currentExam?.hasOwnProperty('registrations')">
                        <hr />
                        <h4>Registrations ({{ currentExam?.registrations?.length }})</h4>
                        <div>
                            <p class="m-0" v-if="currentExam?.registrations.length === 0">No registrations yet!</p>
                            <div v-else class="d-flex flex-column gap-2">
                                <div  
                                    v-for="registration in currentExam?.registrations" 
                                    :key="registration._id"
                                    class="card p-2 d-flex flex-row align-items-center gap-2"
                                >
                                    <div class="icon-3">
                                        <i 
                                            class="bi bi-person-fill"
                                        ></i>
                                    </div>
                                    <div class="overflow-hidden">
                                        <p class="text-truncate m-0">{{ registration.studentInfo.name }} | {{ registration.studentInfo.email }}</p>
                                        <p class="text-truncate m-0"><span>{{ new Date(Number(registration.createdAt)) }}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                <div class="modal-footer">
                    <button 
                        v-if="ConfigHolder.isStudent && (currentExam?.status !== 'examLive' && currentExam?.status !== 'examEnd')" 
                        type="button" class="btn btn-primary" 
                        :disabled="currentExam?.hasRegistered"
                        @click="handleExam(currentExam?._id, 'register')"
                    >
                        <span
                            v-if="isApiInProgress"
                            class="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                        />
                        {{ currentExam?.hasRegistered ? "Registered" : "Register"}}
                    </button>
                    <button
                        v-if="ConfigHolder.isOrgAdmin && currentExam?.status === 'applicationOpen'" 
                        type="button" class="btn btn-primary"
                        @click="handleExam(currentExam?._id, 'schedule')"
                    >
                        Schedule Exam
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
