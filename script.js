// PS! Replace this with your own channel ID
// If you use this channel ID your app will stop working in the future
const CLIENT_ID = 's3lu0PvSpTTgJMS3';

const drone = new ScaleDrone(CLIENT_ID, {
  data: { // Will be sent out as clientData via events
    name: getRandomName(),
    color: getRandomColor(),
  },
});

let members = [];
let messages = [];

if (localStorage.getItem('chatMessages')) {
  messages = JSON.parse(localStorage.getItem('chatMessages'));
}

drone.on('open', error => {
  if (error) {
    return console.error(error);
  }
  console.log('Successfully connected to Scaledrone');

  const room = drone.subscribe('observable-room');
  room.on('open', error => {
    if (error) {
      return console.error(error);
    }
    console.log('Successfully joined room');
  });

  room.on('members', m => {
    members = m;
    updateMembersDOM();
  });

  room.on('member_join', member => {
    members.push(member);
    updateMembersDOM();
  });

  room.on('member_leave', ({id}) => {
    const index = members.findIndex(member => member.id === id);
    members.splice(index, 1);
    updateMembersDOM();
  });

  room.on('data', (text, member) => {
    if (member) {
      addMessageToListDOM(text, member);
      messages.push({ text, member });
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } else {
      // Message is from server
    }
  });

  messages.forEach(message => {
    addMessageToListDOM(message.text, message.member);
  });
});

drone.on('close', event => {
  console.log('Connection was closed', event);
});

drone.on('error', error => {
  console.error(error);
});

function getRandomName() {
  const char1 = [
    "Lelouch",
    "Light",
    "Naruto",
    "Ichigo",
    "Monkey",
    "Natsu",
    "Edward",
    "Erza",
    "Roronoa",
    "Luffy",
    "Rukia",
    "Gintoki",
    "Alphonse",
    "Kagome",
    "Sousuke",
    "Gaara",
    "Hinata",
    "Itachi",
    "Orihime",
    "Ken"
  ];
  const char2 = [
    "Eren",
    "Levi",
    "Mikasa",
    "Goku",
    "Vegeta",
    "Naruto",
    "Sasuke",
    "Tanjiro",
    "Zenitsu",
    "Inosuke",
    "Deku",
    "Bakugo",
    "Todoroki",
    "Luffy",
    "Zoro",
    "Sanji",
    "Gon",
    "Killua",
    "Saitama",
    "Genos"
  ];
  return (
    char1[Math.floor(Math.random() * char1.length)] +
    "_" +
    char2[Math.floor(Math.random() * char2.length)]
  );
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

//------------- DOM STUFF

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
  form: document.querySelector('.message-form'),
};

DOM.form.addEventListener('submit', sendMessage);

function sendMessage() {
  const value = DOM.input.value;
  if (value === '') {
    return;
  }
  DOM.input.value = '';
  drone.publish({
    room: 'observable-room',
    message: value,
  });
}

function createMemberElement(member) {
  const { name, color } = member.clientData;
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(name));
  el.className = 'member';
  el.style.color = color;
  return el;
}

function updateMembersDOM() {
  DOM.membersCount.innerText = `${members.length} users in room:`;
  DOM.membersList.innerHTML = '';
  members.forEach(member =>
    DOM.membersList.appendChild(createMemberElement(member))
  );
}

function createMessageElement(text, member) {
  const el = document.createElement('div');
  el.appendChild(createMemberElement(member));
  el.appendChild(document.createTextNode(text));
  el.className = 'message';
  return el;
}

function addMessageToListDOM(text, member) {
  const el = DOM.messages;
  const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
  el.appendChild(createMessageElement(text, member));
  if (wasTop) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
}
