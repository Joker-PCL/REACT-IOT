export const dateFormat = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // ให้แสดงเวลาในรูปแบบ 24 ชั่วโมง
};

// แปลง วันที่, เวลา "2023-09-18T05:30:00.000Z" TO "2023-09-18T12:30"
export const convertToDateTimeLocal = (isoDateTime) => {
    const date = new Date(isoDateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

    return dateTimeLocal;
}

// แปลง วันที่, เวลา "2023-09-18T05:30:00.000Z" TO "2023-09-18"
export const convertToDateLocal = (isoDateTime) => {
    const date = new Date(isoDateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dateLocal = `${year}-${month}-${day}`;

    return dateLocal;
}

export const convertTimeLocal = (isoTime) => {
    const time = new Date();
    time.setHours(isoTime.split(":")[0]);
    time.setMinutes(isoTime.split(":")[1]);

    return time;
}

// แปลง ms to time
export const timeDifFormat = (time) => {
    if (!time) return null;
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const timeDifFormat = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return timeDifFormat;
}

export const timeToMinutes = (time) => {
    if (!time) return null;
    const _hours = time.split(':')[0];
    const _minutes = time.split(':')[1];
    const minutes = (Number(_hours) * 60) + Number(_minutes);

    return minutes;
}

// หาผลรวมเวลา [hh:mm, hh:mm] **แบบ array**
export const SumOfDuration = (timeArray) => {
    const time_duration = timeArray.reduce((total, time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return total + hours * 60 + minutes;
    }, 0);

    const hoursResult = Math.floor(time_duration / 60);
    const minutesResult = time_duration % 60;

    const totalTime = `${hoursResult.toString().padStart(2, '0')}:${minutesResult.toString().padStart(2, '0')}`;
    return totalTime;
}

// คำนวณเวลาตามแผน 05:30 * 2 return 11:00
export const multiplyTime = (timeString, multiplier) => {
    if (!timeString || !multiplier) return null;

    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    const totalSeconds = (hours * 3600 + minutes * 60 + seconds) * multiplier;

    const newHours = Math.floor(totalSeconds / 3600);
    const remainderSeconds = totalSeconds % 3600;
    const newMinutes = Math.floor(remainderSeconds / 60);

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}