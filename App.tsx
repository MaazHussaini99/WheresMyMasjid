/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StatusBar } from 'react-native';

import DiscoverScreen from './src/screens/DiscoverScreen.js';
import LearnScreen from './src/screens/LearnScreen.js';
import ConnectScreen from './src/screens/ConnectScreen.js';
import BuildScreen from './src/screens/BuildScreen.js';
import EngageScreen from './src/screens/EngageScreen.js';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            switch (route.name) {
              case 'Discover':
                iconName = 'explore';
                break;
              case 'Learn':
                iconName = 'school';
                break;
              case 'Connect':
                iconName = 'people';
                break;
              case 'Build':
                iconName = 'business';
                break;
              case 'Engage':
                iconName = 'how-to-vote';
                break;
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
          headerShown: false,
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
        })}
      >
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="Learn" component={LearnScreen} />
        <Tab.Screen name="Connect" component={ConnectScreen} />
        <Tab.Screen name="Build" component={BuildScreen} />
        <Tab.Screen name="Engage" component={EngageScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
