import React, { useState } from 'react';
import { Tabs, Table, Input, Button, Tag, Avatar } from 'antd';
import { ArrowLeftOutlined, UserOutlined, FileTextOutlined, PlusOutlined, SearchOutlined, FilterOutlined, EyeOutlined, MoreOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';

const mockProgram = {
    date: 'May 25, 2025',
    time: '13:00 - 15:30',
    location: 'Phòng hội thảo A',
    participants: '32/50',
    description: 'Workshop về quản lý căng thẳng và kỹ thuật thư giãn cho sinh viên và người lao động',
    goals: [
        'Hiểu được nguyên nhân gây căng thẳng',
        'Học các kỹ thuật thư giãn cơ bản',
        'Áp dụng được vào cuộc sống hằng ngày',
    ],
    colleague: {
        name: 'Nguyen Van C',
        avatar: null,
    },
    stats: {
        confirmed: 4,
        waiting: 1,
        present: 3,
        absent: 1,
    },
};

const mockStudents = [
    { name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', status: 'confirmed', participation: 3 },
    { name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', status: 'confirmed', participation: 1 },
    { name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', status: 'waiting', participation: 0 },
    { name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', status: 'confirmed', participation: 0 },
    { name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', status: 'confirmed', participation: 2 },
];

const mockResources = [
    { name: 'Present Slide' },
    { name: 'Homework' },
    { name: 'References' },
];

export default function ProgramDetails() {
    const [tab, setTab] = useState('overall');
    const [studentSearch, setStudentSearch] = useState('');

    const filteredStudents = mockStudents.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <Button type="text" icon={<ArrowLeftOutlined />} className="mb-2 text-lg" />
                <h1 className="text-2xl font-semibold mb-1 text-black">Program Detail</h1>
                <p className="mb-6 text-gray-500">Manage program and student details</p>
                <div className="border-b mb-6">
                    <div className="flex gap-8">
                        {['overall', 'students', 'resources'].map((key) => (
                            <button
                                key={key}
                                className={`pb-2 px-1 text-base transition font-medium ${tab === key ? 'text-green-600 border-b-2 border-green-400' : 'text-gray-500 hover:text-green-600'}`}
                                onClick={() => setTab(key)}
                            >
                                {key === 'overall' && 'Overall'}
                                {key === 'students' && `Students (${mockStudents.length})`}
                                {key === 'resources' && 'Resources'}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Tab content */}
                {tab === 'overall' && (
                    <div>
                        <div className="font-bold text-lg mb-4 text-black">Thông tin Program</div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 font-medium mb-1"><CalendarOutlined className="align-middle" /> Ngày</div>
                                        <div className="font-semibold text-gray-700 text-base">{mockProgram.date}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 font-medium mb-1"><EnvironmentOutlined className="align-middle" /> Địa điểm</div>
                                        <div className="font-semibold text-gray-700 text-base">{mockProgram.location}</div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 font-medium mb-1"><ClockCircleOutlined className="align-middle" /> Thời gian</div>
                                        <div className="font-semibold text-gray-700 text-base">{mockProgram.time}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 font-medium mb-1"><TeamOutlined className="align-middle" /> Số lượng</div>
                                        <div className="font-semibold text-gray-700 text-base">{mockProgram.participants}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-2 font-semibold text-base">Mô tả</div>
                            <div className="mb-4 text-gray-700 text-base">{mockProgram.description}</div>
                            <div className="mb-2 font-semibold text-base">Mục tiêu</div>
                            <ul className="list-disc pl-6 text-gray-700 text-base">
                                {mockProgram.goals.map((goal, i) => <li key={i}>{goal}</li>)}
                            </ul>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                            <div className="rounded-xl border border-gray-200 p-4 text-center bg-white">
                                <div className="text-blue-600 text-2xl font-bold">{mockProgram.stats.confirmed}</div>
                                <div className="text-gray-500">Confirmed</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4 text-center bg-white">
                                <div className="text-yellow-500 text-2xl font-bold">{mockProgram.stats.waiting}</div>
                                <div className="text-gray-500">Waiting confirm</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4 text-center bg-white">
                                <div className="text-green-600 text-2xl font-bold">{mockProgram.stats.present}</div>
                                <div className="text-gray-500">Present</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4 text-center bg-white">
                                <div className="text-red-500 text-2xl font-bold">{mockProgram.stats.absent}</div>
                                <div className="text-gray-500">absent</div>
                            </div>
                        </div>
                        {/* Colleague profile */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 mt-6">
                            <Avatar style={{ background: '#b2e4fa', color: '#222', fontWeight: 700, fontSize: 22 }} icon={<UserOutlined />} size={56}>N/A</Avatar>
                            <div>
                                <div className="font-semibold text-lg text-black">{mockProgram.colleague.name}</div>
                                <div className="text-gray-500 text-base flex items-center gap-1"><UserOutlined className="align-middle" /> Colleague</div>
                            </div>
                        </div>
                    </div>
                )}
                {tab === 'students' && (
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4 items-center">
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder="Search student"
                                className="w-64 rounded-lg"
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                            />
                            <Button icon={<FilterOutlined />} className="rounded-lg">sort</Button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-2">
                            <Table
                                dataSource={filteredStudents}
                                rowKey={(r, i) => i}
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Student', dataIndex: 'name',
                                        render: (text, record) => <div><div>{record.name}</div><div className="text-xs text-gray-400">{record.email}</div></div>
                                    },
                                    {
                                        title: 'Status', dataIndex: 'status',
                                        render: (status) => status === 'confirmed' ? <Tag color="green" style={{ textTransform: 'capitalize' }}>confirmed</Tag> : <Tag color="orange" style={{ textTransform: 'capitalize' }}>Waiting confirm</Tag>
                                    },
                                    {
                                        title: 'Participation', dataIndex: 'participation', align: 'center',
                                    },
                                    {
                                        title: 'Actions', dataIndex: 'actions', align: 'center', render: () => <Button type="text" icon={<MoreOutlined />} />
                                    },
                                ]}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                )}
                {tab === 'resources' && (
                    <div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="font-bold text-xl text-black">Resources</div>
                                <Button icon={<PlusOutlined />} className="bg-green-100 border-green-200 text-green-700 hover:bg-green-200 hover:text-green-900 rounded-lg font-semibold px-4 py-2">Add new resource</Button>
                            </div>
                            <div className="space-y-3">
                                {mockResources.map((r, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-6 py-4 border border-gray-200">
                                        <FileTextOutlined className="text-2xl text-gray-400" />
                                        <span className="font-medium text-base text-gray-800">{r.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
