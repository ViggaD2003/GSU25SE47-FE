import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import { getBlogById } from "../../services/api/BlogService";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "../../components";

export default function BlogDetails({ navigation }) {
  const route = useRoute();
  const { blogId } = route.params;
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    getBlogById(blogId).then(setBlog);
  }, [blogId]);

  if (!blog) return null;

  const handleBackPress = () => {
    navigation.goBack();
  };
  return (
    <Container>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{blog.title}</Text>
        <Text style={styles.meta}>
          {blog.author} • {blog.date}
        </Text>
        <Image source={{ uri: blog.image }} style={styles.image} />
        <Text style={styles.content}>{blog.content}</Text>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 20,
    position: "relative",
  },
  meta: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: "#222",
    lineHeight: 24,
    marginBottom: 32,
  },
});
