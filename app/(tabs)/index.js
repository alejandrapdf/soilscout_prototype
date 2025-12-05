// src/screens/HomeScreen.js
import styles from '../../styles/default';
import Interactive from "../../components/Interactive.js";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ImageBackground, Image } from 'react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import mapPlaceholder from '../../assets/images/map-placeholder.jpg';
import icon from '../../assets/images/icon.png';
import { Pressable } from 'react-native';


// Placeholder data
const initialSensors = [
  { id: 1, name: 'Scout 1', value: 22 },
  { id: 2, name: 'Scout 2', value: 45 },
  { id: 3, name: 'Scout 3', value: 75 },
  { id: 4, name: 'Scout 4', value: 30 },
  { id: 5, name: 'Scout 5', value: 55 },
];



export default function HomeScreen() {
  const [sensors, setSensors] = useState(initialSensors);
  const [animatedValues, setAnimatedValues] = useState(
    initialSensors.map((s) => new Animated.Value(s.value))
  );
  const metrics = [
    { title: 'Avg Soil Health', value: sensors.reduce((sum, s) => sum + s.value, 0) / sensors.length, icon: 'terrain', colors: ['#43A047', '#66BB6A'] },
    { title: 'Sensors Online', value: sensors.length, icon: 'bolt', colors: ['#4FC3F7', '#0288D1'] },
    { title: 'Critical Scouts', value: sensors.filter((s) => s.value < 30).length, icon: 'warning', colors: ['#F44336', '#E53935'] },
  ];
  const [metricAnims, setMetricAnims] = useState(
    metrics.map(m => new Animated.Value(m.value))
  );
  const newMetrics = [
    sensors.reduce((sum, s) => sum + s.value, 0) / sensors.length, // Avg Soil Health
    sensors.length, // Sensors Online
    sensors.filter(s => s.value < 30).length, // Critical Scouts
  ];
   const getColorFromValue = (value) => {
    if (value < 30) return '#F44336';
    if (value > 60) return '#4CAF50';
    return '#FFEB3B';
  };

// ---------------------------
// When sensor is pressed pop occurs
// ---------------------------
  const handleSensorPress = useCallback(
    (sensor) => alert(`Sensor ${sensor.name}: ${sensor.value}`),
    []
  );

// ---------------------------
// Update metric animations whenever sensor values change
// ---------------------------
useEffect(() => {
  // `newMetrics` contains the latest values for each metric (avg soil health, sensors online, critical scouts)
  // This loops over each metric and animates its value using Animated.timing
  newMetrics.forEach((val, i) => {
    Animated.timing(metricAnims[i], {
      toValue: val,       
      duration: 800,      
      useNativeDriver: false, 
    }).start();        
  });


}, [sensors]);

// ---------------------------
// Animate individual sensor values on component mount
// ---------------------------
useEffect(() => {
  // This animates the "pins" on the map
  animatedValues.forEach((val, index) => {
    Animated.timing(val, {
      toValue: sensors[index].value,
      duration: 1200,                 
      useNativeDriver: false,         // Cannot use native driver for text interpolation
    }).start();
  });

}, []);

// ---------------------------
// Simulates sensor updates every 10 seconds
// ---------------------------
useEffect(() => {
  // Set up a repeating interval
  const interval = setInterval(() => {
    setSensors((prev) =>
      prev.map((s) => ({
        ...s,
        value: Math.min(100, s.value + Math.floor(Math.random() * 5)), // Increase sensor value randomly, capped at 100
      }))
    );
  }, 10000); // Repeat every 10 seconds

  return () => clearInterval(interval);

}, []);


  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Image source={icon} style={styles.sidebarIcon} />
        <Interactive style={styles.sidebarButton}>
          <FontAwesome5 name="tachometer-alt" size={18} color="#fff" />
          <Text style={styles.sidebarButtonText}>Dashboard</Text>
        </Interactive>
        <Interactive style={styles.sidebarButton}>
          <FontAwesome5 name="project-diagram" size={18} color="#fff" />
          <Text style={styles.sidebarButtonText}>Sensors</Text>
        </Interactive>
        <Interactive style={styles.sidebarButton}>
          <FontAwesome5 name="map-marked-alt" size={18} color="#fff" />
          <Text style={styles.sidebarButtonText}>Map</Text>
        </Interactive>
      </View>

      {/* Main Area */}
      <View style={styles.mainArea}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Dashboard</Text>
          <View style={styles.userCircle}>
            <Text style={styles.userInitial}>N</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Metrics Row */}
           <Text style={styles.sectionTitle}>Metrics</Text>
          <View style={styles.metricsRow}>
            {metrics.map((m, i) => (
              <LinearGradient key={i} colors={m.colors} style={styles.metricCard}>
                <MaterialIcons name={m.icon} size={24} color="#fff" />
                <Text style={styles.metricTitle}>{m.title}</Text>
                <Animated.Text style={styles.metricValue}>
                  {metricAnims[i].interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, 100],
                    extrapolate: 'clamp',
                  }).__getValue().toFixed(0)}
                </Animated.Text>
              </LinearGradient>
            ))}

          </View>

          {/* Heatmap Panel */}
          <Text style={styles.sectionTitle}>Map</Text>
          <ImageBackground
            source={mapPlaceholder}
            style={styles.heatmapContainer}
            imageStyle={{ borderRadius: 20 }}
            resizeMode="cover"
          >
            {sensors.map((s, index) => (
              
              <Animated.View
                key={s.id}
                style={[
                  styles.sensorPin,
                  {
                    top: `${10 + index * 15}%`,
                    left: `${15 + (index % 3) * 25}%`,
                    backgroundColor: getColorFromValue(s.value),
                    transform: [
                      {
                        scale: animatedValues[index].interpolate({
                          inputRange: [0, s.value],
                          outputRange: [0.8, 1.2],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  },
                ]}
              >
                <Interactive onPress={() => handleSensorPress(s)}>
                  <Text style={styles.pinText}>{s.value}</Text>
                </Interactive>
              </Animated.View>
            ))}
          </ImageBackground>

          {/* Sensor Cards */}
          <Text style={styles.sectionTitle}>Scouts</Text>
          <View style={styles.sensorsRow}>
            {sensors.map((s) => (
              <Interactive
                key={s.id}
                style={styles.sensorCard}
                onPress={() => handleSensorPress(s)}
              >
                <Text style={styles.sensorName}>{s.name}</Text>
                <Text style={styles.sensorValue}>{s.value}</Text>
                <View
                  style={[styles.statusBar, { backgroundColor: getColorFromValue(s.value) }]}
                />
              </Interactive>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}


