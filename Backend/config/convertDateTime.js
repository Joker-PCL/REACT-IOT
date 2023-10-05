exports.convertToDateTimeLocal = (isoDateTime) => {
    const date = new Date(isoDateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

    return dateTimeLocal;
}

exports.convertToDateLocal = (isoDateTime) => {
    const date = new Date(isoDateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dateLocal = `${year}-${month}-${day}`;

    return dateLocal;
}

exports.mergeDateAndTimeLocal = (isoDate, isoTime, increaseDay=0) => {
    if(!isoDate || !isoTime) return;
    const date = new Date(isoDate);
    date.setDate(date.getDate() + increaseDay);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dateTimeLocal = `${year}-${month}-${day}T${isoTime}`;

    return dateTimeLocal;
}