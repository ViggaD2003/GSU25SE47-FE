import api from '@/services/api';
import React, { useEffect, useState } from 'react';

const Badge = ({ text, color, size = "sm" }) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${
            size === "sm" ? "text-xs" : "text-sm"
        }`}
    >
        {text}
    </span>
);

const InfoRow = ({ label, value, className = "" }) => (
    <div className={`flex justify-between items-start py-2 ${className}`}>
        <span className="text-gray-400 text-sm font-medium min-w-0 flex-shrink-0 mr-3">{label}:</span>
        <span className="text-gray-200 text-sm text-right flex-1">{value}</span>
    </div>
);

const UserDetail = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Mock id for demonstration - replace with useParams() in your actual app
    const id = "2";

    const fetchUserDetail = async (userId) => {
        try {
            const response = await api.get(`/api/v1/account/students/details?accountId=${userId}`);
            if (response.status === 200) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetail(id);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-lg">Không có dữ liệu người dùng.</div>
            </div>
        );
    }

    const genderText = user.gender ? 'Nam' : 'Nữ';
    const surveyStatus = user.isEnableSurvey
        ? <Badge text="Đã bật khảo sát" color="bg-green-100 text-green-800" />
        : <Badge text="Chưa bật khảo sát" color="bg-red-100 text-red-800" />;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-800';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800';
            case 'LOW':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                                {user.fullName?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Chi tiết sinh viên</h1>
                            <p className="text-blue-100 mt-1">{user.fullName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Basic Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white flex items-center">
                                    <span className="mr-3">🎓</span>
                                    Thông tin cơ bản
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                    <InfoRow label="Họ tên" value={user.fullName} />
                                    <InfoRow label="Email" value={user.email} />
                                    <InfoRow label="Số điện thoại" value={user.phoneNumber} />
                                    <InfoRow label="Giới tính" value={genderText} />
                                    <InfoRow label="Ngày sinh" value={user.dob} />
                                    <InfoRow label="Vai trò" value={user.roleName} />
                                    <InfoRow label="Mã sinh viên" value={user.studentCode} />
                                    <InfoRow 
                                        label="Khảo sát" 
                                        value={surveyStatus} 
                                        className="md:col-span-2" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Support Cases */}
                        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                                <h3 className="text-xl font-semibold text-white flex items-center">
                                    <span className="mr-3">📂</span>
                                    Các trường hợp hỗ trợ
                                </h3>
                            </div>
                            <div className="p-6">
                                {user.cases && user.cases.length > 0 ? (
                                    <div className="space-y-6">
                                        {user.cases.map((c) => (
                                            <div
                                                key={c.id}
                                                className="bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-gray-500 transition-colors"
                                            >
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-lg text-white mb-3">{c.title}</h4>
                                                    
                                                    {/* Badges Section */}
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        <Badge
                                                            text={`Ưu tiên: ${c.priority}`}
                                                            color={getPriorityColor(c.priority)}
                                                        />
                                                        <Badge text={`Trạng thái: ${c.status}`} color="bg-blue-100 text-blue-800" />
                                                        <Badge text={`Tiến trình: ${c.progressTrend}`} color="bg-purple-100 text-purple-800" />
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mb-4">
                                                    <InfoRow label="Danh mục" value={`${c.categoryName} (${c.codeCategory})`} />
                                                    <InfoRow label="Người tạo" value={c.createBy?.fullName || 'N/A'} />
                                                    <InfoRow label="Counselor" value={c.counselor?.fullName || "Not Assigned"} />
                                                </div>

                                                <InfoRow 
                                                    label="Mô tả" 
                                                    value={c.description} 
                                                    className="border-t border-gray-600 pt-3 md:col-span-2" 
                                                />
                                                
                                                <div className="border-t border-gray-600 pt-3 mt-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                                        <InfoRow 
                                                            label="Level hiện tại" 
                                                            value={`${c.currentLevel?.label} (${c.currentLevel?.levelType})`} 
                                                        />
                                                        <InfoRow 
                                                            label="Level ban đầu" 
                                                            value={`${c.initialLevel?.label} (${c.initialLevel?.levelType})`} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-lg">📋</div>
                                        <p className="text-gray-400 mt-2">Không có trường hợp hỗ trợ nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Parent Information Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 sticky top-6">
                            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white flex items-center">
                                    <span className="mr-3">👪</span>
                                    Thông tin phụ huynh
                                </h2>
                            </div>
                            <div className="p-6">
                                {user.parents && user.parents.length > 0 ? (
                                    <div className="space-y-6">
                                        {user.parents.map((parent) => (
                                            <div
                                                key={parent.id}
                                                className="bg-gray-700 rounded-xl p-4 border border-gray-600"
                                            >
                                                <div className="space-y-1">
                                                    <InfoRow label="Họ tên" value={parent.fullName} />
                                                    <InfoRow label="Email" value={parent.email} />
                                                    <InfoRow label="SĐT" value={parent.phoneNumber} />
                                                    <InfoRow label="Giới tính" value={parent.gender ? 'Nam' : 'Nữ'} />
                                                    <InfoRow label="Ngày sinh" value={parent.dob} />
                                                    <InfoRow label="Địa chỉ" value={parent.address} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-4xl mb-3">👤</div>
                                        <p className="text-gray-400">Không có thông tin phụ huynh.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;