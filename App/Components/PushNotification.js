import React, { Component } from "react";

import FCM, {FCMEvent} from "react-native-fcm";

export default class PushNotification extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

    // this method generate fcm token.
    FCM.requestPermissions();
    FCM.getFCMToken().then(token => {
      console.log("TOKEN (getFCMToken)", token);
    });

    // This method get all notification from server side.
    FCM.getInitialNotification().then(notification => {
      console.log("INITIAL NOTIFICATION", notification)
      this.sendRemote(notification);
    });

    // This method give received notifications to mobile to display.
    this.notificationUnsubscribe = FCM.on(FCMEvent.Notification, notification => {
      console.log("a", notification);
      if (notification && notification.local_notification) {
        return;
      }
      this.sendRemote(notification);
    });

    // this method call when FCM token is update(FCM token update any time so will get updated token from this method)
    this.refreshUnsubscribe = FCM.on(FCMEvent.RefreshToken, token => {
      console.log("TOKEN (refreshUnsubscribe)", token);
      this.props.onChangeToken(token);
    });
  }

  // This method display the notification on mobile screen.
  sendRemote(notification) {
    console.log('send');
    FCM.presentLocalNotification({
      title: notification.title,
      body: notification.body,
      priority: "high",
      click_action: notification.click_action,
      show_in_foreground: true,
      local: true
    });
  }
  // componentWillMount() {
  //   FCM.subscribeToTopic('/topics/foo-bar');
  //   FCM.unsubscribeFromTopic('/topics/foo-bar');
  // }
  componentWillUnmount() {
    this.refreshUnsubscribe();
    this.notificationUnsubscribe();
  }
  render() {
    return null;
  }
}
