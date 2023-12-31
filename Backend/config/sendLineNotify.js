const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');

const default_token = "j6SaVhnQo0Vd25Taip5NDCR2CJzWJImSsyL7tR6E9YX";

exports.sendLineNotify = async (token = default_token, message, imageFilePath = "") => {
    try {
        const form = new FormData();

        if (imageFilePath) {
            const resizedImage = await sharp(imageFilePath)
                .resize({
                    fit: sharp.fit.inside,
                    withoutEnlargement: true,
                    width: 150,
                    height: 150,
                })
                .toBuffer();
            form.append('message', message);
            form.append('imageFile', resizedImage, 'image.jpg');
        } else {
            form.append('message', message);
        }

        const config = {
            method: 'post',
            url: 'https://notify-api.line.me/api/notify',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders(),
            },
            data: form,
        };

        const response = await axios(config);
        console.log('Notify Success', response.data);

        return { success: true, message: 'Notification sent successfully' };
    } catch (err) {
        console.error('Notify Error:', err.message);
        return { success: false, message: 'Failed to send notification' };
    }
};

