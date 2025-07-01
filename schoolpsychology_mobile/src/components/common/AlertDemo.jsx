import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Alert from "./Alert";

const AlertDemo = () => {
  const [visibleAlerts, setVisibleAlerts] = useState({
    info: true,
    success: true,
    warning: true,
    error: true,
  });

  const handleClose = (type) => {
    setVisibleAlerts((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Alert Component Demo</Text>

      {/* Info Alert */}
      {visibleAlerts.info && (
        <Alert
          type="info"
          title="Thông tin quan trọng"
          description="Đây là thông báo thông tin quan trọng mà bạn cần biết. Hãy đọc kỹ nội dung này."
          showCloseButton={true}
          onClose={() => handleClose("info")}
        />
      )}

      {/* Success Alert */}
      {visibleAlerts.success && (
        <Alert
          type="success"
          title="Thành công!"
          description="Bạn đã hoàn thành bài khảo sát thành công. Kết quả sẽ được gửi đến email của bạn."
          showCloseButton={true}
          onClose={() => handleClose("success")}
        />
      )}

      {/* Warning Alert */}
      {visibleAlerts.warning && (
        <Alert
          type="warning"
          title="Cảnh báo mức độ căng thẳng cao"
          description="Dựa trên các đánh giá gần đây, chúng tôi khuyến nghị bạn nên thực hiện các biện pháp để quản lý mức độ căng thẳng."
          showCloseButton={true}
          onClose={() => handleClose("warning")}
        />
      )}

      {/* Error Alert */}
      {visibleAlerts.error && (
        <Alert
          type="error"
          title="Lỗi kết nối"
          description="Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại."
          showCloseButton={true}
          onClose={() => handleClose("error")}
        />
      )}

      {/* Clickable Alert */}
      <Alert
        type="info"
        title="Nhấn để xem chi tiết"
        description="Nhấn vào đây để xem thêm thông tin chi tiết về kết quả khảo sát của bạn."
        onPress={() => console.log("Alert clicked!")}
      />

      {/* Alert chỉ có description */}
      <Alert
        type="success"
        description="Đăng nhập thành công! Chào mừng bạn trở lại."
      />

      {/* Alert chỉ có title */}
      <Alert type="warning" title="Cập nhật ứng dụng" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
});

export default AlertDemo;
