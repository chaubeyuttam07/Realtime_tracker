const socket = io();

let shouldAutoCenter = true;

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Geo-Tracker",
}).addTo(map);

const markers = {};

map.on("movestart", () => {
    shouldAutoCenter = false; // Disable auto-centering when the user starts moving the map
});

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
    if (shouldAutoCenter) {
        map.setView([latitude, longitude], map.getZoom());
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
