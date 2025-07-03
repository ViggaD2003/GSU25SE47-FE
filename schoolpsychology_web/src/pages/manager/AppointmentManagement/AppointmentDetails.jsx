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
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom';
// import { useParams } from 'react-router-dom';

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
    const { t } = useTranslation();
    // const { id } = useParams();
    const [surveyType, setSurveyType] = useState(surveyTypes[0].value);
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();


    // Mock data for appointment and student
    const data = {
        meeting: {
            with: 'A',
            date: 'Saturday, May 24, 2025',
            time: '11:30 AM - 12:00 PM (30 minutes)',
            code: 'qtq-gqep-hxe',
            formality: 'Online',
            note: 'I am feeling not well today. My academic grade been so low lately.',
            status: t('appointmentDetails.moderate'),
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
        <div className="space-y-8">
            <button
                className={`mb-4 px-6 py-2 rounded-lg font-semibold transition ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                onClick={() => navigate('/appointment-management')}
            >
                &#8592; Back to Management
            </button>
            <div className={`max-w-[1200px] mx-auto rounded-2xl shadow-lg p-10 flex flex-col gap-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('appointmentDetails.meetingWith', { name: data.meeting.with })}</span>
                    <span className="ml-2 px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-sm font-semibold">{data.meeting.status}</span>
                </div>
                <div className={`flex gap-8 mb-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span>{data.meeting.date}</span>
                    <span>{data.meeting.time}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded text-green-700 text-base">{data.meeting.code}</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-semibold">{data.meeting.formality}</span>
                </div>
                <div className="mb-2">
                    <span className={`font-semibold text-base ${isDarkMode ? 'text-gray-300' : ''}`}>{t('appointmentDetails.studentNote')}</span>
                    <div className={`mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{data.meeting.note}</div>
                </div>
                <div className="flex gap-3 mb-6">
                    <button className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 transition">{t('appointmentDetails.join')}</button>
                    <button className={`px-8 py-2 rounded-lg font-semibold transition ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{t('appointmentDetails.chat')}</button>
                </div>
                {/* Info */}
                <div className="mb-6">
                    <div className={`rounded-2xl p-6 flex flex-col md:flex-row gap-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-[#f3fff6]'}`}>
                        <div className="flex-1">
                            <div className={`font-bold mb-3 text-[22px] ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('appointmentDetails.personalInfo')}</div>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.fullName')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.fullName}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.sex')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.sex}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.dob')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.dob}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.address')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.address}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.phone')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className={`font-bold mb-3 text-[22px] ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('appointmentDetails.studyInfo')}</div>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.codeStudent')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.code}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.admission')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.admission}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.status')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.status}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.semester')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.semester}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`font-bold min-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-[#111]'}`}>{t('appointmentDetails.class')}</span>
                                    <span className={isDarkMode ? 'text-gray-100' : 'text-[#222]'}>{data.student.class}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Survey Progress Chart */}
                <div className={`rounded-2xl shadow-md mt-4 px-8 py-6 w-full border-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className={`font-semibold text-lg ${isDarkMode ? 'text-white' : ''}`}>{t('appointmentDetails.surveyProgress')}</div>
                        <select
                            className={`border rounded px-2 py-1 text-sm ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : ''}`}
                            value={surveyType}
                            onChange={e => setSurveyType(e.target.value)}
                        >
                            {surveyTypes.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                    </div>
                    <div className="h-72">
                        <Line data={surveyChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { ...chartOptions.plugins.legend, labels: { color: isDarkMode ? '#fff' : '#222', font: { size: 14 } } } }, scales: { x: { ticks: { color: isDarkMode ? '#fff' : '#222' } }, y: { ticks: { color: isDarkMode ? '#fff' : '#222' } } } }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetails; 