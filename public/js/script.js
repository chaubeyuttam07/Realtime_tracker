const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
        console.log(error);
    },
    {
        enableHighAccuracy: true,
        // timeout: 900000000000000000000000000000,
        maximumAge: 0,
    });
}

const map = L.map("map").setView([0, 0], 10);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Geo-Tracker"
}).addTo(map);

const markers = {};

socket.on("current-users", (users) => {
    for (const id in users) {
        const { latitude, longitude } = users[id];
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
    map.setView([latitude, longitude]);
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
