import axios from 'axios';
import express from 'express';

const app = express();
const PORT = 4000;

// Создаем экземпляр Axios
const apiInstance = axios.create({
    baseURL: 'https://api-mh.ertelecom.ru',
    headers: {
        'content-type': 'application/json'
    }
});

let token = null;
let timer = null

// Перехватчик ответа
apiInstance.interceptors.response.use(async (response) => {
    // Если ответ успешен, просто передаем его дальше
    return response;
}, async (error) => {
    if (error.response && error.response.status === 401) {
        // Если ошибка 401, пробуем обновить токен
        const tokenResponse = await getToken();
        console.log('Получили новый token', tokenResponse.token)
        if (tokenResponse.status === 200) {
            token = tokenResponse.token;
            // Устанавливаем новый токен и повторяем запрос
            error.config.headers.authorization = `Bearer ${token}`;
            return apiInstance(error.config);
        }
    }
    return Promise.reject(error);
});

const getToken = async () => {
    try {
        let promise = await apiInstance.post('/auth/v2/auth/780040122830/password', {
            "login": "780040122830",
            "timestamp": "2023-08-17T15:19:51.834000Z",
            "hash2": "E7B72E8DE46C6796FCEF86CD41521599",
            "hash1": "Y8Kt4y29AHRmJDZCtzGo1hYgJaw="
        });
        return { status: promise.status, token: promise.data.accessToken };
    } catch (error) {
        console.log('Получение токена', error.response.status, error.message);
        return { status: error.response.status, message: error.message };
    }
};


app.listen(PORT, () => {
    console.log('App is listening on port', PORT);
});

app.get('/open', async (req, res) => {
    timer = new Date().getTime()
    let result = await openDomofon();
    res.send(result.message);
});

const openDomofon = async () => {
    if (!token) {
        const tokenResponse = await getToken();
        if (tokenResponse.status !== 200) {
            return { status: tokenResponse.status, message: tokenResponse.message };
        }
        token = tokenResponse.token;
    }
    try {
        let promise = await apiInstance.post('/rest/v1/places/5626227/accesscontrols/63309/actions', { "name": "accessControlOpen" }, {
            headers: {
                authorization: `Bearer ${token}`,
                operator: 2
            }
        });
        if (promise.data.data.status) {
            console.log('Домофон открыт. Заняло ',new Date().getTime()-timer,' ms')
            return { status: 200, message: 'Домофон открыт' };
        } else {
            return { status: promise.data.data.status, message: promise.data.data.errorMessage };
        }
    } catch (error) {
        console.log('Открытие домофона', error.response.status, error.message);
        return { status: error.response.status, message: error.message };
    }
};
