import EventSource from "eventsource";
const events = new EventSource('http://localhost:3000/connect?id=1&x=38.8022823790573&y=-77.26591723910241');
events.onmessage = (event) => {
    console.log(event.data);
}