import firebase from "../configs/firebase";
import axios from "axios";
import {
  FETCH_USER,
  FETCH_USER_SUCCESS,
  FETCH_USER_CLEAR,
  FETCH_CONTENT_SUCCESS,
  FETCH_CONTENT_FEEDS,
  FETCH_CONTENT_SYS
} from "../configs/constants";
import { hist } from "../index.js";
const db = firebase.firestore();

//!---------------------------- AUTH ---------------------------------
export const checkAuth = dispatch =>
  new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const dataUser = user.providerData[0];
        var payload = {
          displayName: dataUser.displayName,
          uid: user.uid,
          photoURL: dataUser.photoURL
        };

        const userRef = db.collection("users").doc(user.uid);
        db.runTransaction(transaction => {
          transaction.get(userRef).then(userDoc => {
            if (!userDoc.exists) {
              payload = { ...payload, digged: 0, star: 0 };
              userRef.set(payload);
            } else {
              // เผื่อดึงข้อมูล
              payload = {
                ...payload,
                digged: userDoc.data().digged,
                star: userDoc.data().star
              };
              transaction.update(userRef, payload);
            }

            dispatch({
              type: FETCH_USER_SUCCESS,
              payload: payload
            });
            return resolve("SUCCESS");
          });
        });
      } else {
        dispatch({ type: FETCH_USER_CLEAR });
        // not login yet
        return resolve("please login");
      }
    });
  });

export const signOut = () => dispatch => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      dispatch({ type: FETCH_USER });
    });
  hist.push("/login");
};

//!--------------------------Leaderboards ------------------------//

export const fetchLeaderboards = () => (dispatch, getState) => {
  db.collection("users").limit(8)
    .orderBy("star", "desc")
    .onSnapshot(snap => {
      var usersList = [];
      snap.forEach(userRef => {
        usersList.push({ data: userRef.data(), id: userRef.id });
      });
      dispatch({ type: FETCH_CONTENT_SUCCESS, payload: usersList });
    });
};
export const fetchUserScore = uid =>
  new Promise((resolve, reject) => {
    db.collection("lotto")
      .where("ownerUid", "==", uid)
      .onSnapshot(snap => {
        var list = [];
        snap.forEach(lottoRef => {
          list.push({ ...lottoRef.data(), id: lottoRef.id });
        });
        list = list.sort((a, b) => {
          return b.date.toDate() - a.date.toDate();
        });
        resolve(list);
      });
  });

export const fetchFeeds = () => dispatch => {
  db.collection("lotto")
    .orderBy("date","desc").limit(10)
    .onSnapshot(snap => {
      var list = [];
      snap.forEach(lottoRef => {
        list.push({ ...lottoRef.data(), id: lottoRef.id });
      });
      dispatch({type:FETCH_CONTENT_FEEDS ,feeds:list})
    });
};

export const fetchSystem = () => dispatch => {
  db.collection("systems").doc('lotto')
    .onSnapshot(snap => {
      dispatch({type:FETCH_CONTENT_SYS ,system:snap.data()})
    });
};

//!--------------------------Lotto ------------------------//

export const sendLotto = image => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const { auth } = getState();
    var payload = {
      ownerUid: auth.data.uid,
      date: new Date()
    };
    db.collection("lotto")
      .add(payload)
      .then(ref => {
        //upload image to Storage
        //firebase.storage().ref('lotto').child(ref.id+".jpg").put(  image file   )
        firebase
          .storage()
          .ref()
          .child("/" + ref.id + ".jpg")
          .put(image)
          .then(() => {
            axios
              .get(
                "https://us-central1-stupidhackth3-a65a8.cloudfunctions.net/Dignumber",
                { params: { data: ref.id + ".jpg" } }
              )
              .then(res => {
                let ResponseData = res.data[0].textAnnotations;
                if (ResponseData == null || []) {
                  return resolve({
                    data: [0, 9, 1, 7, 4, 8, 6, 3, 7, 3],
                    id: ref.id
                  });
                }
                ResponseData.map(item => {
                  function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                  }

                  let Huay = item.description.match(/\d/g).map(Number);
                  let uniqueHuay = Huay.filter(onlyUnique);

                  console.log(uniqueHuay);
                  resolve({
                    data: uniqueHuay.sort(),
                    id: ref.id
                  });
                  // เอา uniqueHuay ไปใช้ได้เลย
                });
              })
              .catch(err => {});
          });
      });
  });
};
export const sendNumLotto = (numList, Lid) => (dispatch, getState) => {
  const { auth } = getState();
  db.collection("lotto")
    .doc(Lid)
    .update({
      lotto: numList,
      date: new Date(),
      ownerUid: auth.data.uid,
      checked: false
    });
};

export const getImgfromStorage = fileName => {
  return new Promise((resolve, reject) => {
    firebase
      .storage()
      .ref()
      .child(fileName)
      .getDownloadURL()
      .then(url => {
        return resolve(url);
      })
      .catch(e => console.warn(e));
  });
};

export const getUserFromUid = uid =>
  new Promise((resolve, reject) =>
    db
      .collection("users")
      .doc(uid)
      .get()
      .then(userRef => {
        return resolve(userRef.data());
      })
      .catch(error => {
        console.log(error);
        return reject({
          displayName: "?????"
        });
      })
  );