class EventEmitter {
  constructor() {
    this.events = {}; // An object to hold events
  }

  // Adds event listener
  on(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  // Publishes (emit) the event
  emit(eventName, data) {
    if (this.events[eventName]) {
      // If there is an event, send data to the listeners
      this.events[eventName].forEach(listener => listener(data));
    }
  }

  // Removes the event listener
  off(eventName, listener) {
    if (!this.events[eventName]) return;

    this.events[eventName] = this.events[eventName].filter(l => l !== listener);
  }
}

export default EventEmitter;