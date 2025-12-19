/**
 * ENSURE 14 DAYS
 * 
 * Ensures plan has exactly 14 days, fills in missing days
 */
function ensure14Days(planArray, type, startDate) {
    const fixedArray = [];
    const start = startDate;

    for (let i = 0; i < 14; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        // Find existing day or create empty
        let existingDay = planArray?.find(d => d.day === (i + 1));

        if (!existingDay) {
            console.warn(`⚠️ Missing Day ${i + 1} in ${type}. Filling with empty day.`);
            if (i > 0 && fixedArray[i - 1]) {
                existingDay = JSON.parse(JSON.stringify(fixedArray[i - 1]));
                existingDay.day = i + 1;
            } else {
                existingDay = { day: i + 1, [type === 'meal' ? 'meals' : 'workouts']: [] };
            }
        }
        existingDay.date = currentDate;
        fixedArray.push(existingDay);
    }

    return fixedArray;
}

module.exports = ensure14Days;
