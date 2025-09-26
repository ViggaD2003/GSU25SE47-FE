import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

// Tạo context
const ChildrenContext = createContext();

// Hook để sử dụng context
export const useChildren = () => {
  const context = useContext(ChildrenContext);
  if (!context) {
    throw new Error("useChildren must be used within a ChildrenProvider");
  }
  return context;
};

// Provider component
export const ChildrenProvider = ({ children }) => {
  const { t } = useTranslation();
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Sử dụng useMemo để tránh tạo mới object mỗi lần render
  const selectedChild = useMemo(() => {
    if (!selectedChildId) return null;
    return childrenList.find((child) => child.id === selectedChildId) || null;
  }, [selectedChildId, childrenList]);

  // Khởi tạo dữ liệu mẫu khi component mount
  useEffect(() => {
    if (user?.student?.length > 0 && user?.role === "PARENTS") {
      const children = Array.isArray(user?.student) ? user?.student : [];

      const childrenData = children.map((child) => ({
        ...child,
        id: child.id || child.userId || child.studentId,
        fullName: child.fullName || child.name,
        role: child.roleName || "STUDENT",
        ...(child?.caseProfile?.notify
          ? {
              caseId: child.caseId || child.caseProfile?.id,
              caseProfile: child.caseProfile,
            }
          : { caseId: null, caseProfile: null }),
      }));

      setChildrenList(childrenData);
      if (childrenData.length > 0) {
        setSelectedChildId(childrenData[0].id); // Chỉ lưu ID thay vì object
      }
    }
  }, [user]);

  // Thêm child mới
  const addChild = useCallback(
    (childData) => {
      const newChild = {
        id: Date.now().toString(),
        ...childData,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      setChildrenList((prev) => [...prev, newChild]);

      // Nếu đây là child đầu tiên, tự động chọn
      if (childrenList.length === 0) {
        setSelectedChildId(newChild.id);
      }

      return newChild;
    },
    [childrenList.length]
  );

  // Cập nhật thông tin child
  const updateChild = useCallback((childId, updates) => {
    setChildrenList((prev) =>
      prev.map((child) =>
        child.id === childId
          ? { ...child, ...updates, updatedAt: new Date().toISOString() }
          : child
      )
    );
  }, []);

  // Xóa child
  const removeChild = useCallback(
    (childId) => {
      Alert.alert(
        t("common.confirm") || "Xác nhận",
        t("children.removeConfirm") || "Bạn có chắc chắn muốn xóa con này?",
        [
          { text: t("common.cancel") || "Hủy", style: "cancel" },
          {
            text: t("common.remove") || "Xóa",
            style: "destructive",
            onPress: () => {
              setChildrenList((prev) =>
                prev.filter((child) => child.id !== childId)
              );

              // Nếu đang chọn child bị xóa, chuyển sang child khác
              if (selectedChildId === childId) {
                const remainingChildren = childrenList.filter(
                  (child) => child.id !== childId
                );
                if (remainingChildren.length > 0) {
                  setSelectedChildId(remainingChildren[0].id);
                } else {
                  setSelectedChildId(null);
                }
              }
            },
          },
        ]
      );
    },
    [childrenList, selectedChildId, t]
  );

  // Chọn child
  const selectChild = useCallback((child) => {
    setSelectedChildId(child.id);
  }, []);

  // Chuyển đổi child
  const switchChild = useCallback(
    (direction) => {
      if (childrenList.length <= 1) return;

      const currentIndex = childrenList.findIndex(
        (child) => child.id === selectedChildId
      );
      let newIndex;

      if (direction === "next") {
        newIndex = (currentIndex + 1) % childrenList.length;
      } else {
        newIndex =
          currentIndex === 0 ? childrenList.length - 1 : currentIndex - 1;
      }

      setSelectedChildId(childrenList[newIndex].id);
    },
    [childrenList, selectedChildId]
  );

  // Toggle trạng thái active của child
  const toggleChildStatus = useCallback(
    (childId) => {
      updateChild(childId, {
        isActive: !childrenList.find((c) => c.id === childId)?.isActive,
      });
    },
    [updateChild, childrenList]
  );

  // Toggle trạng thái survey của child
  const toggleSurveyStatus = useCallback(
    (childId) => {
      updateChild(childId, {
        isEnableSurvey: !childrenList.find((c) => c.id === childId)
          ?.isEnableSurvey,
      });
    },
    [updateChild, childrenList]
  );

  // Lấy child theo ID
  const getChildById = useCallback(
    (childId) => {
      return childrenList.find((child) => child.id === childId);
    },
    [childrenList]
  );

  // Lọc children theo điều kiện
  const filterChildren = useCallback(
    (predicate) => {
      return childrenList.filter(predicate);
    },
    [childrenList]
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      children: childrenList,
      selectedChild,
      loading,
      addChild,
      updateChild,
      removeChild,
      selectChild,
      switchChild,
      toggleChildStatus,
      toggleSurveyStatus,
      getChildById,
      filterChildren,
      setLoading,
    }),
    [
      childrenList,
      selectedChild,
      loading,
      addChild,
      updateChild,
      removeChild,
      selectChild,
      switchChild,
      toggleChildStatus,
      toggleSurveyStatus,
      getChildById,
      filterChildren,
      setLoading,
    ]
  );

  return (
    <ChildrenContext.Provider value={contextValue}>
      {children}
    </ChildrenContext.Provider>
  );
};

export default ChildrenContext;
