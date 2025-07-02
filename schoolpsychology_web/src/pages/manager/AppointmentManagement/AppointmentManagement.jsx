import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'


const STATUS_COLORS = {
  Upcoming: 'bg-blue-100 text-blue-700',
  'In-progress': 'bg-green-100 text-green-700',
  Completed: 'bg-green-200 text-green-800',
  Canceled: 'bg-red-200 text-white',
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
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')

  // Lọc dữ liệu mẫu (chỉ demo, bạn có thể thay bằng API thực tế)
  const filtered = sampleAppointments.filter((item) => {
    return (
      (!search || item.fullName.toLowerCase().includes(search.toLowerCase()) || item.studentId.includes(search)) &&
      (!status || item.status === status) &&
      true // demo, không lọc ngày
    )
  })

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a2e] px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{t('appointment.title')}</h1>
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white dark:bg-[#23243a] p-4 rounded-lg shadow mb-6">
          <input
            type="text"
            placeholder={t('appointment.searchStudent')}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white dark:bg-[#23243a] text-gray-900 dark:text-gray-100"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded px-3 py-2 min-w-[160px] bg-white dark:bg-[#23243a] text-gray-900 dark:text-gray-100"
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
            className="border border-gray-300 rounded px-3 py-2 min-w-[150px] bg-white dark:bg-[#23243a] text-gray-900 dark:text-gray-100"
            value={date?.split(' - ')[0] || ''}
            onChange={e => {
              const to = date?.split(' - ')[1] || '';
              setDate(e.target.value + (to ? ' - ' + to : ''));
            }}
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2 min-w-[150px] bg-white dark:bg-[#23243a] text-gray-900 dark:text-gray-100"
            value={date?.split(' - ')[1] || ''}
            onChange={e => {
              const from = date?.split(' - ')[0] || '';
              setDate((from ? from : '') + ' - ' + e.target.value);
            }}
          />
          <button
            className="bg-gray-100 dark:bg-[#23243a] text-gray-700 dark:text-gray-200 px-4 py-2 rounded border border-gray-300 hover:bg-gray-200 dark:hover:bg-[#23243a]/80"
            onClick={() => { setSearch(''); setStatus(''); setDate('') }}
          >
            {t('common.clear')}
          </button>
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">{t('common.filter')}</button>
        </div>
        {/* Table */}
        <div className="bg-white dark:bg-[#23243a] rounded-lg shadow border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-[#f7f7f7] dark:bg-[#23243a] text-gray-500 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('appointment.studentId')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('appointment.fullName')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('appointment.time')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('appointment.formality.label')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('appointment.status.label')}</th>
                <th className="px-4 py-3 text-center font-medium">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:hover:bg-[#23243a]/60">
                  <td className="px-4 py-3 font-medium">{item.studentId}</td>
                  <td className="px-4 py-3">{item.fullName}</td>
                  <td className="px-4 py-3">
                    <div>{item.time}</div>
                    <div className="text-xs text-gray-400">{item.hour}</div>
                  </td>
                  <td className="px-4 py-3">{t(FORMALITY_LABELS[item.formality])}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status]}`}>{t(STATUS_LABELS[item.status])}</span>
                  </td>
                  <td className="px-4 py-3 text-center flex gap-2 justify-center">
                    {/* Edit icon */}
                    <button className="hover:bg-green-50 p-2 rounded" title="Edit">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.263-1.263l1-4a4 4 0 01.828-1.414z" /></svg>
                    </button>
                    {/* Details icon */}
                    <button className="hover:bg-blue-50 p-2 rounded" title="Details" onClick={() => navigate(`/manager/appointments/${item.id}`)}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 px-4 py-3 border-t border-gray-200 bg-[#f7f7f7]">
            <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200">2</button>
            <span className="text-gray-400">3</span>
            <span className="text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200">67</button>
            <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 border border-gray-200">68</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentManagement
