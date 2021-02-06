const newEventBtn = document.querySelector('.event-create');
const calendar = document.querySelector('#calendar');
const eventName = document.querySelector('#event-name');
const eventTime = document.querySelector('#time'); // element of modal
const eventDay = document.querySelector('#day'); // element of modal
const modalHeader = document.querySelector('.modal-header');
const eventFailed = document.querySelector('.event-failed'); // modal-header text of warning
const chooseEventMember = document.querySelector('#members'); // selector for events filter
let iDragged; // 2d array coordinates of dragged event
let jDragged; // 2d array coordinates of dragged event

// create 2d array 10x6
let allEventsData;

// html calendar grid create
const drawCalendar = () => {
  let row;
  let col;
  const heading = new Array('Time', 'Mon', 'Thu', 'Wed', 'Thu', 'Fri'); // column names

  for (let i = 0; i < 10; i += 1) {
    row = document.createElement('div');
    row.classList.add('row');
    if (i === 0) {
      row.classList.add('heading');
    }
    calendar.appendChild(row);

    for (let j = 0; j < 6; j += 1) {
      col = document.createElement('div');
      col.classList.add('col', 'border');
      row.appendChild(col);
      if (row.classList.contains('heading')) {
        col.innerHTML = heading[j];
      } else if (j === 0) {
        col.innerHTML = `1${i - 1}:00`; // 10:00, 11:00, 12:00 etc
      }
    }
  }
};

const handleWarrning = () => {
  if (allEventsData[eventTime.value][eventDay.value] !== null) { // calendar slot is booked
    eventFailed.innerHTML = 'Failed to create an event. Time slot is already booked.';
    modalHeader.classList.add('warning');
  } else {
    eventFailed.innerHTML = '';
    modalHeader.classList.remove('warning');
  }
};

const saveDragGlobals = (dragObj, i, j) => { // dragObj is dragged slot
  setTimeout(() => {
    dragObj.classList.add('hide');
  }, 0);
  iDragged = i; // pass to drop handler
  jDragged = j;// pass to drop handler
};

const eventDelete = (i, j) => {
  if (window.confirm(`Are you sure you want to delete "${allEventsData[i][j].eventName}" event?`)) {
    const cell = calendar.querySelectorAll('.row')[i].children[j];
    allEventsData[i][j] = null;
    cell.innerHTML = '';
    cell.style.backgroundColor = '#fff';
    localStorage.setItem('event', JSON.stringify(allEventsData));
  }
};

const drawEvent = (arr) => {
  calendar.innerHTML = '';
  drawCalendar();
  for (let i = 1; i < 10; i += 1) {
    for (let j = 1; j < 6; j += 1) {
      const cell = calendar.querySelectorAll('.row')[i].children[j];
      if (arr[i][j] == null) {
        // drag and drop
        cell.addEventListener('dragover', (e) => {
          e.preventDefault();
        });
        cell.addEventListener('dragenter', () => {
          cell.classList.add('hovered');
        });
        cell.addEventListener('dragleave', () => {
          cell.classList.remove('hovered');
        });
        cell.addEventListener('drop', () => {
          getDropGlobals(i, j, cell);
        });
      } else {
        cell.classList.add('event');
        const cellTitle = document.createElement('p');
        const cellText = document.createElement('p');
        const btn = document.createElement('button');
        btn.classList.add('event-delete', 'close');
        const cross = document.createElement('span');
        cross.textContent = 'x';

        btn.appendChild(cross);
        cell.append(cellTitle);
        cell.append(cellText);
        cell.prepend(btn);

        cellTitle.innerHTML = `${arr[i][j].eventName}`;
        cellTitle.classList.add('event-title');
        cellText.innerHTML = `<br> ${arr[i][j].participants.join(', ')}`;

        // drag and drop
        cell.setAttribute('draggable', true);
        cell.addEventListener('dragstart', () => { saveDragGlobals(cell, i, j); });
        cell.addEventListener('dragend', () => {
          cell.classList.remove('hide');
        });

        // deletion of the event
        btn.addEventListener('click', () => { eventDelete(i, j); });
      }
    }
  }
};

function getDropGlobals(i, j, cell) {
  allEventsData[i][j] = allEventsData[iDragged][jDragged];
  allEventsData[iDragged][jDragged] = null;
  cell.classList.remove('hovered');
  drawEvent(allEventsData);
  localStorage.setItem('event', JSON.stringify(allEventsData));
}

// Event creation and its data saving
const createEvent = () => {
  if (eventName.value === '') {
    window.alert('You should name your meeting!');
    return;
  }
  const selected = document.querySelectorAll('#participants option:checked');
  const eventParticipants = Array.from(selected).map((el) => el.value);

  if (eventParticipants.length === 0) {
    window.alert('You should choose the participants!');
    return;
  }
  const data = {};
  data.eventName = eventName.value;
  data.eventTime = eventTime.value;
  data.eventDay = eventDay.value;
  data.participants = eventParticipants;

  if (allEventsData[data.eventTime][data.eventDay] == null) {
    allEventsData[data.eventTime][data.eventDay] = data;
  } else {
    eventFailed.innerHTML = 'Failed to create an event. Time slot is already booked.';
    modalHeader.classList.add('warning');
    return;
  }

  localStorage.setItem('event', JSON.stringify(allEventsData));
  document.querySelector('.close').click(); // trigger click to close modal window

  drawEvent(allEventsData);
};

const selectMember = () => {
  allEventsData = JSON.parse(localStorage.getItem('event'));
  const chosenMember = chooseEventMember.value;

  if (chosenMember !== 'all') { // if certain person selected
    for (let i = 1; i < 10; i += 1) {
      for (let j = 1; j < 6; j += 1) {
        if (allEventsData[i][j] !== null) {
          if (!allEventsData[i][j].participants.includes(chosenMember)) {
            allEventsData[i][j] = null;
          }
        }
      }
    }
  }
  drawEvent(allEventsData);
};

// page load
drawCalendar();

// // draw data from the local storage
allEventsData = JSON.parse(localStorage.getItem('event'));
if (allEventsData == null) {
  allEventsData = new Array(10);
  for (let i = 0; i < 10; i += 1) {
    allEventsData[i] = new Array(null, null, null, null, null, null);
  }
} else {
  drawEvent(allEventsData);
}

newEventBtn.addEventListener('click', createEvent); // button 'Create' of modal
eventTime.addEventListener('click', handleWarrning);
eventDay.addEventListener('click', handleWarrning);
chooseEventMember.addEventListener('change', selectMember);
