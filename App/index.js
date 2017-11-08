/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';
const firebase = require("firebase");

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBQmBX61QXDMmWj58Ysu0lLaHWqfqbCmIE",
      authDomain: "chatapp-8cf9a.firebaseapp.com",
      databaseURL: "https://chatapp-8cf9a.firebaseio.com",
      projectId: "chatapp-8cf9a",
      storageBucket: "chatapp-8cf9a.appspot.com",
      messagingSenderId: "344066000954"


};
firebase.initializeApp(config);

import {
  createRouter,
  NavigationProvider,
  StackNavigation,
} from '@exponent/ex-navigation';

import Login from './Screens/Login'
import Signup from './Screens/Signup'
import ForgetPassword from './Screens/ForgetPassword'
import FriendsList from './Screens/FriendsList'
import Chat from './Screens/Chat'
import FCM, {FCMEvent} from "react-native-fcm";
import PushNotification from './Components/PushNotification'
/**
  * This is where we map route names to route components. Any React
  * component can be a route, it only needs to have a static `route`
  * property defined on it, as in HomeScreen below
  */
const Router = createRouter(() => ({
  login: () => Login,
  signup: () => Signup,
  forgetPassword: () => ForgetPassword,
  friendsList: () => FriendsList,
  chat: () => Chat
}));

export default class Firechat extends Component {
  constructor(props) {
      super(props);
      this.state = {
      fcm_token: ""
      };

  }
  componentDidMount () {
    // FCM.requestPermissions();
    // FCM.getFCMToken().then(token => {
    //   this.setState({fcm_token:token});
    //   //update your fcm token on server.
    // });
    FCM.requestPermissions();
    FCM.getFCMToken().then(token => { // Here you get the fcm token
      console.log(token)
        let tokenData: FirebaseToken = {
            firebaseToken: token
        };
        console.log("fb token",tokenData)
        // storeFireBaseToken(tokenData).then((done: any) => {
        //     console.log(done);
        // });
        // store fcm token in your server
    });
    FCM.on(FCMEvent.Notification, (notification) => {
      console.log(notification)  //{ Item: 'cool', Another: 'cooler' }
    })
    console.log(FCM.initialData);
    FCM.getInitialNotification().then((notification: any) => {
        console.log("in notifictions", notification)
        // for android/ios app killed state
        if (notification) {
          console.log(notification.data)
            // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
        }
    });
    //
    this.notificationListener = FCM.on(FCMEvent.Notification, async (notification: any) => {
        console.log(notification)
        console.log("listener")
        // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
        if (notification.opened_from_tray) {
          console.log("listener")
            // handling when app in foreground or background state for both ios and android

        }
        
    });
    this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
        console.log(token);
        // fcm token may not be available on first load, catch it here
    });
    FCM.subscribeToTopic('test_topic');
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <PushNotification/>
        <StatusBar barStyle="light-content"/>
        <NavigationProvider router={Router}>
          <StackNavigation initialRoute={Router.getRoute('login') } />
        </NavigationProvider>
      </View>
    );
  }
}
