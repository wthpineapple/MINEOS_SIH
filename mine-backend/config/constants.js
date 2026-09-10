module.exports = {
    SIMULATION_TICK_MS: 500,
    VEHICLE_COUNT: 6,

    DANGER_THRESHOLD: 70,
    CLEAR_THRESHOLD: 45,
    CONSECUTIVE_TICKS_REQUIRED: 3,

    CAUTION_COLOR_THREHOLD: 35,
    DANGER_COLOR_THRESHOLD: 65,

    PROXIMITY_RANGE: 100,
    PREDICTION_HORIZON_SECONDS: 2.5,

    VEHICLE_TYPES: {
        HAUL_TRUCK: { label: 'Haul truck', speedUnitsPerSec: 22, decelaration: 6, reactionTime: 2.2 },
        LIGHT_VEHICLE: { label: 'Light vehicle', speedUnitsPerSec: 38, decelaration: 14, reactiobTime: 1.2 }
    },

    PORT: process.env.PORT || 5000
};

