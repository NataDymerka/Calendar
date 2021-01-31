console.log('working!');

const newEventBtn = document.querySelector('.event-create');
const form = document.querySelector('.modal-form');
const calendar = document.querySelector('#calendar');
const eventName = document.querySelector('#event-name');
const eventTime = document.querySelector('#time');
const eventDay = document.querySelector('#day');
const modal = document.querySelector('.modal');
const modalHeader = document.querySelector('.modal-header');
const eventFailed = document.querySelector('.event-failed');
const chooseEventMember = document.querySelector('#members');
let iDragged;
let jDragged;


let allEventsData = new Array(10);
for (let i = 0; i < 10; i++) {
    allEventsData[i] = new Array(null, null, null, null, null, null);
}

const drawCalendar = () => {
    let row;
    let col;
    const heading = new Array('Time', 'Mon', 'Thu', 'Wed', 'Thu', 'Fri');

    for (let i = 0; i < 10; i++) {
        row = document.createElement('div');
        row.classList.add('row');
        calendar.appendChild(row);
        calendar.firstElementChild.classList.add('heading');

        for (let j = 0; j < 6; j++) {
            col = document.createElement('div');
            col.classList.add('col', 'border');
            row.appendChild(col);
            if (row.classList.contains('heading')) {
                col.innerHTML = heading[j];
            }
            else {
                row.firstElementChild.innerHTML = `1${i - 1}:00`;
            }
        }
    }
}
drawCalendar();

const handleWarrning = function (e) {
    if (allEventsData[eventTime.value][eventDay.value] !== null) {
        eventFailed.innerHTML = "Failed to create an event. Time slot is already booked."
        modalHeader.classList.add('warning');
    } else {
        eventFailed.innerHTML = ""
        modalHeader.classList.remove('warning');
    }
};

const drawEvent = function (arr) {
    calendar.innerHTML = '';
    drawCalendar();
    for (let i = 1; i < 10; i++) {
        for (let j = 1; j < 6; j++) {
            if (arr[i][j] == null) {
                let cell = calendar.querySelectorAll('.row')[i].children[j];
                cell.innerHTML = '';
                cell.classList.remove('event');

                //drag and drop
                cell.addEventListener('dragover', function (e) {
                    e.preventDefault();
                    console.log('over');
                });
                cell.addEventListener('dragenter', function () {
                    this.classList.add('hovered');
                    console.log('enter');
                });
                cell.addEventListener('dragleave', function () {
                    this.classList.remove('hovered');

                    console.log('leave');
                });
                cell.addEventListener('drop', function () {
                    arr[i][j] = arr[iDragged][jDragged];
                    arr[iDragged][jDragged] = null;
                    this.classList.remove('hovered');
                    console.log(arr);
                    drawEvent(arr);
                    localStorage.setItem('event', JSON.stringify(arr));

                });

            } else {
                let cell = calendar.querySelectorAll('.row')[i].children[j];
                cell.innerHTML = '';
                cell.classList.add('event');

                let cellText = document.createElement('p');
                let btn = document.createElement('button');
                btn.classList.add('event-delete', 'close');
                let cross = document.createElement('span');
                cross.textContent = 'x';

                btn.appendChild(cross);
                cell.prepend(cellText);
                cell.append(btn);

                cellText.innerHTML = `${arr[i][j].eventName} <br> ${arr[i][j].participants}`;
                //drag and drop
                cell.setAttribute('draggable', true);
                cell.addEventListener('dragstart', function (e) {
                    setTimeout(() => {
                        this.classList.add('hide');
                    }, 0)
                    iDragged = i;
                    jDragged = j;
                    console.log(i, j);
                }
                );
                cell.addEventListener('dragend', function () {
                    this.classList.remove('hide');
                });

                //deletion of the event
                btn.addEventListener('click', function (e) {
                    console.log(arr[i][j]);
                    if (confirm(`Are you sure you want to delete "${arr[i][j].eventName}" event?`)) {

                        arr[i][j] = null;
                        cell.innerHTML = '';
                        cell.style.backgroundColor = '#fff';
                        localStorage.setItem('event', JSON.stringify(arr));

                    }
                });
            }
        }
    }
}


//draw data from the local storage
allEventsData = JSON.parse(localStorage.getItem('event'));

drawEvent(allEventsData);

//создание события в календаре и сохранения данных о нем.
const createEvent = function (e) {
    if (eventName.value === '') {
        alert('You should name your meeting!');
        return;
    }
    const selected = document.querySelectorAll('#participants option:checked');
    const eventParticipants = Array.from(selected).map(el => el.value);
    console.log(eventParticipants);

    if (eventParticipants.length === 0) {
        alert('You should choose the participants!');
        return;
    }
    let data = {};
    console.log(data);
    data.eventName = eventName.value;
    data.eventTime = eventTime.value;
    data.eventDay = eventDay.value;
    data.participants = eventParticipants;
    console.log(data);

    if (allEventsData[data.eventTime][data.eventDay] == null) {
        allEventsData[data.eventTime][data.eventDay] = data;
    } else {
        eventFailed.innerHTML = "Failed to create an event. Time slot is already booked."
        modalHeader.classList.add('warning');
        return;
    }

    //set data to the local storage
    localStorage.setItem('event', JSON.stringify(allEventsData));


    drawEvent(allEventsData);
};
//eventListener on ALl Members => change view of the calendarnewn
newEventBtn.addEventListener('click', createEvent);
eventTime.addEventListener('click', handleWarrning);
eventDay.addEventListener('click', handleWarrning);
console.log(allEventsData);

const selectMember = function () {

    allEventsData = JSON.parse(localStorage.getItem('event'));
    let chosenMember = chooseEventMember.value;
    // console.log(chosenMember);

    if (chosenMember !== 'all') {
        for (let i = 1; i < 10; i++) {
            for (let j = 1; j < 6; j++) {
                if (allEventsData[i][j] !== null) {
                    // console.log(allEventsData[i][j].participants);
                    // console.log(allEventsData[i][j].participants.includes(chosenMember));

                    if (!allEventsData[i][j].participants.includes(chosenMember)) {
                        allEventsData[i][j] = null;
                    }
                }

            }
        }
    }
    drawEvent(allEventsData);
}

chooseEventMember.addEventListener('change', selectMember);

