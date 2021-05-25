import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import './Chat.css';
import InfoBar from '../InfoBar/InfoBar.js';
import Input from '../Input/Input.js';
import Messages from '../Messages/Messages.js';
import TextContainer from '../TextContainer/TextContainer.js';

let socket;

const Chat = ({location}) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  // const ENDPOINT = '192.168.0.4:5000';
  const ENDPOINT = 'https://simple-react-chat-server.herokuapp.com/';
  

  useEffect(() => {
    const {name,room} = queryString.parse(location.search);
    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);
    console.log(socket);
    socket.emit('join',{name, room}, ()=>{});

    return()=>{
      socket.emit('disconnect');
      socket.off();
    };
  },[ENDPOINT, location.search]);

  useEffect(()=>{
    socket.on('message', message=>{
      setMessages([...messages,message]);
    })
  }, [messages]);

  useEffect(()=>{
    socket.on('roomData', ({users})=>{
      setUsers([...users]);
    })
  }, [users]);

  const sendMessage = event => {
    event.preventDefault();
    if(message) {
      socket.emit('sendMessage', message, ()=>setMessage(''));
    }
  };



  console.log(message, messages);

  return (
    <div className="outerContainer">
      <TextContainer users={users} />
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
    </div>
  );
};


export default Chat;