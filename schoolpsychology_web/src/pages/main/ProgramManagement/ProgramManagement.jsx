import React, { useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const mockPrograms = [
  {
    id: 1,
    name: 'Stress Management Workshop',
    tags: ['Stress', 'Coping'],
    instructors: Array(8).fill('/src/assets/icons/react.svg'),
    schedule: '2023/09/17 - 13:00 - 15:30',
    participants: '32/50',
    status: 'COMPLETED',
  },
  {
    id: 2,
    name: 'Stress Management Workshop',
    tags: ['Stress', 'Coping'],
    instructors: Array(8).fill('/src/assets/icons/react.svg'),
    schedule: '2023/09/17 - 13:00 - 15:30',
    participants: '32/50',
    status: 'UPCOMING',
  },
  ...Array(8).fill(0).map((_, i) => ({
    id: i + 3,
    name: 'Stress Management Workshop',
    tags: ['Stress', 'Coping'],
    instructors: Array(8).fill('/src/assets/icons/react.svg'),
    schedule: '2023/09/17 - 13:00 - 15:30',
    participants: '32/50',
    status: 'LABEL',
  })),
]

const statusColor = {
  COMPLETED: 'bg-green-100 text-green-700',
  UPCOMING: 'bg-purple-100 text-purple-700',
  LABEL: 'bg-green-100 text-green-700',
}

const ProgramManagement = () => {
  const { isDarkMode } = useTheme()
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState(['Stress', 'Coping'])
  const [dateRange, setDateRange] = useState('2025-08-17 - 2025-08-19')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  // Pagination
  const pageSize = 10
  // Search filter
  const filtered = mockPrograms.filter(program => {
    const keyword = search.trim().toLowerCase();
    return (
      program.name.toLowerCase().includes(keyword) ||
      program.tags.some(tag => tag.toLowerCase().includes(keyword))
    );
  });
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={`p-8 min-h-screen ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-gray-50'}`}>
      <h1 className="text-2xl font-semibold mb-1">Program Management</h1>
      <p className="mb-6 text-gray-500">Manage and monitor all support programs</p>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {selectedTags.map(tag => (
            <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg flex items-center text-sm border border-blue-100">
              {tag} <button className="ml-1 hover:text-red-500" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}>×</button>
            </span>
          ))}
          <select
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white"
            onChange={e => setSelectedTags([...selectedTags, e.target.value])}
            value=""
          >
            <option value="">Add tag</option>
            {['Stress', 'Coping', 'Other'].filter(tag => !selectedTags.includes(tag)).map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            className="border border-gray-200 rounded-lg px-3 py-2 w-[220px] bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            placeholder="MM/DD/YYYY"
          />
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow bg-white border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 font-medium text-gray-500 text-left">Program name</th>
              <th className="px-2 py-3 font-medium text-gray-500 text-left">Instructors</th>
              <th className="px-2 py-3 font-medium text-gray-500 text-left">Schedule</th>
              <th className="px-2 py-3 font-medium text-gray-500 text-left">Participants</th>
              <th className="px-2 py-3 font-medium text-gray-500 text-left">Status</th>
              <th className="px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((program, idx) => (
              <tr key={program.id} className={`transition hover:bg-blue-50/40 ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                <td className="px-2 py-2">
                  <div className="font-medium">{program.name}</div>
                  <div className="text-xs text-gray-400">#{program.tags.join(' #')}</div>
                </td>
                <td className="px-2 py-2">
                  <div className="flex -space-x-2">
                    {program.instructors.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="avatar"
                        className="w-7 h-7 rounded-full border-2 border-white shadow"
                        style={{ zIndex: 10 - i }}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-2 py-2">{program.schedule}</td>
                <td className="px-2 py-2">{program.participants}</td>
                <td className="px-2 py-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor[program.status]}`} style={{ textTransform: 'capitalize' }}>{program.status.toLowerCase()}</span>
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    className="p-2 rounded-lg hover:bg-blue-50 transition text-gray-500 hover:text-blue-600"
                    title="View details"
                    onClick={() => navigate(`/program-management/details`)}
                  >
                    <EyeOutlined style={{ fontSize: 20 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">Page</div>
        <div className="flex gap-1">
          <button
            className="px-2 py-1 border border-gray-200 rounded-lg bg-white hover:bg-blue-50 transition disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-2 py-1 border border-gray-200 rounded-lg bg-white hover:bg-blue-50 transition ${page === i + 1 ? 'bg-blue-500 text-white hover:bg-blue-500' : ''}`}
              onClick={() => setPage(i + 1)}
            >{i + 1}</button>
          ))}
          <button
            className="px-2 py-1 border border-gray-200 rounded-lg bg-white hover:bg-blue-50 transition disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >Next</button>
        </div>
      </div>
    </div>
  )
}

export default ProgramManagement
