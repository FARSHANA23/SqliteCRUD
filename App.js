import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("db.db"); //creating a db

function Items({ done: doneHeading, onPressItem }) {
  //declaring function called items passing doneheading to it
  const [items, setItems] = React.useState(null); //items will be null u,setItems fn that works with items

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from items where done = ?;`, //selecting items
        [doneHeading ? 1 : 0], //passing whether ur done or not
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  const heading = doneHeading ? "Completed" : "Todo"; //if 1 heading =completed

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, done, value }) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: done ? "#1c9963" : "#fff",
            borderColor: "#000",
            borderWidth: 1,
            padding: 8,
          }}
        >
          <Text style={{ color: done ? "#fff" : "#000" }}>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [text, setText] = React.useState(null); //useState is a hook that initialises text as state variable steText is function that makes changes to text variable
  const [forceUpdate, forceUpdateId] = useForceUpdate(); //calling useForceUpdate function that returns  value+1 in forcUpdate and value+1 in forceUpdateID

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text);" //creating a table with id,done,value
      );
    });
  }, []);

  const add = (text) => {
    ///function that takes in a text
    // is text empty?
    if (text === null || text === "") {
      return false; //and returns false if the text is null
    }
    //if text is not false
    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [text]); //passing 0 to done and text to the value
        tx.executeSql(
          "select * from items",
          [],
          (
            _,
            { rows } //not passing anything to this
          ) => console.log(JSON.stringify(rows)) //this is to see the rows in console log
        );
      },
      null,
      forceUpdate
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SQLite Example</Text>
      <View style={styles.flexRow}>
        <TextInput
          onChangeText={(text) => setText(text)}
          onSubmitEditing={() => {
            add(text); //add function puts this text into the db
            setText(null);
          }}
          placeholder="what do you need to do?"
          style={styles.input}
          value={text}
        />
      </View>
      <ScrollView style={styles.listArea}>
        <Items
          key={`forceupdate-todo-${forceUpdateId}`}
          done={false}
          onPressItem={(
            id //this is when todo item is checked passing id into a fu
          ) =>
            db.transaction(
              (tx) => {
                tx.executeSql(`update items set done = 1 where id = ?;`, [id]); //setting doen =1 foe particular id
              },
              null,
              forceUpdate
            )
          }
        />
        <Items
          done
          key={`forceupdate-done-${forceUpdateId}`}
          onPressItem={(id) =>
            db.transaction(
              (tx) => {
                tx.executeSql(`delete from items where id = ?;`, [id]);
              },
              null,
              forceUpdate
            )
          }
        />
      </ScrollView>
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0); //value is state variable and setValue is a fn making some change to it
  return [() => setValue(value + 1), value]; // returns value+1 and value
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  input: {
    borderColor: "#4630eb",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
});
