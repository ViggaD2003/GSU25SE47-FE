import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title as ChartTitle,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    ChartTitle
);

const surveyTypes = [
    { value: 'emotional', label: 'Emotional Well-being' },
    { value: 'academic', label: 'Academic Performance' },
];
const dateRanges = [
    { value: 'start-end', label: 'Start Date → End Date' },
    { value: 'end-start', label: 'End Date → Start Date' },
];

const surveyChartData = {
    labels: ['Dec 1', 'Jan 1', 'Feb 1', 'Mar 1', 'Apr 1', 'May 1'],
    datasets: [
        {
            label: 'Depression (PHQ-9)',
            data: [8, 7, 6, 7, 8, 9],
            borderColor: '#8e44ad',
            backgroundColor: 'rgba(142,68,173,0.1)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#8e44ad',
        },
        {
            label: 'Anxiety (GAD-7)',
            data: [6, 5, 7, 6, 7, 8],
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39,174,96,0.1)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#27ae60',
        },
        {
            label: 'Stress (DASS-21)',
            data: [10, 11, 12, 13, 14, 16],
            borderColor: '#f1c40f',
            backgroundColor: 'rgba(241,196,15,0.1)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#f1c40f',
        },
    ],
};

const AppointmentDetails = () => {
    // const { t } = useTranslation();
    const [surveyType, setSurveyType] = useState(surveyTypes[0].value);
    const [dateRange, setDateRange] = useState(dateRanges[0].value);

    // Mock data for appointment and student
    const data = {
        meeting: {
            with: 'A',
            date: 'Saturday, May 24, 2025',
            time: '11:30 AM - 12:00 PM (30 minutes)',
            code: 'qtq-gqep-hxe',
            formality: 'Online',
            note: 'I am feeling not well today. My academic grade been so low lately.',
            status: 'Moderate',
        },
        student: {
            fullName: 'Nguyen Van A',
            sex: 'Male',
            dob: '9/5/2003',
            address: '75/5 Tan Huong Street, Ho Chi Minh city',
            phone: '0978544591',
            code: 'NH301',
            admission: '15/01/2025',
            status: 'Studying',
            semester: 'Term 1 2025 -2026',
            class: '8A4',
        },
    };

    const chartOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: { color: '#222', font: { size: 14 } },
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: { ticks: { color: '#222' } },
            y: { ticks: { color: '#222' } },
        },
    }), []);

    return (
        <div className="min-h-screen bg-[#f7f7f7] px-4 py-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <img src="/logo.svg" alt="logo" className="w-10 h-10" />
                    <span className="text-lg font-semibold text-gray-900">Meeting with {data.meeting.with}</span>
                    <span className="ml-2 px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">{data.meeting.status}</span>
                </div>
                <div className="text-gray-700 mb-2">
                    <span className="mr-4">{data.meeting.date}</span>
                    <span>{data.meeting.time}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-green-700 text-sm">{data.meeting.code}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">Online</span>
                </div>
                <div className="mb-2">
                    <span className="font-semibold">Student's Note</span>
                    <div className="text-gray-800">{data.meeting.note}</div>
                </div>
                <div className="flex gap-2 mb-4">
                    <button className="bg-green-700 text-white px-6 py-2 rounded font-semibold hover:bg-green-800">Join</button>
                    <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-semibold hover:bg-gray-300">Chat with participant</button>
                </div>
                {/* Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <div className="font-bold mb-2 text-[22px] text-black">Personal Infomation</div>
                        <div className="bg-[#f3fff6] rounded-xl p-6">
                            <div className="flex mb-1">
                                <span className="font-bold min-w-[130px] text-[#111]">Full Name</span>
                                <span className="text-[#222]">{data.student.fullName}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="font-bold min-w-[130px] text-[#111]">Sex</span>
                                <span className="text-[#222]">{data.student.sex}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="font-bold min-w-[130px] text-[#111]">Date of Birth</span>
                                <span className="text-[#222]">{data.student.dob}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="font-bold min-w-[130px] text-[#111]">Address</span>
                                <span className="text-[#222]">{data.student.address}</span>
                            </div>
                            <div className="flex">
                                <span className="font-bold min-w-[130px] text-[#111]">Phone Number</span>
                                <span className="text-[#222]">{data.student.phone}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="font-bold mb-2 text-[22px] text-black">Study Information</div>
                        <div className="bg-[#f3fff6] rounded-xl p-6">
                            <div className="flex mb-1">
                                <span className="font-bold min-w-[130px] text-[#111]">Code Student</span>
                                <span className="text-[#222]">{data.student.code}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="font-bold min-w-[130px] text-[#111]">Admission date</span>
                                <span className="text-[#222]">{data.student.admission}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="font-bold min-w-[130px] text-[#111]">Status</span>
                                <span className="text-[#222]">{data.student.status}</span>
                            </div>
                            <div className="flex mb-1">
                                <span className="font-bold min-w-[130px] text-[#111]">Semester</span>
                                <span className="text-[#222]">{data.student.semester}</span>
                            </div>
                            <div className="flex">
                                <span className="font-bold min-w-[130px] text-[#111]">Class</span>
                                <span className="text-[#222]">{data.student.class}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Survey Progress Chart */}
                <div className="bg-white rounded-lg p-4 border mt-4">
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                        <div className="font-semibold">Survey Progress Over Time</div>
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={surveyType}
                            onChange={e => setSurveyType(e.target.value)}
                        >
                            {surveyTypes.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value)}
                        >
                            {dateRanges.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="h-64">
                        <Line data={surveyChartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetails; 