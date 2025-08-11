import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Khởi tạo dữ liệu mẫu khi component mount
  useEffect(() => {
    if (childrenList.length === 0 && user?.role === "PARENTS") {
      const children = Array.isArray(user?.children) ? user?.children : [];

      const childrenData = children.map((child) => ({
        ...child,
        id: child.id || child.userId || child.studentId,
        fullName: child.fullName || child.name,
        isEnableSurvey: child.isEnable || true,
        isActive: child.isActive || true,
      }));

      setChildrenList(childrenData);
      setSelectedChild(childrenData[0]); // Chọn child đầu tiên làm mặc định
    }
  }, []);

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
        setSelectedChild(newChild);
      }

      return newChild;
    },
    [childrenList.length]
  );

  // Cập nhật thông tin child
  const updateChild = useCallback(
    (childId, updates) => {
      setChildrenList((prev) =>
        prev.map((child) =>
          child.id === childId
            ? { ...child, ...updates, updatedAt: new Date().toISOString() }
            : child
        )
      );

      // Cập nhật selectedChild nếu cần
      if (selectedChild?.id === childId) {
        setSelectedChild((prev) => ({ ...prev, ...updates }));
      }
    },
    [selectedChild]
  );

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
              if (selectedChild?.id === childId) {
                const remainingChildren = childrenList.filter(
                  (child) => child.id !== childId
                );
                if (remainingChildren.length > 0) {
                  setSelectedChild(remainingChildren[0]);
                } else {
                  setSelectedChild(null);
                }
              }
            },
          },
        ]
      );
    },
    [childrenList, selectedChild, t]
  );

  // Chọn child
  const selectChild = useCallback((child) => {
    setSelectedChild(child);
  }, []);

  // Chuyển đổi child
  const switchChild = useCallback(
    (direction) => {
      if (childrenList.length <= 1) return;

      const currentIndex = childrenList.findIndex(
        (child) => child.id === selectedChild?.id
      );
      let newIndex;

      if (direction === "next") {
        newIndex = (currentIndex + 1) % childrenList.length;
      } else {
        newIndex =
          currentIndex === 0 ? childrenList.length - 1 : currentIndex - 1;
      }

      setSelectedChild(childrenList[newIndex]);
    },
    [childrenList, selectedChild]
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
  const contextValue = {
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
  };

  return (
    <ChildrenContext.Provider value={contextValue}>
      {children}
    </ChildrenContext.Provider>
  );
};

export default ChildrenContext;
