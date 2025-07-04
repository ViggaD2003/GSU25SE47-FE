import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../../contexts/ThemeContext'

const STATUS_COLORS = {
  Upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  'In-progress': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  Completed: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
  Canceled: 'bg-red-200 text-white dark:bg-red-900 dark:text-red-200',
}

const STATUS_LABELS = {
  Upcoming: 'appointment.status.upcoming',
  'In-progress': 'appointment.status.inprogress',
  Completed: 'appointment.status.completed',
  Canceled: 'appointment.status.canceled',
}

const FORMALITY_LABELS = {
  online: 'appointment.formality.online',
  offline: 'appointment.formality.offline',
}

const sampleAppointments = [
  {
    id: 1,
    studentId: 'SE123456',
    fullName: 'John Doe',
    time: 'May 25, 2025',
    hour: '13:00-13:30',
    formality: 'online',
    status: 'Upcoming',
  },
  {
    id: 2,
    studentId: 'SE123456',
    fullName: 'John Doe',
    time: 'May 25, 2025',
    hour: '13:00-13:30',
    formality: 'offline',
    status: 'In-progress',
  },
  {
    id: 3,
    studentId: 'SE123456',
    fullName: 'John Doe',
    time: 'May 25, 2025',
    hour: '13:00-13:30',
    formality: 'online',
    status: 'Completed',
  },
  {
    id: 4,
    studentId: 'SE123456',
    fullName: 'John Doe',
    time: 'May 25, 2025',
    hour: '13:00-13:30',
    formality: 'online',
    status: 'Completed',
  },
  {
    id: 5,
    studentId: 'SE123456',
    fullName: 'John Doe',
    time: 'May 25, 2025',
    hour: '13:00-13:30',
    formality: 'online',
    status: 'Canceled',
  },
  {
    id: 6,
    studentId: 'SE123456',
    fullName: 'John Doe',
    time: 'May 25, 2025',
    hour: '13:00-13:30',
    formality: 'online',
    status: 'Upcoming',
  },
  {
    id: 7,
    studentId: 'SE123456',
    fullName: 'John Doe',
    time: 'May 25, 2025',
    hour: '13:00-13:30',
    formality: 'online',
    status: 'In-progress',
  },
]

const AppointmentManagement = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')

  const filtered = sampleAppointments.filter((item) => {
    return (
      (!search || item.fullName.toLowerCase().includes(search.toLowerCase()) || item.studentId.includes(search)) &&
      (!status || item.status === status)
    )
  })

  return (
    <div className={`min-h-screen px-8 py-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('appointment.title')}</h1>

        {/* Filter Bar */}
        <div className={`flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg shadow mb-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <input
            type="text"
            placeholder={t('appointment.searchStudent')}
            className={`flex-1 rounded px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700 focus:ring-green-700' : 'bg-white text-gray-900 border-gray-300 focus:ring-green-200'}`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className={`rounded px-3 py-2 min-w-[160px] border ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">{t('appointment.status.label')}</option>
            <option value="Upcoming">{t('appointment.status.upcoming')}</option>
            <option value="In-progress">{t('appointment.status.inprogress')}</option>
            <option value="Completed">{t('appointment.status.completed')}</option>
            <option value="Canceled">{t('appointment.status.canceled')}</option>
          </select>
          <input
            type="date"
            className={`rounded px-3 py-2 min-w-[150px] border ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            value={date?.split(' - ')[0] || ''}
            onChange={e => {
              const to = date?.split(' - ')[1] || '';
              setDate(e.target.value + (to ? ' - ' + to : ''));
            }}
          />
          <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
          <input
            type="date"
            className={`rounded px-3 py-2 min-w-[150px] border ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            value={date?.split(' - ')[1] || ''}
            onChange={e => {
              const from = date?.split(' - ')[0] || '';
              setDate((from ? from : '') + ' - ' + e.target.value);
            }}
          />
          <button
            className={`px-4 py-2 rounded border transition ${isDarkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
            onClick={() => { setSearch(''); setStatus(''); setDate('') }}
          >
            {t('common.clear')}
          </button>
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">{t('common.filter')}</button>
        </div>

        {/* Table */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border overflow-x-auto`}>
          <table className="min-w-full text-sm">
            <thead className={`${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-[#f7f7f7] text-gray-500'}`}>
              <tr>
                {['studentId', 'fullName', 'time', 'formality.label', 'status.label', 'Action'].map(col => (
                  <th key={col} className={`px-4 py-3 ${col === 'Action' ? 'text-center' : 'text-left'} font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                    {col === 'Action' ? 'Action' : t(`appointment.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} last:border-b-0`}>
                  <td className={`px-4 py-3 font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.studentId}</td>
                  <td className={isDarkMode ? 'text-gray-100 px-4 py-3' : 'text-gray-900 px-4 py-3'}>{item.fullName}</td>
                  <td className="px-4 py-3">
                    <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>{item.time}</div>
                    <div className="text-xs text-gray-400">{item.hour}</div>
                  </td>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {t(FORMALITY_LABELS[item.formality])}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status]}`}>
                      {t(STATUS_LABELS[item.status])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="hover:bg-green-50 dark:hover:bg-gray-700 p-2 rounded" title="Edit">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.263-1.263l1-4a4 4 0 01.828-1.414z" />
                        </svg>
                      </button>
                      <button className="hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded" title="Details" onClick={() => navigate(`/appointment-management/details`)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={`flex justify-end items-center gap-2 px-4 py-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-400' : 'border-gray-200 bg-[#f7f7f7] text-gray-500'}`}>
            {[1, 2].map(num => (
              <button key={num} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700">{num}</button>
            ))}
            <span className="text-gray-400 dark:text-gray-500">3</span>
            <span className="text-gray-400 dark:text-gray-500">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700">67</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">68</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentManagement
