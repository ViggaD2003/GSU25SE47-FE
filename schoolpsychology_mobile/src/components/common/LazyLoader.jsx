import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Loading from "./Loading";

const LazyLoader = ({
  children,
  delay = 100,
  loadingComponent = null,
  onLoad = null,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      if (onLoad) onLoad();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onLoad]);

  if (!isLoaded) {
    return loadingComponent || <Loading text="Đang tải..." />;
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LazyLoader;
