import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
const firebase = require("firebase");
import md5 from '../lib/md5'

import { Colors, Styles } from '../Shared'

import TextField from '../Components/TextField';
import Button from '../Components/Button';
import Separator from '../Components/Separator';

import FCM, {FCMEvent} from "react-native-fcm";

export default class Chat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };

        this.user = firebase.auth().currentUser
        this.friend = this.props.friend



        this.chatRef = this.getRef().child('chat/' + this.generateChatId());
        this.chatRefData = this.chatRef.orderByChild('order')
        this.onSend = this.onSend.bind(this);

        FCM.requestPermissions();
        FCM.getFCMToken().then(token => { // Here you get the fcm token
            let tokenData: FirebaseToken = {
                firebaseToken: token
            };
            this.props.storeFCMToken(token)
            // storeFireBaseToken(tokenData).then((done: any) => {
            //     console.log(done);
            // });
            // store fcm token in your server
        });
        FCM.getInitialNotification().then((notification: any) => {
            console.log("in notifictions constructor")
            // for android/ios app killed state
            if (notification) {
              console.log(notification.data)
                // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
            }
        });

        this.notificationListener = FCM.on(FCMEvent.Notification, async (notification: any) => {
            console.log("listener in chat")
            console.log(notification.open_from_prop)
            console.log(notification.open_from_tray)
            // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
            if (notification.opened_from_tray) {
                // handling when app in foreground or background state for both ios and android
                console.log("opened_from_tray")
            }
            if (notif.local_notification){
               console.log('local notification')
               return
             }

        });
        this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
            console.log(token);
            // fcm token may not be available on first load, catch it here
        });

    }

    generateChatId() {
        if(this.user.uid > this.friend.uid)
            return `${this.user.uid}-${this.friend.uid}`
        else
            return `${this.friend.uid}-${this.user.uid}`
    }

    static route = {
        navigationBar: {
            title: 'Chat',
            ... Styles.NavBarStyles
        }
    }

    getRef() {
        return firebase.database().ref();
    }

    listenForItems(chatRef) {
        chatRef.on('value', (snap) => {

            // get children as an array
            var items = [];

            snap.forEach((child) => {
                var avatar = 'https://www.gravatar.com/avatar/' + ( child.val().uid == this.user.uid? md5(this.user.email) : md5(this.friend.email))
                var name = child.val().uid == this.user.uid? this.user.name: this.friend.name

                items.push({
                    _id: child.val().createdAt,
                    text: child.val().text,
                    createdAt: new Date(child.val().createdAt),
                    user: {
                        _id: child.val().uid,
                        avatar: avatar
                    }
                });
            });

            this.setState({
                loading: false,
                messages: items
            })

        });
    }

    componentDidMount() {

        this.listenForItems(this.chatRefData);
        FCM.getInitialNotification().then((notification: any) => {
            console.log("in notifictions did mount", notification)
            console.log(notification.notification);
            // for android/ios app killed state
            if (notification) {
              console.log(notification.data)
                // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
            }
            if(notification.is_push){
              console.log("helo")
            }
        });

        notificationUnsubscribe = FCM.on(FCMEvent.Notification, notification => {
          console.log("a", notification);
          if (notification && notification.local_notification) {
            return;
          }
          sendRemote(notification);
        });
    }

    componentWillUnmount() {
        this.refreshUnsubscribe();
        this.notificationUnsubscribe();
        this.chatRefData.off()

    }

    sendRemote(notification) {
      console.log('sending remote');
      FCM.presentLocalNotification({
        title: notification.title,
        body: notification.body,
        priority: "high",
        click_action: notification.click_action,
        show_in_foreground: true,
        local: true
      });
    }
    onSend(messages = []) {
        console.log(messages)
        FCM.requestPermissions();
        FCM.getFCMToken().then(token => { // Here you get the fcm token
          console.log(token)
            let tokenData: FirebaseToken = {
                firebaseToken: token
            };
            storeFireBaseToken(tokenData).then((done: any) => {
                console.log(done);
            });
            // store fcm token in your server
        });
        FCM.getInitialNotification().then((notification: any) => {
            console.log("in notifictions on send", notification)
            console.log(notification.notification);
            // for android/ios app killed state
            if (notification) {
              console.log(notification.data)
                // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
            }
            if(notification.is_push){
              console.log("hellllo")
            }
        });
        this.notificationUnsubscribe = FCM.on(FCMEvent.Notification, notification => {
          console.log("a", notification);
          if (notification && notification.local_notification) {
            return;
          }
          sendRemote(notification);
        });

        // this method call when FCM token is update(FCM token update any time so will get updated token from this method)
        this.refreshUnsubscribe = FCM.on(FCMEvent.RefreshToken, token => {
          console.log("TOKEN (refreshUnsubscribe)", token);
          this.props.onChangeToken(token);
        });

        this.setState({
            messages: GiftedChat.append(this.state.messages, messages),
        });
        console.log("message", messages)
        messages.forEach(message => {
            var now = new Date().getTime()
            this.chatRef.push({
                _id: now,
                text: message.text,
                createdAt: now,
                uid: this.user.uid,
                order: -1 * now
            })
        })

    }
    render() {
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={this.onSend.bind(this)}
                user={{
                    _id: this.user.uid,
                }}
                />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        marginRight: 10,
        marginLeft: 10
    }
})
