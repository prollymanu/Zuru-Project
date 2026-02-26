/**
 * Checks if a restaurant is currently open based on its hours.
 * @param {string} hours - The hours string (e.g., "08:00 - 22:00" or "24/7").
 * @returns {object} { isOpen: boolean, statusText: string }
 */
export const getRestaurantStatus = (hours) => {
    if (!hours) return { isOpen: false, statusText: "Status Unknown" };
    if (hours === '24/7') return { isOpen: true, statusText: "Open Now • 24/7" };

    try {
        const [openTime, closeTime] = hours.split(' - ');
        if (!openTime || !closeTime) return { isOpen: false, statusText: "Hours Unavailable" };

        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMin;

        const [openH, openM] = openTime.split(':').map(Number);
        const [closeH, closeM] = closeTime.split(':').map(Number);
        const openTimeInMinutes = openH * 60 + openM;
        const closeTimeInMinutes = closeH * 60 + closeM;

        let isOpen = false;
        if (closeTimeInMinutes > openTimeInMinutes) {
            // Normal day shift (e.g., 08:00 - 22:00)
            isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
        } else {
            // Overnight shift (e.g., 18:00 - 02:00)
            isOpen = currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes;
        }

        if (isOpen) {
            return { isOpen: true, statusText: `Open Now • Closes ${closeTime}` };
        } else {
            return { isOpen: false, statusText: `Closed • Opens ${openTime}` };
        }
    } catch (err) {
        console.error("Error parsing hours:", err);
        return { isOpen: false, statusText: "Error calculating status" };
    }
};
